"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaMobileAlt,
  FaClock,
  FaCalendarCheck,
} from "react-icons/fa";
import { useMarkBookingAsReturned, useCancelBooking, useExtendBooking } from "@/app/lib/hooks/useBookings";

interface BookingActionsProps {
  bookingId: string;
  carId: string;
  currentStatus: string;
  customerName: string;
  carName: string;
  amountPaid: number;
  dailyRate: number;
  endDate: string; // Expected return date from booking
  startDate: string; // Booking start date
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorEmail?: string;
  guarantorRelationship?: string;
  guarantorAddressCity?: string;
  guarantorAddressRegion?: string;
  guarantorAddressCountry?: string;

}

interface PenaltyCalculation {
  isLate: boolean;
  lateDays: number;
  penaltyAmount: number;
  lateFee: number;
  totalAmount: number;
  explanation: string;
}

export default function BookingActions({
  bookingId,
  currentStatus,
  customerName,
  carName,
  amountPaid,
  dailyRate,
  startDate,
  endDate,
  guarantorName,
  guarantorPhone,
  guarantorEmail,
  guarantorRelationship,
  guarantorAddressCity,
  guarantorAddressRegion,
  guarantorAddressCountry,
}: BookingActionsProps) {
  // Mutations
  const [loading, setLoading] = useState(false);
  const markAsReturnedMutation = useMarkBookingAsReturned();
  const cancelBookingMutation = useCancelBooking();
  const extendBookingMutation = useExtendBooking();

  // Show Modals
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);

  // Return Modal fields
  const [returnMileage, setReturnMileage] = useState("");
  const [actualReturnTime, setActualReturnTime] = useState("");
  const [penaltyPaid, setPenaltyPaid] = useState(false);
  const [penaltyPaymentMethod, setPenaltyPaymentMethod] = useState<
    "cash" | "mobile_money"
  >("cash");
  const [receiptNumber, setReceiptNumber] = useState("");

  // Cancel Modal fields
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState("");

  const [newEndDate, setNewEndDate] = useState("");
  const [guarantorData, setGuarantorData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    relationship: "",
    address_city: "",
    address_region: "",
    address_country: "",
  });


  // computed values for extension
  const extraDays = useMemo(() => {
    if (!newEndDate) return 0;
    const currentEnd = new Date(endDate);
    const newEnd = new Date(newEndDate);
    const diffTime = newEnd.getTime() - currentEnd.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [newEndDate, endDate]);

  const extraAmount = extraDays * dailyRate;
  const newTotalAmount = (Number(amountPaid)) + (Number(extraAmount));
  const today = new Date();
  today.setHours(0, 0, 0, 0); // compare only dates

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const isActive = currentStatus === "rented" || currentStatus === "extended_booking";
  const isCompletedOrCancelled = ["completed", "cancelled"].includes(currentStatus);

  // Cancel button: available until end date (inclusive) and not completed/cancelled
  const canCancel = !isCompletedOrCancelled && today <= end;

  // Return button: available only for active bookings
  const canReturn = isActive;

  const canExtend = isActive && today <= end;

  useEffect(() => {
    if (showExtendModal) {
      setGuarantorData({
        first_name: guarantorName?.split(" ")[0] || "",
        last_name: guarantorName?.split(" ")[1] || "",
        phone: guarantorPhone || "",
        email: guarantorEmail || "",
        relationship: guarantorRelationship || "",
        address_city: guarantorAddressCity || "",
        address_region: guarantorAddressRegion || "",
        address_country: guarantorAddressCountry || "",
      });
    }
  }, [showExtendModal, guarantorName, guarantorPhone, guarantorEmail, guarantorRelationship, guarantorAddressCity, guarantorAddressRegion, guarantorAddressCountry]);

  const penaltyCalculation = useMemo((): PenaltyCalculation => {
    if (!actualReturnTime || !endDate) {
      return {
        isLate: false,
        lateDays: 0,
        penaltyAmount: 0,
        lateFee: 0,
        totalAmount: 0,
        explanation: "",
      };
    }

    const actual = new Date(actualReturnTime);
    const expected = new Date(endDate);
    expected.setHours(9, 0, 0, 0);

    const isLate = actual > expected;
    const lateDays = isLate
      ? Math.ceil((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const penaltyAmount = lateDays * dailyRate;
    const lateFee = Math.round(penaltyAmount * 0.1 * 100) / 100;
    const totalAmount = penaltyAmount + lateFee;
    const explanation = isLate
      ? `Car returned ${lateDays} day(s) late. Penalty applies.`
      : "Car returned on time. No penalty.";

    return {
      isLate,
      lateDays,
      penaltyAmount,
      lateFee,
      totalAmount,
      explanation,
    };
  }, [actualReturnTime, endDate, dailyRate]);

  // New states for return modal
  const [lateFeeReceived, setLateFeeReceived] = useState(false);

  // Initialize actual return time to current time
  useEffect(() => {
    if (showReturnModal) {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 16);
      setActualReturnTime(formattedDate);
      setReceiptNumber(`RCPT-${Date.now().toString().slice(-8)}`);
    }
  }, [showReturnModal]);

  const handleMarkAsReturned = async () => {
    if (penaltyCalculation.isLate && penaltyCalculation.totalAmount > 0 && !penaltyPaid) {
      alert("Please confirm penalty payment before marking as returned.");
      return;
    }
    setLoading(true);
    try {
      await markAsReturnedMutation.mutateAsync({
        bookingId,
        actualReturnTime: new Date(actualReturnTime).toISOString(),
        returnMileage: parseInt(returnMileage) || undefined,
      });
      setShowReturnModal(false);
      alert("Car marked as returned successfully!");
    } catch (error) {
      alert("Failed to mark as returned. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    setLoading(true);
    try {
      await cancelBookingMutation.mutateAsync({ bookingId, refundAmount, reason });
      setShowCancelModal(false);
      alert("Booking cancelled and refund processed!");
    } catch (error) {
      alert("Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendBooking = async () => {
    if (!newEndDate) {
      alert("Please select a new end date.");
      return;
    }
    if (new Date(newEndDate) <= new Date(endDate)) {
      alert("New end date must be after the current end date.");
      return;
    }
    setLoading(true);
    try {
      await extendBookingMutation.mutateAsync({
        bookingId,
        newEndDate,
        guarantor: guarantorData,
      });
      setShowExtendModal(false);
      alert("Booking extended successfully!");
    } catch (error) {
      alert("Failed to extend booking.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-row space-x-2">
        {/* Cancel Booking Button - For pending/confirmed bookings */}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <FaTimesCircle />
            Cancel Booking
          </button>
        )}

        {canReturn && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <FaCheckCircle />
            Mark as Returned
          </button>
        )}

        {canExtend && (
          <button
            onClick={() => setShowExtendModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <FaCalendarCheck />
            Extend Booking
          </button>
        )}

      </div>

      {/* Enhanced Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaCalendarCheck />
                  Process Car Return
                </h2>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setPenaltyPaid(false);
                    setLateFeeReceived(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Car and Customer Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Return Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Car
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {carName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Customer
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customerName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected vs Actual Return Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <FaClock />
                      Expected Return
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400">
                      {formatDate(endDate)} at 9:00 AM
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                      Company Policy: Returns must be before 9:00 AM
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                      Actual Return Time *
                    </h4>
                    <input
                      type="datetime-local"
                      value={actualReturnTime}
                      onChange={(e) => setActualReturnTime(e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Current time is set as default
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Return Mileage (km)
                    </label>
                    <input
                      type="number"
                      value={returnMileage}
                      onChange={(e) => setReturnMileage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Penalty Calculation Section */}
                {penaltyCalculation.isLate ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Late Return Penalty
                      </h3>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                        {penaltyCalculation.lateDays} day(s) late
                      </span>
                    </div>

                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      {penaltyCalculation.explanation}
                    </p>

                    {/* Penalty Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Base Penalty ({penaltyCalculation.lateDays} day(s)):
                        </span>
                        <span className="font-semibold">
                          ¢{Number(penaltyCalculation.penaltyAmount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Late Fee (10%):
                        </span>
                        <span className="font-semibold">
                          ¢{Number(penaltyCalculation.lateFee).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-red-200 dark:border-red-700 pt-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Total Penalty:
                        </span>
                        <span className="text-lg font-bold text-red-700 dark:text-red-300">
                          ¢{Number(penaltyCalculation.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Penalty Payment Method *
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setPenaltyPaymentMethod("cash")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${penaltyPaymentMethod === "cash"
                            ? "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                        >
                          <FaMoneyBillWave />
                          Cash Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => setPenaltyPaymentMethod("mobile_money")}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${penaltyPaymentMethod === "mobile_money"
                            ? "bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                            }`}
                        >
                          <FaMobileAlt />
                          Mobile Money
                        </button>
                      </div>
                    </div>

                    {/* Payment Confirmation */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="penaltyPaid"
                          checked={penaltyPaid}
                          onChange={(e) => setPenaltyPaid(e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label
                          htmlFor="penaltyPaid"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          I confirm that the penalty of{" "}
                          <span className="font-bold text-red-600 dark:text-red-400">
                            ¢{(Number(penaltyCalculation.totalAmount).toFixed(2))}
                          </span>{" "}
                          has been received via{" "}
                          {penaltyPaymentMethod === "cash"
                            ? "cash"
                            : "mobile money"}
                        </label>
                      </div>

                      {penaltyPaid && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-700 dark:text-green-300">
                                Receipt Number:
                              </p>
                              <p className="text-lg font-bold text-green-800 dark:text-green-400">
                                {receiptNumber}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(receiptNumber);
                                alert("Receipt number copied to clipboard!");
                              }}
                              className="px-3 py-1 text-sm bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-700"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />
                      <div>
                        <h3 className="font-semibold text-green-700 dark:text-green-300">
                          Returned On Time
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {penaltyCalculation.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setPenaltyPaid(false);
                      setLateFeeReceived(false);
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkAsReturned}
                    disabled={
                      loading || (penaltyCalculation.isLate && !penaltyPaid)
                    }
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaCheckCircle />
                        {penaltyCalculation.isLate
                          ? "Confirm Return with Penalty"
                          : "Confirm Return"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal (unchanged) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Cancel Booking with Refund
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Cancellation *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Please provide a reason for cancellation..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refund Amount (Maximum: ¢{amountPaid})
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) =>
                      setRefundAmount(
                        Math.min(
                          amountPaid,
                          Math.max(0, Number(e.target.value))
                        )
                      )
                    }
                    min="0"
                    max={amountPaid}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Full refund available if cancelled more than 7 days in
                    advance
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <FaTimesCircle />
                      Cancel & Process Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Extend Booking
              </h2>

              {/* Summary Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Customer:</span> {customerName}</p>
                  <p><span className="font-medium">Vehicle:</span> {carName}</p>
                  <p><span className="font-medium">Current End Date:</span> {new Date(endDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Daily Rate:</span> ¢{(Number(dailyRate)).toFixed(2)}</p>
                  <p><span className="font-medium">Current Total:</span> ¢{Number(amountPaid).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* New End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New End Date *
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={endDate} // cannot be before current end
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Cost Breakdown */}
                {extraDays > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Extension Cost</h4>
                    <div className="space-y-1">
                      <p>Extra days: {extraDays}</p>
                      <p>Daily rate: ¢{Number(dailyRate).toFixed(2)}</p>
                      <p className="text-lg font-bold">Extra amount: ¢{Number(extraAmount).toFixed(2)} to be paid</p>
                      <p className="border-t border-green-200 dark:border-green-700 pt-1 mt-1">
                        New total: <span className="font-bold">¢{Number(newTotalAmount).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Guarantor Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Guarantor Information (optional)
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Update guarantor details if needed.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={guarantorData.first_name}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, first_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={guarantorData.last_name}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, last_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={guarantorData.phone}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={guarantorData.email}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={guarantorData.relationship}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, relationship: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City
                      </label>
                      <input
                        type="text"
                        value={guarantorData.address_city}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, address_city: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Region
                      </label>
                      <input
                        type="text"
                        value={guarantorData.address_region}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, address_region: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <input
                        type="text"
                        value={guarantorData.address_country}
                        onChange={(e) =>
                          setGuarantorData({ ...guarantorData, address_country: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendBooking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Extend Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}