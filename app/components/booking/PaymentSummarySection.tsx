"use client";

import { motion } from "framer-motion";
import { PayInSlipDetails, MobileMoneyDetails } from "../../types/booking";
import { Car } from "@/app/types/cars";
interface PaymentSummarySectionProps {
  totalAmount: number;
  paymentMethod: string;
  carId: string;
  startDate: string;
  endDate: string;
  availableCars: Car[];
  dailyRate: number;                         // <-- new
  discount: number;                          // <-- new
  onDailyRateChange: (value: number) => void; // <-- new
  onDiscountChange: (value: number) => void; 
  onPaymentMethodChange: (method: string) => void;
  payInSlipDetails?: PayInSlipDetails;
  onPayInSlipChange?: (field: string, value: string | number) => void;
  mobileMoneyDetails?: MobileMoneyDetails;
  onMobileMoneyChange?: (field: string, value: string) => void;
}

const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function PaymentSummarySection({
  totalAmount,
  paymentMethod,
  carId,
  startDate,
  endDate,
  availableCars,
  dailyRate,
  discount,
  onDailyRateChange,
  onDiscountChange,
  onPaymentMethodChange,
  payInSlipDetails = {
    bankName: "",
    branch: "",
    payeeName: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    slipNumber: "",
  },
  onPayInSlipChange,
  mobileMoneyDetails = {
    transactionId: generateId("MOMO-"),
    provider: "MTN",
    phoneNumber: "",
  },
  onMobileMoneyChange,
}: PaymentSummarySectionProps) {
  const selectedCar = availableCars.find((c) => c.id === carId);
  const days =
  startDate && endDate
    ? Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const subtotal = dailyRate * days;
  const calculatedTotal = Math.max(0, subtotal - discount);

  const mobileMoneyProviders = ["MTN", "Vodafone", "AirtelTigo"];

  const paymentMethodOptions = [
    { value: "cash", label: "CASH" },
    { value: "mobile_money", label: "MOBILE MONEY" },
    { value: "pay_in_slip", label: "PAY-IN-SLIP" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payment Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-700 dark:text-gray-300">
            Total Amount:
          </span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ¢{totalAmount.toLocaleString()}
          </span>
        </div>
         {selectedCar && startDate && endDate && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="font-medium ...">Calculation Breakdown:</h3>
            <div className="space-y-3">
              

              {/* Entered daily rate – editable */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Entered Daily Rate:
                </span>
                <div className="flex items-center">
                  <span className="mr-1">¢</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={dailyRate || ""}
                    onChange={(e) =>
                      onDailyRateChange(parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                    placeholder="0.00"
                  />
                  <span className="ml-1">/day</span>
                </div>
              </div>

              {/* Days */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Number of Days:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {days} days
                </span>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="text-gray-900 dark:text-white">
                  ¢{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Discount – editable */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount:
                </span>
                <div className="flex items-center">
                  <span className="mr-1">¢</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount || ""}
                    onChange={(e) =>
                      onDiscountChange(parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Final total */}
              <div className="flex justify-between text-sm font-medium pt-2 border-t ...">
                <span className="text-gray-700 dark:text-gray-300">Total:</span>
                <span className="text-gray-900 dark:text-white">
                  ¢{calculatedTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <div className="flex gap-4 flex-wrap">
            {paymentMethodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPaymentMethodChange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  paymentMethod === option.value
                    ? "bg-blue-600 dark:bg-blue-700 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile Money Details Section */}
      {paymentMethod === "mobile_money" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 mt-4 dark:bg-blue-900/20 rounded-lg p-4 space-y-4"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">
            Mobile Money Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Provider
              </label>
              <select
                value={mobileMoneyDetails.provider}
                onChange={(e) =>
                  onMobileMoneyChange?.("provider", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {mobileMoneyProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={mobileMoneyDetails.phoneNumber}
                onChange={(e) =>
                  onMobileMoneyChange?.("phoneNumber", e.target.value)
                }
                placeholder="024 123 4567"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You will be redirected to Paystack to complete the payment.
          </p>
        </motion.div>
      )}

      {/* Pay-in-Slip Details Section */}
      {paymentMethod === "pay_in_slip" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-green-50 mt-4 dark:bg-green-900/20 rounded-lg p-4 space-y-4"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">
            Pay-in-Slip Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                value={payInSlipDetails.bankName}
                onChange={(e) =>
                  onPayInSlipChange?.("bankName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch *
              </label>
              <input
                type="text"
                value={payInSlipDetails.branch}
                onChange={(e) => onPayInSlipChange?.("branch", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payee Name *
              </label>
              <input
                type="text"
                value={payInSlipDetails.payeeName}
                onChange={(e) =>
                  onPayInSlipChange?.("payeeName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount Paid *
              </label>
              <span className="text-xl font-bold  text-gray-900 dark:text-white">
                <span className="text-2xl mr-2">¢</span>
                {totalAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={payInSlipDetails.paymentDate}
                onChange={(e) =>
                  onPayInSlipChange?.("paymentDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                value={payInSlipDetails.referenceNumber}
                onChange={(e) =>
                  onPayInSlipChange?.("referenceNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slip Number *
              </label>
              <input
                type="text"
                value={payInSlipDetails.slipNumber}
                onChange={(e) =>
                  onPayInSlipChange?.("slipNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please ensure all details match your bank slip exactly.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
