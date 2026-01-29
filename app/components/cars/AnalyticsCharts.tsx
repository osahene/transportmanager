import { FinancialTransaction } from "../../types/finance";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartProps {
  transactions: FinancialTransaction[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ transactions }) => {
  // Process transactions to get monthly revenue data
  const processMonthlyRevenue = () => {
    const monthlyRevenue: { [key: string]: number } = {};
    const monthlyExpenses: { [key: string]: number } = {};

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (transaction.type === "revenue") {
        if (!monthlyRevenue[monthYear]) {
          monthlyRevenue[monthYear] = 0;
        }
        monthlyRevenue[monthYear] += transaction.amount;
      } else if (
        ["expense", "maintenance", "insurance"].includes(transaction.type)
      ) {
        if (!monthlyExpenses[monthYear]) {
          monthlyExpenses[monthYear] = 0;
        }
        monthlyExpenses[monthYear] += Math.abs(transaction.amount);
      }
    });

    // Sort by date
    const sortedMonths = Array.from(
      new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyExpenses)])
    ).sort();

    // Get last 6 months or all available if less than 6
    const last6Months = sortedMonths.slice(-6);

    const labels = last6Months.map((month) => {
      const [year, monthNum] = month.split("-");
      return new Date(
        parseInt(year),
        parseInt(monthNum) - 1
      ).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    });

    const revenueData = last6Months.map((month) => monthlyRevenue[month] || 0);
    const expenseData = last6Months.map((month) => monthlyExpenses[month] || 0);
    const netProfitData = last6Months.map(
      (month) => (monthlyRevenue[month] || 0) - (monthlyExpenses[month] || 0)
    );

    return { labels, revenueData, expenseData, netProfitData };
  };

  const { labels, revenueData, expenseData, netProfitData } =
    processMonthlyRevenue();

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "rgb(34, 197, 94)", // green
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Expenses",
        data: expenseData,
        borderColor: "rgb(239, 68, 68)", // red
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Net Profit",
        data: netProfitData,
        borderColor: "rgb(59, 130, 246)", // blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const value = context.parsed.y ?? 0;
            const label = context.dataset.label || "";
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category",
        border: { display: false },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
          callback: (value: string | number) => {
            if (typeof value === "number") {
              return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Calculate statistics
  const revenueTransactions = transactions.filter((t) => t.type === "revenue");
  const expenseTransactions = transactions.filter((t) =>
    ["expense", "maintenance", "insurance"].includes(t.type)
  );
  const refundTransactions = transactions.filter((t) => t.type === "refund");

  const totalRevenue = revenueTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const totalRefunds = refundTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  );
  const netProfit = totalRevenue - totalExpenses - totalRefunds;

  const avgRevenue =
    revenueTransactions.length > 0
      ? Math.round(totalRevenue / revenueTransactions.length)
      : 0;

  const avgExpense =
    expenseTransactions.length > 0
      ? Math.round(totalExpenses / expenseTransactions.length)
      : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Monthly revenue, expenses, and profit trends
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {labels.length === 0 ? "No data" : "Last 6 months"}
        </div>
      </div>

      <div className="h-64 mb-6">
        {labels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-gray-500 dark:text-gray-400">
                No financial data available
              </p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-bold text-green-600">
            ¢{totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {revenueTransactions.length} transactions
          </div>
        </div>

        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Expenses
          </div>
          <div className="text-2xl font-bold text-red-600">
            ¢{totalExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {expenseTransactions.length} transactions
          </div>
        </div>

        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Net Profit
          </div>
          <div
            className={`text-2xl font-bold ${
              netProfit >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            ¢{Math.abs(netProfit).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {netProfit >= 0 ? "Profit" : "Loss"}
          </div>
        </div>

        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Refunds
          </div>
          <div className="text-2xl font-bold text-purple-600">
            ¢{totalRefunds.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {refundTransactions.length} refunds
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Avg. Revenue per Transaction
            </span>
            <span className="font-bold text-green-600">
              ¢{avgRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Avg. Expense per Transaction
            </span>
            <span className="font-bold text-red-600">
              ¢{avgExpense.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Breakdown */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
          Transaction Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div className="text-lg font-bold text-green-600">
              {revenueTransactions.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Revenue
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div className="text-lg font-bold text-yellow-600">
              {transactions.filter((t) => t.type === "maintenance").length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Maintenance
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div className="text-lg font-bold text-blue-600">
              {transactions.filter((t) => t.type === "insurance").length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Insurance
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div className="text-lg font-bold text-purple-600">
              {refundTransactions.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Refunds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
