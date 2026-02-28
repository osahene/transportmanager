"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaTimes } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../../lib/store";
import { fetchCars } from "../../../lib/slices/carsSlice";
import { useOnlineStatus } from '@/app/lib/useOnlineStatus';
import { mapDetailedBookingToReceiptData, ReceiptData } from "@/app/lib/utils/receiptMapper";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";
import { format } from "date-fns";
import { createBooking, checkCarAvailability, fetchBookings, addOfflineBooking } from "../../../lib/slices/bookingsSlice";
import { Customer } from "../../../types/customer";
import { Car } from "@/app/types/cars";
import { BookingSummary, Driver, PaymentMethod, Booking } from "../../../types/booking";
import {
  selectAvailablecars,
  selectDrivers,
  selectCustomers,
} from "../../../lib/slices/selectors";
import CustomerSelectionSection from "../../../components/booking/CustomerSelectionSection";
import VehicleSelectionSection from "../../../components/booking/VehicleSelectionSection";
import BookingDetailsSection from "../../../components/booking/BookingDetailsSection";
import PaymentSummarySection from "../../../components/booking/PaymentSummarySection";
import ConfirmationModal from "../../../components/booking/ConfirmationModal";
import { fetchCustomers, fetchCustomerById } from "@/app/lib/slices/customersSlice";
import { fetchStaff } from "@/app/lib/slices/staffSlice";


