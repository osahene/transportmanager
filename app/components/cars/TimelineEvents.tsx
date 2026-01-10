// /components/cars/TimelineEvents.tsx
import { FinancialTransaction } from "../../types/finance";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaWrench,
  FaShieldAlt,
  FaReceipt,
  FaTag,
} from "react-icons/fa";

interface TimelineEventProps {
  transaction: FinancialTransaction;
  isLast: boolean;
}

const TimelineEventItem: React.FC<TimelineEventProps> = ({
  transaction,
  isLast,
}) => {
  const getEventIcon = (type: FinancialTransaction["type"]) => {
    switch (type) {
      case "revenue":
        return <FaMoneyBillWave className="w-4 h-4 text-green-500" />;
      case "maintenance":
        return <FaWrench className="w-4 h-4 text-yellow-500" />;
      case "insurance":
        return <FaShieldAlt className="w-4 h-4 text-blue-500" />;
      // case "accident":
      //   return <FaCarCrash className="w-4 h-4 text-red-500" />;
      case "refund":
        return <FaReceipt className="w-4 h-4 text-purple-500" />;
      case "expense":
        return <FaMoneyBillWave className="w-4 h-4 text-orange-500" />;
      default:
        return <FaTag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: FinancialTransaction["type"]) => {
    switch (type) {
      case "revenue":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "insurance":
        return "bg-blue-500";
      // case "accident":
      //   return "bg-red-500";
      case "refund":
        return "bg-purple-500";
      case "expense":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTransactionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getAmountPrefix = (type: FinancialTransaction["type"]) => {
    switch (type) {
      case "revenue":
        return "+";
      case "refund":
        return "-";
      case "expense":
      case "maintenance":
      case "insurance":
        return "-";
      default:
        return "";
    }
  };

  const getAmountColor = (
    type: FinancialTransaction["type"],
    amount: number
  ) => {
    if (type === "revenue") return "text-green-600 dark:text-green-400";
    if (["refund", "expense", "maintenance", "insurance"].includes(type)) {
      return "text-red-600 dark:text-red-400";
    }
    return amount >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${getEventColor(transaction.type)}`}
        />
        {!isLast && (
          <div className="w-px h-full bg-gray-300 dark:bg-gray-600 mt-1" />
        )}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getEventIcon(transaction.type)}
            <h4 className="font-medium text-gray-800 dark:text-white">
              {formatTransactionType(transaction.type)}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formatDate(transaction.date)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          {transaction.description}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              Ref: {transaction.reference}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              {transaction.paymentMethod.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div
            className={`text-sm font-medium ${getAmountColor(
              transaction.type,
              transaction.amount
            )}`}
          >
            {getAmountPrefix(transaction.type)}$
            {Math.abs(transaction.amount).toLocaleString()}
          </div>
        </div>

        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              transaction.status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : transaction.status === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimelineEventItem;
