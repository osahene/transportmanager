// /components/cars/OthersTable.tsx
import { useState } from "react";
import { FinancialTransaction } from "../../types/finance";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaMoneyBillWave,
  FaTag,
  FaReceipt,
} from "react-icons/fa";

interface OthersTableProps {
  transactions: FinancialTransaction[];
  onAddEvent: () => void;
}

const OthersTable: React.FC<OthersTableProps> = ({
  transactions,
  onAddEvent,
}) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<FinancialTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter transactions that are not bookings/maintenance/insurance
  const otherTransactions = transactions.filter(
    (transaction) =>
      !["revenue", "maintenance", "insurance"].includes(transaction.type)
  );

  const handleViewDetails = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "refund":
        return "🔄";
      case "expense":
        return "💸";
      case "purchase":
        return "🛒";
      case "salary":
        return "💰";
      case "office_expense":
        return "🏢";
      case "marketing":
        return "📢";
      default:
        return "📌";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "refund":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "purchase":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "salary":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === "refund") {
      return "text-blue-600 dark:text-blue-400";
    }
    if (
      ["expense", "purchase", "salary", "office_expense", "marketing"].includes(
        type
      )
    ) {
      return "text-red-600 dark:text-red-400";
    }
    return amount >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  const formatTransactionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Other Financial Records
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total {otherTransactions.length} transaction(s)
            </p>
          </div>
          <button
            onClick={onAddEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaReceipt className="w-4 h-4" />
            Add Record
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {otherTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaReceipt className="w-12 h-12 text-gray-400 mb-2" />
                      <p>No financial records found</p>
                      <p className="text-sm mt-1">
                        Add other financial transactions (refunds, expenses,
                        etc.)
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                otherTransactions
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">
                            {getTransactionIcon(transaction.type)}
                          </span>
                          <div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getTransactionColor(
                                transaction.type
                              )}`}
                            >
                              {formatTransactionType(transaction.type)}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Ref: {transaction.reference}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendar className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <FaTag className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Recorded by: {transaction.recordedBy}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave
                            className={`w-4 h-4 ${getAmountColor(
                              transaction.type,
                              transaction.amount
                            )}`}
                          />
                          <div
                            className={`font-bold ${getAmountColor(
                              transaction.type,
                              transaction.amount
                            )}`}
                          >
                            ¢{Math.abs(transaction.amount).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {transaction.paymentMethod
                            .replace("_", " ")
                            .toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            transaction.status
                          )}`}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(transaction)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => {
                              /* Handle edit */
                            }}
                            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this transaction?"
                                )
                              ) {
                                /* Handle delete */
                              }
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for transaction details */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg ${
                    selectedTransaction.type === "refund"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Type
                  </label>
                  <p
                    className={`font-medium ${
                      selectedTransaction.type === "refund"
                        ? "text-blue-800 dark:text-blue-300"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {formatTransactionType(selectedTransaction.type)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    selectedTransaction.type === "refund"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Reference
                  </label>
                  <p
                    className={`font-mono ${
                      selectedTransaction.type === "refund"
                        ? "text-blue-800 dark:text-blue-300"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {selectedTransaction.reference}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedTransaction.date)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Recorded By
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedTransaction.recordedBy}
                  </p>
                </div>
              </div>

              {/* Amount Section */}
              <div
                className={`p-4 rounded-lg ${
                  getAmountColor(
                    selectedTransaction.type,
                    selectedTransaction.amount
                  ).includes("blue")
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : getAmountColor(
                        selectedTransaction.type,
                        selectedTransaction.amount
                      ).includes("red")
                    ? "bg-red-50 dark:bg-red-900/20"
                    : "bg-gray-50 dark:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      Transaction Amount
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTransaction.type === "refund"
                        ? "Refund to customer"
                        : "Expense"}
                    </p>
                  </div>
                  <div
                    className={`text-2xl font-bold ${getAmountColor(
                      selectedTransaction.type,
                      selectedTransaction.amount
                    )}`}
                  >
                    ¢{Math.abs(selectedTransaction.amount).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Payment Method
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedTransaction.paymentMethod
                      .replace("_", " ")
                      .toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Transaction Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() +
                      selectedTransaction.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-800 dark:text-white whitespace-pre-line">
                    {selectedTransaction.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OthersTable;
