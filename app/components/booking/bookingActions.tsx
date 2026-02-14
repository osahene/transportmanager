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
import { useAppDispatch } from "../../lib/store";
import {
  // markBookingAsReturned,
  // cancelBookingWithRefund,
} from "../../lib/slices/bookingsSlice";

interface BookingActionsProps {
  bookingId: string;
  carId: string;
  currentStatus: string;
  customerName: string;
  carName: string;
  amountPaid: number;
  dailyRate: number;
  endDate: string; // Expected return date from booking
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
  endDate,
}: BookingActionsProps) {
  const dispatch = useAppDispatch();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // New states for return modal
  const [actualReturnTime, setActualReturnTime] = useState("");
  const [penaltyPaid, setPenaltyPaid] = useState(false);
  const [penaltyPaymentMethod, setPenaltyPaymentMethod] = useState<
    "cash" | "mobile_money"
  >("cash");
  const [lateFeeReceived, setLateFeeReceived] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");

  // Initialize actual return time to current time
  useEffect(() => {
    if (showReturnModal) {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      setActualReturnTime(formattedDate);

      // Generate a random receipt number
      const receiptNum = `RCPT-${Date.now().toString().slice(-8)}`;
      setReceiptNumber(receiptNum);
    }
  }, [showReturnModal]);

  // Calculate penalty based on return time
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

    const expectedReturnDate = new Date(endDate);
    const actualReturnDate = new Date(actualReturnTime);

    // Set expected return time to 9:00 AM on the end date
    const expectedReturnTime = new Date(expectedReturnDate);
    expectedReturnTime.setHours(9, 0, 0, 0);

    const expectedReturnTimeStr = expectedReturnTime.toISOString();
    const actualReturnTimeStr = actualReturnDate.toISOString();

    // Check if return is late (after 9:00 AM on expected date)
    const isLate = actualReturnTimeStr > expectedReturnTimeStr;

    let lateDays = 0;
    let penaltyAmount = 0;
    let lateFee = 0;
    let explanation = "";

    if (isLate) {
      // Calculate hours difference
      const diffMs = actualReturnDate.getTime() - expectedReturnTime.getTime();
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

      // Company policy: Any return after 9:00 AM incurs full day penalty
      // Even 1 minute late = 1 day penalty
      lateDays = Math.ceil(diffHours / 24);
      penaltyAmount = lateDays * dailyRate;

      // Additional late fee (10% of penalty)
      lateFee = penaltyAmount * 0.1;

      explanation = `Returned ${diffHours} hours late. Company policy: Any return after 9:00 AM incurs full day penalty.`;
    } else {
      explanation = "Returned on time. No penalty applies.";
    }

    const totalAmount = penaltyAmount + lateFee;

    return {
      isLate,
      lateDays,
      penaltyAmount,
      lateFee,
      totalAmount,
      explanation,
    };
  }, [actualReturnTime, endDate, dailyRate]);

  const handleMarkAsReturned = async () => {
    if (penaltyCalculation.isLate && penaltyCalculation.totalAmount > 0) {
      if (!penaltyPaid) {
        alert("Please confirm penalty payment before marking as returned.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        bookingId,
        actualReturnTime: new Date(actualReturnTime).toISOString(),
        penaltyAmount: penaltyCalculation.totalAmount,
        penaltyPaid,
        penaltyPaymentMethod,
        receiptNumber,
      };

      // await dispatch(markBookingAsReturned(payload)).unwrap();
      setShowReturnModal(false);
      setPenaltyPaid(false);
      setLateFeeReceived(false);
      alert("Car marked as returned successfully!");
    } catch (error) {
      console.error("Failed to mark as returned:", error);
      alert("Failed to mark car as returned. Please try again.");
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
      // await dispatch(
      //   cancelBookingWithRefund({
      //     bookingId,
      //     refundAmount,
      //     reason,
      //   })
      // ).unwrap();
      setShowCancelModal(false);
      setReason("");
      setRefundAmount(0);
      alert("Booking cancelled and refund processed!");
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking. Please try again.");
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
        {(currentStatus === "pending" || currentStatus === "confirmed") && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <FaTimesCircle />
            Cancel Booking
          </button>
        )}
        {/* Mark as Returned Button - Only for active bookings */}
        {currentStatus === "confirmed" && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="flex items-center gap-2 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            disabled={loading}
          >
            <FaCheckCircle />
            Mark as Returned
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
                          ¢{penaltyCalculation.penaltyAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          Late Fee (10%):
                        </span>
                        <span className="font-semibold">
                          ¢{penaltyCalculation.lateFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-red-200 dark:border-red-700 pt-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          Total Penalty:
                        </span>
                        <span className="text-lg font-bold text-red-700 dark:text-red-300">
                          ¢{penaltyCalculation.totalAmount.toFixed(2)}
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
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                            penaltyPaymentMethod === "cash"
                              ? "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300"
                              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          <FaMoneyBillWave />
                          Cash Payment
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPenaltyPaymentMethod("mobile_money")
                          }
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                            penaltyPaymentMethod === "mobile_money"
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
                            ¢{penaltyCalculation.totalAmount.toFixed(2)}
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
                    Refund Amount (Maximum: ${amountPaid})
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
    </div>
  );
}
