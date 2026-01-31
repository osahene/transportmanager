"use client";

import {
  FaCheckCircle,
  FaTimes,
  FaMobileAlt,
  FaMoneyBill,
  FaUniversity,
} from "react-icons/fa";
import { BookingSummary } from "../../types/booking";
// import { Customer } from "../../lib/slices/customersSlice";

interface ConfirmationModalProps {
  show: boolean;
  summary: BookingSummary;
  customerMode: "existing" | "new";
  isProcessing: boolean;
  specialRequests: string;
  onClose: () => void;
  onConfirm: () => void;
  paymentMethod: string;
}

export default function ConfirmationModal({
  show,
  summary,
  customerMode,
  isProcessing,
  specialRequests,
  onClose,
  onConfirm,
  paymentMethod,
}: ConfirmationModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          Confirm Booking
        </h2>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3">
              CUSTOMER DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.firstName} {summary.customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customer Type
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {customerMode === "existing"
                    ? "Existing Customer"
                    : "New Customer"}
                </p>
              </div>
            </div>
          </div>
          {/* Customer Information */}
          <div className="bg-blue-50 dark:bg-red-300/50 rounded-lg p-4">
            <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3">
              GUARANTOR DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.guarantor.firstName} {summary.customer?.guarantor.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.guarantor.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.customer?.guarantor.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                Relationship
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                 {summary.customer?.guarantor.relationship}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {summary.car && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3">
                VEHICLE DETAILS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vehicle
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {summary.car.make} {summary.car.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    License Plate
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {summary.car.licensePlate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Color
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {summary.car.color}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Daily Rate
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ¢{summary.car.dailyRate}/day
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3">
              BOOKING DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pickup Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(summary.dates.start)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Return Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(summary.dates.end)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duration
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.duration} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pickup Location
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.pickupLocation || "Main Office"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drop-off Location
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.dropoffLocation || "Main Office"}
                </p>
              </div>
            </div>
            <div className="pt-1 mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                {summary.selfDrive ? "Self-drive Details" : "Assigned Driver"}
              </h3>
            </div>

            {summary.selfDrive ? (
              <div>
                <div className="mb-2">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Self-drive Selected
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 mt-3 space-y-2">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">License No:</span>{" "}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.driverLicenseId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Class:</span>{" "}
                      </p>

                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.driverLicenseClass}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Issue Date:</span>{" "}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.driverLicenseIssueDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Expiry Date:</span>{" "}
                      </p>
                      <p>{summary.driverLicenseExpiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {summary.driver ? (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {summary.driver.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {summary.driver.phone} | {summary.driver.role}
                    </p>
                  </div>
                ) : (
                  <p className="text-yellow-600 dark:text-yellow-400">
                    No driver assigned
                  </p>
                )}
              </div>
            )}
            {specialRequests && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Special Requests
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-3">
              PAYMENT SUMMARY
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ¢{summary.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">
                  Total Amount
                </span>
                <span className="text-gray-900 dark:text-white">
                  ¢{summary.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Method
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.paymentMethod.replace("_", " ").toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Icons */}
          <div className="space-y-6">
            {/* Payment Method Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                paymentMethod === "cash"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : paymentMethod === "mobile_money"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              }`}
            >
              {paymentMethod === "cash" && <FaMoneyBill />}
              {paymentMethod === "mobile_money" && <FaMobileAlt />}
              {paymentMethod === "pay_in_slip" && <FaUniversity />}
              <span>
                {paymentMethod === "mobile_money"
                  ? "Mobile Money"
                  : paymentMethod === "pay_in_slip"
                  ? "Pay-in-Slip"
                  : "Cash Payment"}
              </span>
            </div>
            {paymentMethod === "pay_in_slip" &&
              summary.paymentData?.payInSlipDetails && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaUniversity />
                    Pay-in-Slip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bank Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.payInSlipDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Branch
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.payInSlipDetails.branch}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payee Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.payInSlipDetails.payeeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amount Paid
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ¢{summary.paymentData.payInSlipDetails.amount.toLocaleString()}                        {summary.paymentData.payInSlipDetails.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payment Date
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(
                          summary.paymentData.payInSlipDetails.paymentDate
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reference Number
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.payInSlipDetails.referenceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Slip Number
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.payInSlipDetails.slipNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Mobile Money Details Section */}
            {paymentMethod === "mobile_money" &&
              summary.paymentData?.mobileMoneyDetails && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaMobileAlt />
                    Mobile Money Payment
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Provider
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.mobileMoneyDetails.provider}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {summary.paymentData.mobileMoneyDetails.phoneNumber}
                      </p>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      You will be redirected to Paystack to complete the
                      payment.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Confirmation Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="sendNotifications"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="sendNotifications"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Send confirmation to customer via{" "}
                  {summary.customer?.communicationPreferences?.email
                    ? "email"
                    : ""}
                  {summary.customer?.communicationPreferences?.email &&
                    summary.customer?.communicationPreferences?.sms &&
                    " and "}
                  {summary.customer?.communicationPreferences?.sms ? "SMS" : ""}
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A booking confirmation will be sent to the customer with all the
                details.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className={`px-6 py-3 font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === "mobile_money"
                    ? "bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800"
                    : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    {paymentMethod === "mobile_money"
                      ? "Proceed to Payment"
                      : "Confirm & Create Booking"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
