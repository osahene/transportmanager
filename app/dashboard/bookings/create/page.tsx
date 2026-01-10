"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaTimes } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../../lib/store";
import { updateCarStatus } from "../../../lib/slices/carsSlice";
import { createBooking } from "../../../lib/slices/bookingsSlice";
import { addCustomer } from "../../../lib/slices/customersSlice";
import { Customer, Note } from "../../../types/customer";
import { Car } from "@/app/types/cars";
import { BookingSummary, Driver, PaymentMethod } from "../../../types/booking";
import {
  selectAvailablecars,
  selectDrivers,
  selectCustomers,
  selectActiveCustomers,
} from "../../../lib/slices/selectors";

import CustomerSelectionSection from "../../../components/booking/CustomerSelectionSection";
import VehicleSelectionSection from "../../../components/booking/VehicleSelectionSection";
import BookingDetailsSection from "../../../components/booking/BookingDetailsSection";
import PaymentSummarySection from "../../../components/booking/PaymentSummarySection";
import ConfirmationModal from "../../../components/booking/ConfirmationModal";
import PaystackPop from "@paystack/inline-js";

// Helper function to generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function CreateBookingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Get data from Redux - cast to proper types
  const availableCars = useAppSelector(selectAvailablecars) as Car[];
  const drivers = useAppSelector(selectDrivers) as Driver[];
  const allCustomers = useAppSelector(selectCustomers);
  const activeCustomers = useAppSelector(selectActiveCustomers);
  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Local states
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    "existing"
  );

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [payInSlipDetails, setPayInSlipDetails] = useState({
    bankName: "",
    branch: "",
    payeeName: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    slipNumber: "",
  });

  // Mobile money details
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
    selfDrive: "",
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

  // Handle pay-in-slip details changes
  const handlePayInSlipChange = useCallback(
    (field: string, value: string | number) => {
      setPayInSlipDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Handle mobile money details changes
  const handleMobileMoneyChange = useCallback(
    (field: string, value: string) => {
      setMobileMoneyDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ghanaCardId: "",
    occupation: "",
    gpsAddress: "",
    address: {
      locality: "",
      town: "",
      city: "",
      region: "",
      country: "",
    },
    joinDate: new Date().toISOString().split("T")[0],
    status: "active" as const,
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    preferredVehicleType: "",
    notes: "",
    tags: [] as string[],
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false,
    },
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
      address: {
        locality: "",
        town: "",
        city: "",
        region: "",
        country: "",
      },
    },
    loyaltyTier: "bronze" as const,
  });

  // Calculate total amount based on dates and car daily rate
  useEffect(() => {
    if (formData.carId && formData.startDate && formData.endDate) {
      const car = availableCars.find((c) => c.id === formData.carId);
      if (car) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.max(0, end.getTime() - start.getTime());
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const total = days * car.dailyRate;
        setFormData((prev) => ({ ...prev, totalAmount: total }));
      }
    }
  }, [formData.carId, formData.startDate, formData.endDate, availableCars]);

  const filteredCustomers = useMemo(() => {
    if (customerMode !== "existing") return [];
    if (!customerSearch.trim()) return [];

    return activeCustomers
      .filter(
        (customer: Customer) =>
          customer.firstName
            .toLowerCase()
            .includes(customerSearch.toLowerCase()) ||
          customer.lastName
            .toLowerCase()
            .includes(customerSearch.toLowerCase()) ||
          customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone.includes(customerSearch)
      )
      .slice(0, 5);
  }, [activeCustomers, customerSearch, customerMode]);

  // Calculate total amount based on dates and car daily rate
  useEffect(() => {
    if (formData.carId && formData.startDate && formData.endDate) {
      const car = availableCars.find((c) => c.id === formData.carId);
      if (car) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.max(0, end.getTime() - start.getTime());
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const total = days * car.dailyRate;
        setFormData((prev) => ({ ...prev, totalAmount: total }));
      }
    }
  }, [formData.carId, formData.startDate, formData.endDate, availableCars]);

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
  }, []);

  // Handle car selection
  const handleCarSelect = useCallback((carId: string) => {
    setFormData((prev) => ({ ...prev, carId }));
  }, []);

  // Handle new customer form changes
  const handleNewCustomerChange = useCallback((name: string, value: string) => {
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle communication preferences changes
  const handleCommunicationPrefChange = useCallback(
    (
      field: keyof { email: boolean; sms: boolean; phone: boolean },
      value: boolean
    ) => {
      setNewCustomer((prev) => ({
        ...prev,
        communicationPreferences: {
          ...prev.communicationPreferences,
          [field]: value,
        },
      }));
    },
    []
  );

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // If payment method changes to pay_in_slip and total amount > 0, set pay-in-slip amount
      if (
        field === "paymentMethod" &&
        value === "pay_in_slip" &&
        formData.totalAmount > 0
      ) {
        setPayInSlipDetails((prev) => ({
          ...prev,
          amount: formData.totalAmount,
        }));
      }
    },
    [formData.totalAmount]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (customerMode === "existing" && !selectedCustomer) {
      alert("Please select an existing customer");
      return false;
    }

    if (customerMode === "new") {
      if (!newCustomer.firstName.trim()) {
        alert("Please enter customer name");
        return false;
      }
      if (!newCustomer.lastName.trim()) {
        alert("Please enter customer name");
        return false;
      }
      if (!newCustomer.phone.trim()) {
        alert("Please enter customer phone number");
        return false;
      }
      if (!newCustomer.ghanaCardId.trim()) {
        alert("Please enter customer Ghana Card ID");
        return false;
      }
      if (!newCustomer.occupation.trim()) {
        alert("Please enter customer occupation");
        return false;
      }
      if (!newCustomer.gpsAddress.trim()) {
        alert("Please enter customer GPS address");
        return false;
      }
      if (!newCustomer.address.locality.trim()) {
        alert("Please enter customer locality");
        return false;
      }
      if (!newCustomer.address.town.trim()) {
        alert("Please enter customer town");
        return false;
      }
      if (!newCustomer.address.city.trim()) {
        alert("Please enter customer city");
        return false;
      }
      if (!newCustomer.address.region.trim()) {
        alert("Please enter customer region");
        return false;
      }
      if (!newCustomer.address.country.trim()) {
        alert("Please enter customer country");
        return false;
      }
      if (!newCustomer.guarantor.firstName.trim()) {
        alert("Please enter guarantor first name");
        return false;
      }
      if (!newCustomer.guarantor.lastName.trim()) {
        alert("Please enter guarantor last name");
        return false;
      }
      if (!newCustomer.guarantor.phone.trim()) {
        alert("Please enter guarantor phone number");
        return false;
      }
      if (!newCustomer.guarantor.ghanaCardId.trim()) {
        alert("Please enter guarantor Ghana Card ID");
        return false;
      }
      if (!newCustomer.guarantor.occupation.trim()) {
        alert("Please enter guarantor occupation");
        return false;
      }
      if (!newCustomer.guarantor.gpsAddress.trim()) {
        alert("Please enter guarantor GPS address");
        return false;
      }
      if (!newCustomer.guarantor.relationship.trim()) {
        alert("Please enter guarantor relationship with customer");
        return false;
      }
      if (!newCustomer.guarantor.address.locality.trim()) {
        alert("Please enter guarantor locality");
        return false;
      }
      if (!newCustomer.guarantor.address.town.trim()) {
        alert("Please enter guarantor town");
        return false;
      }
      if (!newCustomer.guarantor.address.city.trim()) {
        alert("Please enter guarantor city");
        return false;
      }
      if (!newCustomer.guarantor.address.region.trim()) {
        alert("Please enter guarantor region");
        return false;
      }
      if (!newCustomer.guarantor.address.country.trim()) {
        alert("Please enter guarantor country");
        return false;
      }
    }

    if (!formData.carId) {
      alert("Please select a vehicle");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select pickup and return dates");
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) {
      alert("Return date must be after pickup date");
      return false;
    }

    if (formData.selfDrive === "true") {
      if (!formData.driverLicenseId.trim()) {
        alert("Please enter driver's license number");
        return false;
      }
      if (!formData.driverLicenseClass.trim()) {
        alert("Please enter license class");
        return false;
      }
      if (!formData.driverLicenseIssueDate) {
        alert("Please select license issue date");
        return false;
      }
      if (!formData.driverLicenseExpiryDate) {
        alert("Please select license expiry date");
        return false;
      }

      // Check if license is expired
      const expiryDate = new Date(formData.driverLicenseExpiryDate);
      const today = new Date();
      if (expiryDate < today) {
        alert("Driver's license has expired. Please provide a valid license.");
        return false;
      }
    } else {
      // Validate driver selection if not self-drive
      if (!formData.driverId) {
        alert("Please select a driver");
        return false;
      }
    }

    // Payment method specific validations
    if (formData.paymentMethod === "pay_in_slip") {
      if (!payInSlipDetails.bankName.trim()) {
        alert("Please enter bank name for pay-in-slip");
        return false;
      }
      if (!payInSlipDetails.branch.trim()) {
        alert("Please enter bank branch");
        return false;
      }
      if (!payInSlipDetails.payeeName.trim()) {
        alert("Please enter payee name");
        return false;
      }
      if (!payInSlipDetails.referenceNumber.trim()) {
        alert("Please enter reference number");
        return false;
      }
      if (!payInSlipDetails.slipNumber.trim()) {
        alert("Please enter slip number");
        return false;
      }
    }

    if (formData.paymentMethod === "mobile_money") {
      if (!mobileMoneyDetails.phoneNumber.trim()) {
        alert("Please enter phone number for mobile money payment");
        return false;
      }
      // Validate Ghana phone number format
      const phoneRegex = /^(?:(?:\+?233|0)(?:\d{9}|\d{8}))$/;
      if (!phoneRegex.test(mobileMoneyDetails.phoneNumber)) {
        alert("Please enter a valid Ghanaian phone number");
        return false;
      }
    }

    return true;
  }, [
    customerMode,
    payInSlipDetails,
    mobileMoneyDetails,
    selectedCustomer,
    newCustomer,
    formData,
  ]);

  // Prepare booking summary for confirmation
  const prepareBookingSummary = useCallback((): BookingSummary => {
    const car = availableCars.find((c) => c.id === formData.carId) || null;
    const driver = drivers.find((d) => d.id === formData.driverId) || null;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const summary: BookingSummary = {
      customer:
        customerMode === "existing"
          ? selectedCustomer
          : {
              ...newCustomer,
              id: generateId("CUST"),
              createdAt: new Date().toISOString(),
              notes: [] as Note[],
            },
      car,
      driver,
      selfDrive: formData.selfDrive === "true",
      dates: {
        start: formData.startDate,
        end: formData.endDate,
      },
      duration,
      totalAmount: formData.totalAmount,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      paymentMethod: formData.paymentMethod,
      specialRequests: formData.specialRequests,
      paymentData: {
        ...(formData.paymentMethod === "pay_in_slip" && {
          payInSlipDetails,
        }),
        ...(formData.paymentMethod === "mobile_money" && {
          mobileMoneyDetails: {
            ...mobileMoneyDetails,
            transactionId: `MM_${Date.now()}`,
          },
        }),
      },
      // Add self-drive details if applicable
      ...(formData.selfDrive === "true" && {
        driverLicenseId: formData.driverLicenseId,
        driverLicenseClass: formData.driverLicenseClass,
        driverLicenseIssueDate: formData.driverLicenseIssueDate,
        driverLicenseExpiryDate: formData.driverLicenseExpiryDate,
      }),
    };

    return summary;
  }, [
    availableCars,
    drivers,
    formData,
    customerMode,
    selectedCustomer,
    newCustomer,
    payInSlipDetails,
    mobileMoneyDetails,
  ]);

  // Handle form submission (opens confirmation modal)
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const summary = prepareBookingSummary();
      setBookingSummary(summary);
      setShowConfirmationModal(true);
    },
    [prepareBookingSummary, validateForm]
  );

  // Function to send booking confirmation via SMS and Email
  const sendBookingConfirmation = useCallback(
    async (summary: BookingSummary): Promise<void> => {
      const { customer, car, driver, dates, totalAmount, paymentMethod } =
        summary;

      if (!customer) return;

      // SMS message
      const smsMessage = `Dear ${customer.firstName} ${
        customer.lastName
      }, your booking has been confirmed. Pickup: ${dates.start} at ${
        formData.pickupLocation || "our main office"
      }. Return: ${dates.end}. Total: $${totalAmount}. Thank you!`;

      // Email content - FIXED (paymentMethod is not optional)
      const emailContent = {
        to: customer.email,
        subject: `Booking Confirmation`,
        body: `
        <h2>Booking Confirmation</h2>
        <p>Dear ${customer.firstName} ${customer.lastName},</p>
        <p>Your booking has been confirmed with the following details:</p>
        <ul>
          <li><strong>Vehicle:</strong> ${car?.make} ${car?.model} (${
          car?.licensePlate || "N/A"
        })</li>
          <li><strong>Pickup Date:</strong> ${dates.start}</li>
          <li><strong>Return Date:</strong> ${dates.end}</li>
          <li><strong>Pickup Location:</strong> ${
            formData.pickupLocation || "Main Office"
          }</li>
          <li><strong>Return Location:</strong> ${
            formData.dropoffLocation || formData.pickupLocation || "Main Office"
          }</li>
          <li><strong>Total Amount:</strong> $${totalAmount}</li>
          <li><strong>Payment Method:</strong> ${paymentMethod
            .replace("_", " ")
            .toUpperCase()}</li>
          ${
            driver
              ? `<li><strong>Driver:</strong> ${driver.name} (${driver.phone})</li>`
              : ""
          }
          ${
            formData.specialRequests
              ? `<li><strong>Special Requests:</strong> ${formData.specialRequests}</li>`
              : ""
          }
        </ul>
        <p>Please bring your driver's license and payment for any additional charges upon pickup.</p>
        <p>Thank you for choosing our service!</p>
        <br>
        <p>Best regards,<br>Transport Manager Team</p>
      `,
      };

      console.log("SMS Message:", smsMessage);
      console.log("Email Content:", emailContent);
      return Promise.resolve();
    },
    [
      formData.pickupLocation,
      formData.dropoffLocation,
      formData.specialRequests,
    ]
  );

  // Handle final booking confirmation
  const createBookingAfterPayment = useCallback(async () => {
    let customerId = "";
    let customerName = "";

    // Handle customer creation or selection
    if (customerMode === "new") {
      const newCustomerData: Customer = {
        ...newCustomer,
        id: generateId("CUST"),
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        status: "active" as const,
        totalBookings: 0,
        totalSpent: 0,
        notes: [] as Note[],
        createdAt: new Date().toISOString(),
        lastBookingDate: new Date().toISOString(),
        communicationPreferences: {
          email: true,
          sms: true,
          phone: false,
        },
        loyaltyTier: "bronze" as const,
      };

      dispatch(addCustomer(newCustomerData));
      customerId = newCustomerData.id;
      customerName = newCustomerData.firstName + " " + newCustomerData.lastName;
    } else {
      customerId = selectedCustomer!.id;
      customerName =
        selectedCustomer!.firstName + " " + selectedCustomer!.lastName;
    }

    // Determine payment status based on method
    const finalPaymentStatus =
      formData.paymentMethod === "cash"
        ? "pending" // Cash is pending until collected
        : formData.paymentMethod === "pay_in_slip"
        ? "pending" // Pay-in-slip needs verification
        : formData.paymentStatus; // For mobile money, use the actual status

    // Create booking
    const bookingId = generateId("BOOK");
    const booking = {
      id: bookingId,
      carId: formData.carId,
      customerId: customerId,
      customerName: customerName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: "confirmed" as const,
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,

      totalAmount: formData.totalAmount,
      receiptGenerated: false,
      paymentMethod: formData.paymentMethod,
      paymentStatus: finalPaymentStatus,
      hasDriver: formData.selfDrive,
      amountPaid: formData.totalAmount,
      currentMileage: formData.currentMileage,

      // Include payment details
      ...(formData.paymentMethod === "pay_in_slip" && {
        payInSlipDetails,
      }),
      ...(formData.paymentMethod === "mobile_money" && {
        mobileMoneyDetails: {
          ...mobileMoneyDetails,
          transactionId: `PS_${Date.now()}`, // Generate a mock transaction ID
        },
      }),
    };

    // Dispatch booking action
    dispatch(createBooking({ CarId: formData.carId, payload: booking }));
    dispatch(updateCarStatus({ CarId: formData.carId, status: "rented" }));

    // Send confirmation messages
    if (bookingSummary) {
      await sendBookingConfirmation(bookingSummary);
    }

    setIsProcessing(false);
    setShowConfirmationModal(false);

    alert("Booking created successfully! Confirmation sent to customer.");
    router.push("/dashboard/bookings");
  }, [
    customerMode,
    newCustomer,
    selectedCustomer,
    formData,
    payInSlipDetails,
    mobileMoneyDetails,
    bookingSummary,
    dispatch,
    router,
    sendBookingConfirmation,
  ]);

  const handleConfirmBooking = useCallback(async () => {
    if (!bookingSummary) return;

    setIsProcessing(true);

    try {
      // Handle different payment methods
      switch (formData.paymentMethod) {
        case "mobile_money":
          // Initialize Paystack payment
          const paystack = new PaystackPop();

          paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
            email: selectedCustomer?.email || newCustomer.email,
            amount: formData.totalAmount * 100, // GHS in pesewas
            currency: "GHS",
            reference: `BOOK_${Date.now()}`,
            onSuccess: (transaction: { reference: string }) => {
              console.log("Payment Successful", transaction);
              // Update status locally before saving
              setFormData((prev) => ({ ...prev, paymentStatus: "paid" }));
              createBookingAfterPayment();
            },
            onCancel: () => {
              setIsProcessing(false);
              alert("Payment cancelled by user.");
            },
            metadata: {
              custom_fields: [
                {
                  display_name: "Customer Name",
                  variable_name: "customer_name",
                  value: bookingSummary.customer?.firstName,
                },
                {
                  display_name: "Car ID",
                  variable_name: "car_id",
                  value: formData.carId,
                },
              ],
            },
          }); // Don't proceed with booking creation yet

        case "pay_in_slip":
        case "cash":
          // For cash and pay-in-slip, create booking immediately
          await createBookingAfterPayment();
          break;

        default:
          throw new Error("Invalid payment method");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setIsProcessing(false);
      alert("Failed to create booking. Please try again.");
    }
  }, [
    bookingSummary,
    newCustomer,
    selectedCustomer,
    formData,
    createBookingAfterPayment,
  ]);

  // Calculate minimum date (today)
  const getMinDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Calculate maximum date (1 year from now)
  const getMaxDate = useCallback(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toISOString().split("T")[0];
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Fill in the details below to create a new booking
          </p>
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
          totalAmount={formData.totalAmount}
          paymentMethod={formData.paymentMethod}
          carId={formData.carId}
          startDate={formData.startDate}
          endDate={formData.endDate}
          availableCars={availableCars}
          onPaymentMethodChange={(method) =>
            handleFieldChange("paymentMethod", method)
          }
          // Pass pay-in-slip props
          payInSlipDetails={payInSlipDetails}
          onPayInSlipChange={handlePayInSlipChange}
          // Pass mobile money props
          mobileMoneyDetails={mobileMoneyDetails}
          onMobileMoneyChange={handleMobileMoneyChange}
        />

        {/* Submit Button */}
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
              (customerMode === "new" &&
                (!newCustomer.firstName ||
                  !newCustomer.lastName ||
                  !newCustomer.phone ||
                  !newCustomer.ghanaCardId ||
                  !newCustomer.occupation ||
                  !newCustomer.gpsAddress ||
                  !newCustomer.address.locality ||
                  !newCustomer.address.town ||
                  !newCustomer.address.city ||
                  !newCustomer.address.region ||
                  !newCustomer.address.country ||
                  !newCustomer.guarantor.firstName ||
                  !newCustomer.guarantor.lastName ||
                  !newCustomer.guarantor.phone ||
                  !newCustomer.guarantor.ghanaCardId ||
                  !newCustomer.guarantor.relationship ||
                  !newCustomer.guarantor.occupation ||
                  !newCustomer.guarantor.gpsAddress ||
                  !newCustomer.guarantor.address.locality ||
                  !newCustomer.guarantor.address.town ||
                  !newCustomer.guarantor.address.region ||
                  !newCustomer.guarantor.address.country)) ||
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
