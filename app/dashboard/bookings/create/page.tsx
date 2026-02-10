"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaTimes } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../../lib/store";
import { updateCarStatus } from "../../../lib/slices/carsSlice";
import { createBooking, checkCarAvailability } from "../../../lib/slices/bookingsSlice";
import { addCustomer } from "../../../lib/slices/customersSlice";
import { Customer, Note } from "../../../types/customer";
import { Car } from "@/app/types/cars";
import { BookingSummary, Driver, PaymentMethod } from "../../../types/booking";
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

// Helper function to generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function CreateBookingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux selectors
  const availableCars = useAppSelector(selectAvailablecars) as Car[];
  const drivers = useAppSelector(selectDrivers) as Driver[];
  const allCustomers = useAppSelector(selectCustomers) as Customer[];

  // Local UI state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Customer selection/search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Payment details
  const [payInSlipDetails, setPayInSlipDetails] = useState({
    bankName: "",
    branch: "",
    payeeName: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    slipNumber: "",
  });

  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    transactionId: "",
    provider: "MTN",
    phoneNumber: "",
  });

  // Form state (selfDrive is boolean now)
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

  // New customer structure
  const [newCustomer, setNewCustomer] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ghanaCardId: "",
    occupation: "",
    gpsAddress: "",
    address: { city: "", region: "", country: "" },
    joinDate: new Date().toISOString().split("T")[0],
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

  // -----------------------------------------
  // Utility: calculate total amount (single source)
  // -----------------------------------------
  const calculateTotalAmount = useCallback(() => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return;
    const car = availableCars.find((c) => c.id === formData.carId);
    if (!car) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const total = days * car.dailyRate;

    setFormData((prev) => ({ ...prev, totalAmount: total }));
    // Keep pay-in-slip amount in sync when payment method is pay_in_slip
    setPayInSlipDetails((prev) => ({ ...prev, amount: total }));
  }, [formData.carId, formData.startDate, formData.endDate, availableCars]);

  useEffect(() => {
    calculateTotalAmount();
  }, [calculateTotalAmount]);

  // -----------------------------------------
  // Filtered customers (search)
  // -----------------------------------------
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

  // -----------------------------------------
  // Handlers
  // -----------------------------------------
  const handlePayInSlipChange = useCallback((field: string, value: string | number) => {
    setPayInSlipDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMobileMoneyChange = useCallback((field: string, value: string) => {
    setMobileMoneyDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
  }, []);

  const handleCarSelect = useCallback((carId: string) => {
    setFormData((prev) => ({ ...prev, carId }));
  }, []);

  const handleNewCustomerChange = useCallback((name: string, value: string) => {
    setNewCustomer((prev: any) => {
      const addressFields = ["city", "region", "country"];
      // direct address fields
      if (addressFields.includes(name)) {
        return { ...prev, address: { ...prev.address, [name]: value } };
      }

      // guarantor fields prefixed with guarantor_
      if (name.startsWith("guarantor_")) {
        const fieldName = name.replace("guarantor_", "");
        if (addressFields.includes(fieldName)) {
          return {
            ...prev,
            guarantor: { ...prev.guarantor, address: { ...prev.guarantor.address, [fieldName]: value } },
          };
        }
        return { ...prev, guarantor: { ...prev.guarantor, [fieldName]: value } };
      }

      // nested parent_child
      if (name.includes("_")) {
        const [parent, child] = name.split("_");
        return { ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } };
      }

      return { ...prev, [name]: value };
    });
  }, []);

  const handleCommunicationPrefChange = useCallback((field: "email" | "sms" | "phone", value: boolean) => {
    setNewCustomer((prev: any) => ({ ...prev, communicationPreferences: { ...prev.communicationPreferences, [field]: value } }));
  }, []);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If payment method becomes pay_in_slip keep amount in sync
    if (field === "paymentMethod" && value === "pay_in_slip") {
      setPayInSlipDetails((prev) => ({ ...prev, amount: formData.totalAmount }));
    }
  }, [formData.totalAmount]);

  // Handle existing customer's guarantor updates safely
  const handleExistingCustomerGuarantorChange = useCallback((field: string, value: string) => {
    if (!selectedCustomer) return;
    const parts = field.split("_"); // e.g. selectedCustomer_guarantor_firstName or guarantor_address_city

    setSelectedCustomer((prev) => {
      if (!prev) return prev;
      const updated = { ...prev } as any;
      if (!updated.guarantor) {
        updated.guarantor = { id: generateId("GUAR"), address: { city: "", region: "", country: "" } };
      }

      // support: guarantor_firstName or guarantor_address_city
      if (parts[0] === "guarantor" && parts.length === 2) {
        updated.guarantor[parts[1]] = value;
      } else if (parts[0] === "guarantor" && parts[1] === "address" && parts.length === 3) {
        updated.guarantor.address = { ...updated.guarantor.address, [parts[2]]: value };
      }

      return updated;
    });
  }, [selectedCustomer]);

  // -----------------------------------------
  // Validation (keeps previous alerts for UI parity)
  // -----------------------------------------
  const validateForm = useCallback((): boolean => {
    if (customerMode === "existing" && !selectedCustomer) {
      alert("Please select an existing customer");
      return false;
    }

    if (customerMode === "new") {
      if (!newCustomer.firstName.trim()) { alert("Please enter customer name"); return false; }
      if (!newCustomer.lastName.trim()) { alert("Please enter customer name"); return false; }
      if (!newCustomer.phone.trim()) { alert("Please enter customer phone number"); return false; }
      if (!newCustomer.ghanaCardId.trim()) { alert("Please enter customer Ghana Card ID"); return false; }
      if (!newCustomer.occupation.trim()) { alert("Please enter customer occupation"); return false; }
      if (!newCustomer.gpsAddress.trim()) { alert("Please enter customer GPS address"); return false; }
      if (!newCustomer.address.city.trim()) { alert("Please enter customer city"); return false; }
      if (!newCustomer.address.region.trim()) { alert("Please enter customer region"); return false; }
      if (!newCustomer.address.country.trim()) { alert("Please enter customer country"); return false; }
      if (!newCustomer.guarantor.firstName.trim()) { alert("Please enter guarantor first name"); return false; }
      if (!newCustomer.guarantor.lastName.trim()) { alert("Please enter guarantor last name"); return false; }
      if (!newCustomer.guarantor.phone.trim()) { alert("Please enter guarantor phone number"); return false; }
      if (!newCustomer.guarantor.ghanaCardId.trim()) { alert("Please enter guarantor Ghana Card ID"); return false; }
      if (!newCustomer.guarantor.occupation.trim()) { alert("Please enter guarantor occupation"); return false; }
      if (!newCustomer.guarantor.gpsAddress.trim()) { alert("Please enter guarantor GPS address"); return false; }
      if (!newCustomer.guarantor.relationship.trim()) { alert("Please enter guarantor relationship with customer"); return false; }
      if (!newCustomer.guarantor.address.city.trim()) { alert("Please enter guarantor city"); return false; }
      if (!newCustomer.guarantor.address.region.trim()) { alert("Please enter guarantor region"); return false; }
      if (!newCustomer.guarantor.address.country.trim()) { alert("Please enter guarantor country"); return false; }
    }

    if (!formData.carId) { alert("Please select a vehicle"); return false; }
    if (!formData.startDate || !formData.endDate) { alert("Please select pickup and return dates"); return false; }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) { alert("Return date must be after pickup date"); return false; }

    if (formData.selfDrive) {
      if (!formData.driverLicenseId.trim()) { alert("Please enter driver's license number"); return false; }
      if (!formData.driverLicenseClass.trim()) { alert("Please enter license class"); return false; }
      if (!formData.driverLicenseIssueDate) { alert("Please select license issue date"); return false; }
      if (!formData.driverLicenseExpiryDate) { alert("Please select license expiry date"); return false; }

      const expiryDate = new Date(formData.driverLicenseExpiryDate);
      const today = new Date();
      if (expiryDate < today) { alert("Driver's license has expired. Please provide a valid license."); return false; }
    } else {
      if (!formData.driverId) { alert("Please select a driver"); return false; }
    }

    if (formData.paymentMethod === "pay_in_slip") {
      if (!payInSlipDetails.bankName.trim()) { alert("Please enter bank name for pay-in-slip"); return false; }
      if (!payInSlipDetails.branch.trim()) { alert("Please enter bank branch"); return false; }
      if (!payInSlipDetails.payeeName.trim()) { alert("Please enter payee name"); return false; }
      if (!payInSlipDetails.referenceNumber.trim()) { alert("Please enter reference number"); return false; }
      if (!payInSlipDetails.slipNumber.trim()) { alert("Please enter slip number"); return false; }
    }

    if (formData.paymentMethod === "mobile_money") {
      if (!mobileMoneyDetails.phoneNumber.trim()) { alert("Please enter phone number for mobile money payment"); return false; }
      const phoneRegex = /^(?:(?:\+?233|0)(?:\d{9}|\d{8}))$/;
      if (!phoneRegex.test(mobileMoneyDetails.phoneNumber)) { alert("Please enter a valid Ghanaian phone number"); return false; }
    }

    return true;
  }, [customerMode, payInSlipDetails, mobileMoneyDetails, selectedCustomer, newCustomer, formData]);

  // -----------------------------------------
  // Availability check - fail closed (if we can't verify, treat as unavailable)
  // -----------------------------------------
  const checkAvailability = useCallback(async () => {
    if (!formData.carId || !formData.startDate || !formData.endDate) {
      return { available: true };
    }
    try {
      const result = await dispatch(checkCarAvailability({
        carId: formData.carId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })).unwrap();
      return result;
    } catch (error) {
      console.error("Availability check failed:", error);
      // Treat as unavailable to avoid double-booking
      return { available: false, message: "Unable to verify availability. Please try again." };
    }
  }, [dispatch, formData.carId, formData.startDate, formData.endDate]);

  // -----------------------------------------
  // Prepare backend payload (snake_case) and local booking object
  // -----------------------------------------
  const prepareBackendPayload = useCallback((customerIdForBackend?: string) => {
    const payload: any = {
      car: formData.carId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      pickup_location: formData.pickupLocation,
      dropoff_location: formData.dropoffLocation,
      special_requests: formData.specialRequests,
      payment_method: formData.paymentMethod,
      is_self_drive: formData.selfDrive,
    };

    if (customerMode === "existing") {
      payload.customer = customerIdForBackend || selectedCustomer?.id;
    } else {
      payload.customer_data = {
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
      };

      payload.guarantor_data = {
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
      };
    }

    if (formData.selfDrive) {
      payload.driver_license_id = formData.driverLicenseId;
      payload.driver_license_class = formData.driverLicenseClass;
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
  }, [formData, customerMode, selectedCustomer, newCustomer, mobileMoneyDetails, payInSlipDetails]);

  // -----------------------------------------
  // Prepare booking summary for confirmation (single source)
  // -----------------------------------------
  const buildBookingSummary = useCallback((): BookingSummary | null => {
    if (!formData.carId || !formData.startDate || !formData.endDate) return null;

    const car = availableCars.find((c) => c.id === formData.carId) || null;
    const driver = drivers.find((d) => d.id === formData.driverId) || null;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const customerObj = customerMode === "existing"
      ? selectedCustomer
      : ({
          ...newCustomer,
          id: generateId("CUST"),
          createdAt: new Date().toISOString(),
          notes: [] as Note[],
        } as Customer);

    return {
      customer: customerObj,
      car,
      driver,
      selfDrive: formData.selfDrive ? "true" : "false",
      dates: { start: formData.startDate, end: formData.endDate },
      duration,
      totalAmount: formData.totalAmount,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      paymentMethod: formData.paymentMethod,
      specialRequests: formData.specialRequests,
      paymentData: {
        ...(formData.paymentMethod === "pay_in_slip" && { payInSlipDetails }),
        ...(formData.paymentMethod === "mobile_money" && { mobileMoneyDetails: { ...mobileMoneyDetails, transactionId: mobileMoneyDetails.transactionId || `MM_${Date.now()}` } }),
      },
      ...(formData.selfDrive && {
        driverLicenseId: formData.driverLicenseId,
        driverLicenseClass: formData.driverLicenseClass,
        driverLicenseIssueDate: formData.driverLicenseIssueDate,
        driverLicenseExpiryDate: formData.driverLicenseExpiryDate,
      }),
    } as BookingSummary;
  }, [availableCars, drivers, formData, customerMode, selectedCustomer, newCustomer, payInSlipDetails, mobileMoneyDetails]);

  // -----------------------------------------
  // Send confirmation (stubbed - logs only)
  // -----------------------------------------
  const sendBookingConfirmation = useCallback(async (summary: BookingSummary) => {
    if (!summary || !summary.customer) return;
    const { customer, car, driver, dates, totalAmount, paymentMethod } = summary;

    const smsMessage = `Dear ${customer.firstName} ${customer.lastName}, your booking has been confirmed. Pickup: ${dates.start} at ${formData.pickupLocation || "our main office"}. Return: ${dates.end}. Total: $${totalAmount}. Thank you!`;

    const emailContent = {
      to: customer.email,
      subject: `Booking Confirmation`,
      body: `...`,
    };

    console.log("SMS Message:", smsMessage);
    console.log("Email Content:", emailContent);

    return Promise.resolve();
  }, [formData.pickupLocation]);

  // -----------------------------------------
  // Final booking creation flow (single source of truth, no duplicates)
  // -----------------------------------------
  const createBookingFlow = useCallback(async (summary: BookingSummary) => {
    setIsProcessing(true);
    try {
      // Ensure customer exists in local store if new
      let backendCustomerId: string | undefined = undefined;

      if (customerMode === "new") {
        const customerToAdd: Customer = {
          ...newCustomer,
          id: generateId("CUST"),
          createdAt: new Date().toISOString(),
          lastBookingDate: new Date().toISOString(),
          notes: [] as Note[],
          status: "active",
          totalBookings: 0,
          totalSpent: 0,
          communicationPreferences: newCustomer.communicationPreferences,
          loyaltyTier: newCustomer.loyaltyTier,
        } as Customer;

        // Add to redux (local store)
        dispatch(addCustomer(customerToAdd));
        backendCustomerId = customerToAdd.id; // let backend know this was a newly created customer
      } else {
        backendCustomerId = selectedCustomer?.id;
      }

      const payload = prepareBackendPayload(backendCustomerId);

      // If payment method is mobile_money, handle payment before creating booking
      if (formData.paymentMethod === "mobile_money") {
        const PaystackPop = (await import("@paystack/inline-js")).default;
        const paystack = new PaystackPop();

        paystack.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
          email: customerMode === "existing" ? selectedCustomer?.email || newCustomer.email : newCustomer.email,
          amount: Math.round(formData.totalAmount * 100), // amount in pesewas
          currency: "GHS",
          reference: `BOOK_${Date.now()}`,
          onSuccess: async (transaction: any) => {
            // update transaction details
            setMobileMoneyDetails((prev) => ({ ...prev, transactionId: transaction.reference }));
            payload.mobile_money_transaction_id = transaction.reference;

            // Create booking once after successful payment
            await dispatch(createBooking(payload)).unwrap();
            dispatch(updateCarStatus({ CarId: formData.carId, status: "rented" }));
            await sendBookingConfirmation(summary);

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
        // cash or pay_in_slip: create booking immediately
        await dispatch(createBooking(payload)).unwrap();
        dispatch(updateCarStatus({ CarId: formData.carId, status: "rented" }));
        await sendBookingConfirmation(summary);

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
  }, [customerMode, newCustomer, selectedCustomer, formData, dispatch, prepareBackendPayload, router, sendBookingConfirmation]);

  // -----------------------------------------
  // Form submit -> validate, check availability, build summary, show modal
  // -----------------------------------------
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const availability = await checkAvailability();
    if (!availability.available) {
      alert(`Car is not available: ${availability.message || "Unavailable"}`);
      return;
    }

    const summary = buildBookingSummary();
    if (!summary) {
      alert("Unable to build booking summary. Please check the inputs.");
      return;
    }

    setBookingSummary(summary);
    setShowConfirmationModal(true);
  }, [validateForm, checkAvailability, buildBookingSummary]);

  const handleConfirmBooking = useCallback(async () => {
    if (!bookingSummary) return;
    await createBookingFlow(bookingSummary);
  }, [bookingSummary, createBookingFlow]);

  // Date helpers
  const getMinDate = useCallback(() => new Date().toISOString().split("T")[0], []);
  const getMaxDate = useCallback(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // -----------------------------------------
  // UI (kept same design & props)
  // -----------------------------------------
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

        <VehicleSelectionSection availableCars={availableCars} selectedCarId={formData.carId} onCarSelect={handleCarSelect} />

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
          totalAmount={formData.totalAmount}
          paymentMethod={formData.paymentMethod}
          carId={formData.carId}
          startDate={formData.startDate}
          endDate={formData.endDate}
          availableCars={availableCars}
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
            disabled={
              (customerMode === "existing" && !selectedCustomer) ||
              (customerMode === "new" && (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.phone || !newCustomer.ghanaCardId || !newCustomer.occupation || !newCustomer.gpsAddress || !newCustomer.address.city || !newCustomer.address.region || !newCustomer.address.country || !newCustomer.guarantor.firstName || !newCustomer.guarantor.lastName || !newCustomer.guarantor.phone || !newCustomer.guarantor.ghanaCardId || !newCustomer.guarantor.relationship || !newCustomer.guarantor.occupation || !newCustomer.guarantor.gpsAddress || !newCustomer.guarantor.address.region || !newCustomer.guarantor.address.country)) ||
              !formData.carId ||
              !formData.startDate ||
              !formData.endDate
            }
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