const params: any = {
  page: 1,
  page_size: 30
};
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
  const isOnline = useOnlineStatus();
  const [receiptBooking, setReceiptBooking] = useState<ReceiptData | null>(null);


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


  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch])

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${receiptBooking?.bookingId}`,
    onAfterPrint: () => setReceiptBooking(null),
  });


  const buildLocalBooking = (summary: BookingSummary, mode: string): Booking => {
    const customer = summary.customer;
    const car = summary.car;
    const driver = summary.driver;

    return {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      CarId: car?.id || '',
      customerId: customer?.id || (mode === 'new' ? `temp_cust_${Date.now()}` : ''),
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
      customerPhone: customer?.phone || 'N/A',
      customerEmail: customer?.email || 'N/A',
      customerGPSAddress: customer?.gpsAddress || 'N/A',
      driverPhone: driver?.phone || 'N/A',
      selfDrive: summary.selfDrive === 'true',
      amountPaid: 0,
      paymentStatus: "pending",
      startDate: summary.dates.start,
      endDate: summary.dates.end,
      dailyRate: summary.dailyRate,
      discount: summary.discount,
      totalAmount: summary.totalAmount,
      pickupLocation: summary.pickupLocation,
      dropoffLocation: summary.dropoffLocation,
      specialRequests: summary.specialRequests,
      paymentMethod: summary.paymentMethod,
      isSelfDrive: summary.selfDrive === 'true',
      driverId: driver?.id || '',
      driverLicenseId: summary.driverLicenseId,
      driverLicenseClass: summary.driverLicenseClass,
      driverLicenseIssueDate: summary.driverLicenseIssueDate,
      driverLicenseExpiryDate: summary.driverLicenseExpiryDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Include nested objects if your Booking type expects them
      customer: customer || undefined,
      car: car || undefined,
      driver: driver || undefined,
    } as Booking; // cast if necessary – ensure all required fields are present
  };





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
    dispatch(fetchStaff());
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
    // Set basic info immediately (for form)
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);

    dispatch(fetchCustomerById(customer.id)).then((action) => {
      if (fetchCustomerById.fulfilled.match(action)) {
        const fullCustomer = action.payload;
        const enhancedCustomer: Customer = {
          ...fullCustomer,
          address: {
            city: fullCustomer.addressCity || fullCustomer.address_city || '',
            region: fullCustomer.addressRegion || fullCustomer.address_region || '',
            country: fullCustomer.addressCountry || fullCustomer.address_country || 'Ghana',
          },
          guarantor: fullCustomer.guarantor ? {
            ...fullCustomer.guarantor,
            address: {
              city: fullCustomer.guarantor.addressCity || fullCustomer.guarantor.address_city || '',
              region: fullCustomer.guarantor.addressRegion || fullCustomer.guarantor.address_region || '',
              country: fullCustomer.guarantor.addressCountry || fullCustomer.guarantor.address_country || 'Ghana',
            }
          } : undefined
        };
        setSelectedCustomer(enhancedCustomer);
      } else {
        console.error('Failed to fetch customer details', action.payload);

        const fallbackCustomer: Customer = {
          ...customer,
          address: {
            city: customer.addressCity || customer.address_city || '',
            region: customer.addressRegion || customer.address_region || '',
            country: customer.addressCountry || customer.address_country || 'Ghana',
          },
          guarantor: customer.guarantor ? {
            ...customer.guarantor,
            address: {
              city: customer.guarantor.addressCity || customer.guarantor.address_city || '',
              region: customer.guarantor.addressRegion || customer.guarantor.address_region || '',
              country: customer.guarantor.addressCountry || customer.guarantor.address_country || 'Ghana',
            }
          } : undefined
        };
        setSelectedCustomer(fallbackCustomer);
      }
    });
  }, [dispatch]);

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
      if (field === "selfDrive") {
        value = Boolean(value);
      }
      updateFormData(field, value);
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
        if (selectedCustomer?.guarantor?.id) {
          payload.guarantor = selectedCustomer.guarantor.id;
        }
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
              await dispatch(fetchBookings(params));
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

          await dispatch(fetchBookings(params));
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
    setIsProcessing(true);

    if (isOnline) {
      // Existing online flow (Paystack + API)
      await createBookingFlow(bookingSummary);
    } else {
      // OFFLINE: save locally and print receipt
      // Build a local booking object with all needed fields

      const localBooking = buildLocalBooking(bookingSummary, customerMode);
      dispatch(addOfflineBooking(localBooking));
      setIsProcessing(false);
      setShowConfirmationModal(false);

      const receiptData = mapDetailedBookingToReceiptData(localBooking);
      setReceiptBooking(receiptData);

      alert('Booking saved offline. It will be synced when you’re back online.');
      router.push('/dashboard/bookings');
    }
  }, [bookingSummary, isOnline, dispatch, createBookingFlow, router]);


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
          selfDrive={formData.selfDrive}
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
      {/* Receipt Modal for Offline Print */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div
              ref={receiptRef}
              className="p-8 bg-white"
              style={{ minHeight: 'auto', boxSizing: 'border-box' }}
            >
              <style type="text/css" media="print">{`
          @page { size: auto; margin: 20mm; }
          html, body { height: auto; overflow: visible; }
          #receipt-container { width: 100%; }
        `}</style>
              {/* Copy the exact receipt HTML from bookings/page.tsx here, using receiptBooking data */}
              {/* ... (same receipt structure) */}
              <div className="text-center mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">YOS Car Rentals</h1>
                <p className="text-gray-600 mt-2">
                  Location: Opposite Shell filling station, Mango Down, Patasi, Kumasi, Ghana
                </p>
                <p className="text-gray-600">
                  Phone: +233 54 621 3027 | +233 24 445 5757 | Email: info@yoscarrentals.com
                </p>
                <h4 className="text-xl font-bold text-gray-900">Official Receipt</h4>
              </div>

              {/* Receipt Details – use receiptBooking properties exactly as in bookings page */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Receipt Number</p>
                    <p className="font-bold text-gray-900">{receiptBooking.bookingId.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold text-gray-900">
                      {format(receiptBooking.date, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Details</h3>
                    <p className="text-gray-800">{receiptBooking.customerName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Contact</h3>
                    <p className="text-gray-800">
                      {receiptBooking.customerPhone} | {receiptBooking.customerEmail} | {receiptBooking.customerGPSAddress}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Vehicle Details</h3>
                    <p className="text-gray-800">{receiptBooking.carDetails}</p>
                  </div>
                </div>

                {/* Guarantor details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Guarantor Details</h3>
                    <p className="text-gray-800">{receiptBooking.guarantorName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Guarantor Contact</h3>
                    <p className="text-gray-800">
                      {receiptBooking.guarantorPhone} | {receiptBooking.guarantorEmail} | {receiptBooking.guarantorGPSAddress}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Booking Period</h3>
                    <p className="text-gray-800">{receiptBooking.bookingDates}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Number of Days</h3>
                    <p className="text-gray-800">{receiptBooking.numberOfDays} days</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pickup Location</h3>
                    <p className="text-gray-800">{receiptBooking.pickupLocation}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Dropoff Location</h3>
                    <p className="text-gray-800">{receiptBooking.dropoffLocation}</p>
                  </div>
                </div>

                {receiptBooking.selfDrive && (
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Driver's License Information</h3>
                      <p className="text-gray-800"><span className="font-medium">License No:</span> {receiptBooking.driverLicenseId}</p>
                      <p className="text-gray-800"><span className="font-medium">Class:</span> {receiptBooking.driverLicenseClass}</p>
                      <p className="text-gray-800"><span className="font-medium">Issue Date:</span> {receiptBooking.driverLicenseIssueDate}</p>
                      <p className="text-gray-800"><span className="font-medium">Expiry Date:</span> {receiptBooking.driverLicenseExpiryDate}</p>
                    </div>
                  </div>
                )}

                {/* Amount Breakdown */}
                {(() => {
                  const TAX_RATE = 0.12;
                  const daily = receiptBooking.dailyRate;
                  const days = receiptBooking.numberOfDays;
                  const discount = receiptBooking.discount;

                  const taxPerDay = daily * TAX_RATE;
                  const netDaily = daily - taxPerDay;
                  const subtotal = netDaily * days;
                  const totalTax = taxPerDay * days;
                  const grandTotal = daily * days - discount;

                  return (
                    <div className="border-t border-b py-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Daily Rate (after tax)</span>
                        <span className="font-bold text-gray-900">¢{netDaily.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Number of Days</span>
                        <span className="font-bold text-gray-900">{days}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-bold text-gray-900">¢{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Tax (12%)</span>
                        <span className="font-bold text-gray-900">¢{totalTax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-bold text-gray-900">¢{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                        <span className="text-gray-900">Grand Total</span>
                        <span className="text-gray-900">¢{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-gray-800">{receiptBooking.paymentMethod}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transaction ID</h3>
                    <p className="text-gray-800">{receiptBooking.transactionId}</p>
                  </div>
                </div>

                {/* Terms and conditions – same as before */}
                <div className="mt-6">
                  <h3 className="font-semibold text-center text-gray-900 mb-2">
                    Terms and Conditions
                  </h3>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">1.</span>
                    Minimum rental period: 24 hours
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">2.</span>
                    Car(s) is to be returned to the garage by 8:00 AM on the due date that the car is to be returned. When the time exceeds by an hour, the recipient would pay an extra fee of full day rent.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">3.</span>
                    Car recipient must provide a valid Ghana Card or Passport, Ghana Driver's License and a guarantor. The guarantor must provide details of their Ghana Card or Passport and other relevant information to the company.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">4.</span>
                    In case the recipient would need a driver from the company, they would pay an additional fee of two hundred Ghana Cedis (¢ 200.00) as service fee.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">5.</span>
                    The recipient would be responsible for the upkeep and accommodation of the driver.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">6.</span>
                    In case of any accident, the recipient would bear the full cost of the damages. In such a situation, the recipient would have not more than a month to put the car in its original shape.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">7.</span>
                    In case of very serious damage, the recipient would have to replace the car with a new one.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">8.</span>
                    No smoking, eating or drinking of alcohol in vehicle. The recipient must ensure that the vehicle is well cleaned when returning it.
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold mr-2">9.</span>
                    Fuel policy: The recipient must return the vehicle with a full tank of fuel; specifically, SHELL V-POWER.
                  </p>
                </div>
                {/* Signature */}
                <div className="flex justify-between items-center mt-8">
                  <div className="text-center">
                    <div className="border-t w-48 mx-auto border-gray-400"></div>
                    <p className="text-gray-600 mt-2">Customer Sign</p>
                  </div>
                  <div className="text-center">
                    <div className="border-t w-48 mx-auto border-gray-400"></div>
                    <p className="text-gray-600 mt-2">Guarantor Sign</p>
                  </div>
                </div>
                <div className="flex justify-center items-center mt-8">
                  <div className="text-center">
                    <div className="border-t w-48 mx-auto border-gray-400"></div>
                    <p className="text-gray-600 mt-2">Transport Manager Sign</p>
                  </div>

                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600 text-sm">
                    Thank you for choosing YOS Car Rentals!
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    For inquiries: support@yoscarrentals.com | +233 54 621 3027 |  +233 24 445 5757
                  </p>
                </div>
                {/* Signature and footer – same as before */}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setReceiptBooking(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePrintReceipt()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaPrint />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}