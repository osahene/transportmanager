"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaTimes } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../../lib/store";
import { updateCarStatus, fetchCars } from "../../../lib/slices/carsSlice";
import { createBooking, checkCarAvailability } from "../../../lib/slices/bookingsSlice";
import { Customer, Note } from "../../../types/customer";
import { Car } from "@/app/types/cars";
import { BookingSummary, Driver, PaymentMethod } from "../../../types/booking";
import {
  selectAvailablecars,
  selectDrivers,
  selectCustomers,
} from "../../../lib/slices/selectors";
import apiService from "@/app/lib/services/APIPath";
import CustomerSelectionSection from "../../../components/booking/CustomerSelectionSection";
import VehicleSelectionSection from "../../../components/booking/VehicleSelectionSection";
import BookingDetailsSection from "../../../components/booking/BookingDetailsSection";
import PaymentSummarySection from "../../../components/booking/PaymentSummarySection";
import ConfirmationModal from "../../../components/booking/ConfirmationModal";

// ---------- Pure helpers (moved outside component) ----------
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getMinDate = () => new Date().toISOString().split("T")[0];
const getMaxDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

// ---------- Generic nested state updater ----------
function createNestedUpdater<T extends object>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  pathSeparator = "_"
) {
  return (field: string, value: any) => {
    setter((prev) => {
      const keys = field.split(pathSeparator);
      if (keys.length === 1) return { ...prev, [field]: value };

      // deep clone to avoid mutation
      const newState = { ...prev } as any;
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };
}

// ---------- Validation schemas ----------
const REQUIRED_NEW_CUSTOMER_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "ghanaCardId",
  "occupation",
  "gpsAddress",
  "address.city",
  "address.region",
  "address.country",
] as const;

const REQUIRED_GUARANTOR_FIELDS = [
  "guarantor.firstName",
  "guarantor.lastName",
  "guarantor.phone",
  "guarantor.ghanaCardId",
  "guarantor.occupation",
  "guarantor.gpsAddress",
  "guarantor.relationship",
  "guarantor.address.city",
  "guarantor.address.region",
  "guarantor.address.country",
] as const;

const GHANA_PHONE_REGEX = /^(?:(?:\+?233|0)(?:\d{9}|\d{8}))$/;

// ---------- Helper to get nested property value ----------
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// ---------- Component ----------
export default function CreateBookingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux selectors
  const availableCars = useAppSelector(selectAvailablecars) as Car[];
  const drivers = useAppSelector(selectDrivers) as Driver[];
  const allCustomers = useAppSelector(selectCustomers) as Customer[];

  // ---------- Local UI state ----------
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer selection / search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Payment details
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [payInSlipDetails, setPayInSlipDetails] = useState({
    bankName: "",
    branch: "",
    payeeName: "",
    amount: 0,
    paymentDate: getMinDate(),
    referenceNumber: "",
    slipNumber: "",
  });
  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    transactionId: "",
    provider: "MTN",
    phoneNumber: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    carId: "",
    driverId: "",
    startDate: "",
    endDate: "",
    selfDrive: false,
    driverLicenseId: "",
    driverLicenseClass: "",
    driverLicenseIssueDate: "",
    driverLicenseExpiryDate: "",
    currentMileage: "",
    pickupLocation: "",
    dropoffLocation: "",
    specialRequests: "",
    totalAmount: 0,
    paymentMethod: "cash" as PaymentMethod,
    paymentStatus: "pending" as "pending" | "paid" | "failed",
  });

  // New customer
  const [newCustomer, setNewCustomer] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ghanaCardId: "",
    occupation: "",
    gpsAddress: "",
    address: { city: "", region: "", country: "" },
    joinDate: getMinDate(),
    status: "active",
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    preferredVehicleType: "",
    notes: "",
    tags: [] as string[],
    communicationPreferences: { email: true, sms: true, phone: false },
    guarantor: {
      id: generateId("GUAR"),
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      ghanaCardId: "",
      occupation: "",
      gpsAddress: "",
      relationship: "",
      address: { city: "", region: "", country: "" },
    },
    loyaltyTier: "bronze",
  });

  // ---------- Derived state (memoised) ----------
  const filteredCustomers = useMemo(() => {
    if (customerMode !== "existing") return [];
    const query = customerSearch.trim().toLowerCase();
    if (!query) return [];
    return allCustomers.filter((customer: Customer) => {
      return (
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
        (customer.email || "").toLowerCase().includes(query) ||
        (customer.phone || "").includes(customerSearch) ||
        (customer.ghanaCardId || "").toLowerCase().includes(query) ||
        (customer.gpsAddress || "").toLowerCase().includes(query)
      );
    });
  }, [allCustomers, customerSearch, customerMode]);

  // Total amount calculation – now a simple memo, no useEffect
  const totalAmount = useMemo(() => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const subtotal = dailyRate * days;
    return Math.max(0, subtotal - discount);
  }, [formData.carId, formData.startDate, formData.endDate, dailyRate, discount]);

  // Keep formData.totalAmount in sync (and payInSlip amount when needed)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, totalAmount }));
  }, [totalAmount]);


  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);
  // Synchronise payInSlip amount when payment method is pay_in_slip
  useEffect(() => {
    if (formData.paymentMethod === "pay_in_slip") {
      setPayInSlipDetails((prev) => ({ ...prev, amount: totalAmount }));
    }
  }, [totalAmount, formData.paymentMethod]);

  // ---------- Generic updaters (eliminates 4+ similar handlers) ----------
  const updatePayInSlip = createNestedUpdater(setPayInSlipDetails);
  const updateMobileMoney = createNestedUpdater(setMobileMoneyDetails);
  const updateNewCustomer = createNestedUpdater(setNewCustomer);
  const updateFormData = createNestedUpdater(setFormData);

  // ---------- Specialised handlers (keep same names for UI props) ----------
  const handleDailyRateChange = useCallback((value: number) => setDailyRate(value), []);
  const handleDiscountChange = useCallback((value: number) => setDiscount(value), []);

  const handlePayInSlipChange = useCallback(
    (field: string, value: string | number) => updatePayInSlip(field, value),
    [updatePayInSlip]
  );
  const handleMobileMoneyChange = useCallback(
    (field: string, value: string) => updateMobileMoney(field, value),
    [updateMobileMoney]
  );

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
  }, []);

  const handleCarSelect = useCallback((carId: string) => {
    setFormData((prev) => ({ ...prev, carId }));
  }, []);

  // Replaces both handleNewCustomerChange and handleExistingCustomerGuarantorChange
  const handleNewCustomerChange = useCallback(
    (name: string, value: string) => updateNewCustomer(name, value),
    [updateNewCustomer]
  );

  const handleCommunicationPrefChange = useCallback(
    (field: "email" | "sms" | "phone", value: boolean) => {
      setNewCustomer((prev: any) => ({
        ...prev,
        communicationPreferences: { ...prev.communicationPreferences, [field]: value },
      }));
    },
    []
  );

  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      updateFormData(field, value);
      // No need to manually sync payInSlip amount – handled by useEffect
    },
    [updateFormData]
  );

  const handleExistingCustomerGuarantorChange = useCallback(
    (field: string, value: string) => {
      if (!selectedCustomer) return;
      // Transform field name to match newCustomer's guarantor structure
      const newField = field.startsWith("guarantor_") ? field.replace("_", ".") : field;
      setSelectedCustomer((prev) => {
        if (!prev) return prev;
        const updated = { ...prev } as any;
        if (!updated.guarantor) {
          updated.guarantor = { id: generateId("GUAR"), address: { city: "", region: "", country: "" } };
        }
        const keys = newField.split(".");
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    },
    [selectedCustomer]
  );

  // ---------- Validation (single source of truth) ----------
  const isFormValid = useMemo(() => {
    // 1. Customer validation
    if (customerMode === "existing") {
      if (!selectedCustomer) return false;
    } else {
      // new customer
      for (const field of REQUIRED_NEW_CUSTOMER_FIELDS) {
        if (!getNestedValue(newCustomer, field)?.trim()) return false;
      }
      for (const field of REQUIRED_GUARANTOR_FIELDS) {
        if (!getNestedValue(newCustomer, field)?.trim()) return false;
      }
    }

    // 2. Booking basics
    if (!formData.carId || !formData.startDate || !formData.endDate) return false;
    if (dailyRate <= 0) return false;
    if (discount < 0) return false;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) return false;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    if (discount > dailyRate * days) return false;

    // 3. Self‑drive vs driver
    if (formData.selfDrive) {
      if (
        !formData.driverLicenseId?.trim() ||
        !formData.driverLicenseClass?.trim() ||
        !formData.driverLicenseIssueDate ||
        !formData.driverLicenseExpiryDate
      ) return false;
      const expiry = new Date(formData.driverLicenseExpiryDate);
      if (expiry < new Date()) return false;
    } else {
      if (!formData.driverId) return false;
    }

    // 4. Payment method specifics
    if (formData.paymentMethod === "pay_in_slip") {
      if (
        !payInSlipDetails.bankName.trim() ||
        !payInSlipDetails.branch.trim() ||
        !payInSlipDetails.payeeName.trim() ||
        !payInSlipDetails.referenceNumber.trim() ||
        !payInSlipDetails.slipNumber.trim()
      ) return false;
    }
    if (formData.paymentMethod === "mobile_money") {
      if (!mobileMoneyDetails.phoneNumber.trim()) return false;
      if (!GHANA_PHONE_REGEX.test(mobileMoneyDetails.phoneNumber)) return false;
    }

    return true;
  }, [customerMode, selectedCustomer, newCustomer, formData, dailyRate, discount, payInSlipDetails, mobileMoneyDetails]);

  const validateForm = useCallback((): boolean => {
    if (!isFormValid) {
      // Re‑run detailed checks to show specific alert (preserve original UX)
      if (customerMode === "existing" && !selectedCustomer) alert("Please select an existing customer");
      else if (customerMode === "new") {
        if (!newCustomer.firstName.trim() || !newCustomer.lastName.trim()) alert("Please enter customer name");
        else if (!newCustomer.phone.trim()) alert("Please enter customer phone number");
        else if (!newCustomer.ghanaCardId.trim()) alert("Please enter customer Ghana Card ID");
        else if (!newCustomer.occupation.trim()) alert("Please enter customer occupation");
        else if (!newCustomer.gpsAddress.trim()) alert("Please enter customer GPS address");
        else if (!newCustomer.address.city.trim()) alert("Please enter customer city");
        else if (!newCustomer.address.region.trim()) alert("Please enter customer region");
        else if (!newCustomer.address.country.trim()) alert("Please enter customer country");
        else if (!newCustomer.guarantor.firstName.trim()) alert("Please enter guarantor first name");
        else if (!newCustomer.guarantor.lastName.trim()) alert("Please enter guarantor last name");
        else if (!newCustomer.guarantor.phone.trim()) alert("Please enter guarantor phone number");
        else if (!newCustomer.guarantor.ghanaCardId.trim()) alert("Please enter guarantor Ghana Card ID");
        else if (!newCustomer.guarantor.occupation.trim()) alert("Please enter guarantor occupation");
        else if (!newCustomer.guarantor.gpsAddress.trim()) alert("Please enter guarantor GPS address");
        else if (!newCustomer.guarantor.relationship.trim()) alert("Please enter guarantor relationship");
        else if (!newCustomer.guarantor.address.city.trim()) alert("Please enter guarantor city");
        else if (!newCustomer.guarantor.address.region.trim()) alert("Please enter guarantor region");
        else if (!newCustomer.guarantor.address.country.trim()) alert("Please enter guarantor country");
      }
      else if (!formData.carId) alert("Please select a vehicle");
      else if (!formData.startDate || !formData.endDate) alert("Please select pickup and return dates");
      else if (dailyRate <= 0) alert("Please enter a valid daily rate");
      else if (discount < 0) alert("Discount cannot be negative");
      else {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) alert("Return date must be after pickup date");
        else {
          const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          if (discount > dailyRate * days) alert("Discount cannot exceed the subtotal amount");
          else if (formData.selfDrive) {
            if (!formData.driverLicenseId.trim()) alert("Please enter driver's license number");
            else if (!formData.driverLicenseClass.trim()) alert("Please enter license class");
            else if (!formData.driverLicenseIssueDate) alert("Please select license issue date");
            else if (!formData.driverLicenseExpiryDate) alert("Please select license expiry date");
            else {
              const expiry = new Date(formData.driverLicenseExpiryDate);
              if (expiry < new Date()) alert("Driver's license has expired. Please provide a valid license.");
            }
          } else if (!formData.driverId) alert("Please select a driver");
          else if (formData.paymentMethod === "pay_in_slip") {
            if (!payInSlipDetails.bankName.trim()) alert("Please enter bank name");
            else if (!payInSlipDetails.branch.trim()) alert("Please enter bank branch");
            else if (!payInSlipDetails.payeeName.trim()) alert("Please enter payee name");
            else if (!payInSlipDetails.referenceNumber.trim()) alert("Please enter reference number");
            else if (!payInSlipDetails.slipNumber.trim()) alert("Please enter slip number");
          }
          else if (formData.paymentMethod === "mobile_money") {
            if (!mobileMoneyDetails.phoneNumber.trim()) alert("Please enter phone number");
            else alert("Please enter a valid Ghanaian phone number");
          }
        }
      }
      return false;
    }
    return true;
  }, [isFormValid, customerMode, selectedCustomer, newCustomer, formData, dailyRate, discount, payInSlipDetails, mobileMoneyDetails]);

  // ---------- Shared helpers for payload & summary ----------
  const getSelectedCar = useCallback(() => availableCars.find((c) => c.id === formData.carId) || null, [availableCars, formData.carId]);
  const getSelectedDriver = useCallback(() => drivers.find((d) => d.id === formData.driverId) || null, [drivers, formData.driverId]);

  const buildCustomerPayload = useCallback(() => {
    if (customerMode === "existing") {
      return { customer_id: selectedCustomer?.id };
    }
    return {
      customer_data: {
        first_name: newCustomer.firstName,
        last_name: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        ghana_card_id: newCustomer.ghanaCardId,
        occupation: newCustomer.occupation,
        gps_address: newCustomer.gpsAddress,
        address_city: newCustomer.address.city,
        address_region: newCustomer.address.region,
        address_country: newCustomer.address.country,
        communication_preferences: newCustomer.communicationPreferences,
      },
      guarantor_data: {
        first_name: newCustomer.guarantor.firstName,
        last_name: newCustomer.guarantor.lastName,
        phone: newCustomer.guarantor.phone,
        email: newCustomer.guarantor.email,
        ghana_card_id: newCustomer.guarantor.ghanaCardId,
        occupation: newCustomer.guarantor.occupation,
        gps_address: newCustomer.guarantor.gpsAddress,
        relationship: newCustomer.guarantor.relationship,
        address_city: newCustomer.guarantor.address.city,
        address_region: newCustomer.guarantor.address.region,
        address_country: newCustomer.guarantor.address.country,
      },
    };
  }, [customerMode, selectedCustomer, newCustomer]);

  // ---------- Payload preparation (backend) ----------
  const prepareBackendPayload = useCallback(
    (customerIdForBackend?: string) => {
      const customerPart = buildCustomerPayload();
      const payload: any = {
        car: formData.carId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        daily_rate: dailyRate,
        discount: discount,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        special_requests: formData.specialRequests,
        payment_method: formData.paymentMethod,
        is_self_drive: formData.selfDrive,
      };

      if (customerMode === "existing") {
        payload.customer = customerIdForBackend || selectedCustomer?.id;
      } else {
        Object.assign(payload, customerPart);
      }

      if (formData.selfDrive) {
        payload.driver_license_id = formData.driverLicenseId;
        payload.driver_license_class = formData.driverLicenseClass;
        payload.driver_license_issue_date = formData.driverLicenseIssueDate;
        payload.driver_license_expiry_date = formData.driverLicenseExpiryDate;
      } else {
        payload.driver = formData.driverId;
      }

      if (formData.paymentMethod === "mobile_money") {
        payload.mobile_money_provider = mobileMoneyDetails.provider;
        payload.mobile_money_number = mobileMoneyDetails.phoneNumber;
        payload.mobile_money_transaction_id = mobileMoneyDetails.transactionId || `MM_${Date.now()}`;
      } else if (formData.paymentMethod === "pay_in_slip") {
        payload.pay_in_slip_bank = payInSlipDetails.bankName;
        payload.pay_in_slip_branch = payInSlipDetails.branch;
        payload.pay_in_slip_payee = payInSlipDetails.payeeName;
        payload.pay_in_slip_reference = payInSlipDetails.referenceNumber;
        payload.pay_in_slip_number = payInSlipDetails.slipNumber;
        payload.pay_in_slip_date = payInSlipDetails.paymentDate;
      }

      return payload;
    },
    [formData, dailyRate, discount, customerMode, selectedCustomer, mobileMoneyDetails, payInSlipDetails, buildCustomerPayload]
  );

  // ---------- Booking summary for modal ----------
  const buildBookingSummary = useCallback((): BookingSummary | null => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return null;

    const car = getSelectedCar();
    const driver = getSelectedDriver();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const customerObj =
      customerMode === "existing"
        ? selectedCustomer
        : ({
          ...newCustomer,
          id: generateId("CUST"),
          createdAt: new Date().toISOString(),
          notes: [],
        } as Customer);

    return {
      customer: customerObj,
      car,
      driver,
      dailyRate,
      discount,
      selfDrive: formData.selfDrive ? "true" : "false",
      dates: { start: formData.startDate, end: formData.endDate },
      duration,
      totalAmount,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      paymentMethod: formData.paymentMethod,
      specialRequests: formData.specialRequests,
      paymentData: {
        ...(formData.paymentMethod === "pay_in_slip" && { payInSlipDetails }),
        ...(formData.paymentMethod === "mobile_money" && {
          mobileMoneyDetails: {
            ...mobileMoneyDetails,
            transactionId: mobileMoneyDetails.transactionId || `MM_${Date.now()}`,
          },
        }),
      },
      ...(formData.selfDrive && {
        driverLicenseId: formData.driverLicenseId,
        driverLicenseClass: formData.driverLicenseClass,
        driverLicenseIssueDate: formData.driverLicenseIssueDate,
        driverLicenseExpiryDate: formData.driverLicenseExpiryDate,
      }),
    } as BookingSummary;
  }, [formData, availableCars, drivers, customerMode, selectedCustomer, newCustomer, dailyRate, discount, totalAmount, payInSlipDetails, mobileMoneyDetails, getSelectedCar, getSelectedDriver]);

  const checkAvailability = useCallback(async () => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return { available: true };
    try {
      const result = await dispatch(
        checkCarAvailability({
          carId: formData.carId,
          startDate: formData.startDate,
          endDate: formData.endDate,
        })
      ).unwrap();
      return result;
    } catch (error) {
      console.error("Availability check failed:", error);
      return { available: false, message: "Unable to verify availability. Please try again." };
    }
  }, [dispatch, formData.carId, formData.startDate, formData.endDate]);

  const createBookingFlow = useCallback(
    async (summary: BookingSummary) => {
      setIsProcessing(true);
      try {
        const payload = prepareBackendPayload();

        if (formData.paymentMethod === "mobile_money") {
          const PaystackPop = (await import("@paystack/inline-js")).default;
          const paystack = new PaystackPop();

          paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
            email: customerMode === "existing" ? selectedCustomer?.email || newCustomer.email : newCustomer.email,
            amount: Math.round(totalAmount * 100),
            currency: "GHS",
            reference: `BOOK_${Date.now()}`,
            onSuccess: async (transaction: any) => {
              setMobileMoneyDetails((prev) => ({ ...prev, transactionId: transaction.reference }));
              payload.mobile_money_transaction_id = transaction.reference;

              await dispatch(createBooking(payload)).unwrap();
              dispatch(updateCarStatus({ CarId: formData.carId, status: "rented" }));

              setIsProcessing(false);
              setShowConfirmationModal(false);
              alert("Booking created successfully!");
              router.push("/dashboard/bookings");
            },
            onCancel: () => {
              setIsProcessing(false);
              alert("Payment cancelled by user.");
            },
          });
        } else {
          await dispatch(createBooking(payload)).unwrap();
          dispatch(updateCarStatus({ CarId: formData.carId, status: "rented" }));

          setIsProcessing(false);
          setShowConfirmationModal(false);
          alert("Booking created successfully!");
          router.push("/dashboard/bookings");
        }
      } catch (error: any) {
        console.error("Error creating booking:", error);
        setIsProcessing(false);
        alert(`Failed to create booking: ${error?.message || "Unknown error"}`);
      }
    },
    [customerMode, selectedCustomer, newCustomer, formData, totalAmount, dispatch, prepareBackendPayload, router]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      // const availability = await checkAvailability();
      // if (!availability.available) {
      //   alert(`Car is not available: ${availability.message || "Unavailable"}`);
      //   return;
      // }

      const summary = buildBookingSummary();
      if (!summary) {
        alert("Unable to build booking summary. Please check the inputs.");
        return;
      }

      setBookingSummary(summary);
      setShowConfirmationModal(true);
    },
    [validateForm, checkAvailability, buildBookingSummary]
  );

  const handleConfirmBooking = useCallback(async () => {
    if (!bookingSummary) return;
    await createBookingFlow(bookingSummary);
  }, [bookingSummary, createBookingFlow]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Booking</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Fill in the details below to create a new booking</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
        >
          <FaTimes />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomerSelectionSection
          customerMode={customerMode}
          setCustomerMode={setCustomerMode}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          filteredCustomers={filteredCustomers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          newCustomer={newCustomer}
          onNewCustomerChange={handleNewCustomerChange}
          onExistingCustomerGuarantorChange={handleExistingCustomerGuarantorChange}
          onCommunicationPrefChange={handleCommunicationPrefChange}
          customers={allCustomers}
        />

        <VehicleSelectionSection
          availableCars={availableCars}
          selectedCarId={formData.carId}
          onCarSelect={handleCarSelect}
        />

        <BookingDetailsSection
          startDate={formData.startDate}
          endDate={formData.endDate}
          pickupLocation={formData.pickupLocation}
          dropoffLocation={formData.dropoffLocation}
          driverId={formData.driverId}
          specialRequests={formData.specialRequests}
          drivers={drivers}
          onFieldChange={handleFieldChange}
          getMinDate={getMinDate}
          getMaxDate={getMaxDate}
          selfDrive={formData.selfDrive ? "true" : "false"}
          driverLicenseId={formData.driverLicenseId}
          driverLicenseClass={formData.driverLicenseClass}
          driverLicenseIssueDate={formData.driverLicenseIssueDate}
          driverLicenseExpiryDate={formData.driverLicenseExpiryDate}
        />

        <PaymentSummarySection
          totalAmount={totalAmount}
          paymentMethod={formData.paymentMethod}
          carId={formData.carId}
          startDate={formData.startDate}
          endDate={formData.endDate}
          availableCars={availableCars}
          dailyRate={dailyRate}
          discount={discount}
          onDailyRateChange={handleDailyRateChange}
          onDiscountChange={handleDiscountChange}
          onPaymentMethodChange={(method) => handleFieldChange("paymentMethod", method)}
          payInSlipDetails={payInSlipDetails}
          onPayInSlipChange={handlePayInSlipChange}
          mobileMoneyDetails={mobileMoneyDetails}
          onMobileMoneyChange={handleMobileMoneyChange}
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center gap-2"
            disabled={!isFormValid}
          >
            <FaSave />
            Review & Confirm Booking
          </button>
        </div>
      </form>

      {bookingSummary && (
        <ConfirmationModal
          show={showConfirmationModal}
          summary={bookingSummary}
          customerMode={customerMode}
          isProcessing={isProcessing}
          paymentMethod={formData.paymentMethod}
          specialRequests={formData.specialRequests}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}