"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaCar, FaCalendarCheck, FaTools } from "react-icons/fa";
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
} from "chart.js";
import { motion } from "framer-motion";
import { useAppSelector } from "../lib/store";
import { selectDashboardStats } from "../lib/slices/selectors";
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

export default function DashboardPage() {
  // Fixed: Using memoized selector for stats
  const stats = useAppSelector(selectDashboardStats);
  const { loading: isLoading, error } = useAppSelector((state) => state.car);
  const router = useRouter();

  const handleBookingNewVehicle = () => {
    router.push("/dashboard/bookings/create");
  };

  // Fixed: Added error and loading states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Bookings",
        data: [12, 19, 8, 15, 12, 18, 14],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Revenue ($)",
        data: [1200, 1900, 800, 1500, 1200, 1800, 1400],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
            }
            return value;
          },
        },
      },
    },
  };

  // Fixed: Added safe division for percentage calculation
  const availablePercentage =
    stats.totalCars > 0
      ? ((stats.availableCars / stats.totalCars) * 100).toFixed(0)
      : "0";

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats.totalCars,
      icon: <FaCar className="text-blue-600 dark:text-blue-400" size={24} />,
      color:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      change: "+2 this week",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: (
        <FaCalendarCheck
          className="text-green-600 dark:text-green-400"
          size={24}
        />
      ),
      color:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      change: "+5 today",
    },
    {
      title: "Available Cars",
      value: stats.availableCars,
      icon: (
        <FaCar className="text-emerald-600 dark:text-emerald-400" size={24} />
      ),
      color:
        "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
      change: `${availablePercentage}% available`,
    },
    // {
    //   title: "Pending Approval",
    //   value: stats.pendingBookings,
    //   icon: (
    //     <FaUsers className="text-yellow-600 dark:text-yellow-400" size={24} />
    //   ),
    //   color:
    //     "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    //   change: "Needs attention",
    // },
    // {
    //   title: "Monthly Revenue",
    //   value: `$${stats.totalRevenue.toLocaleString()}`,
    //   icon: (
    //     <FaMoneyBillWave
    //       className="text-purple-600 dark:text-purple-400"
    //       size={24}
    //     />
    //   ),
    //   color:
    //     "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    //   change: "+12% from last month",
    // },
    {
      title: "Maintenance Due",
      value: stats.maintenanceDue,
      icon: <FaTools className="text-red-600 dark:text-red-400" size={24} />,
      color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      change: "Schedule required",
    },
  ];

  // Fixed: Prevent division by zero in progress bars
  const fleetStatusItems = [
    {
      status: "Available",
      count: stats.availableCars,
      color: "bg-green-500",
    },
    {
      status: "Booked",
      count: stats.activeBookings,
      color: "bg-blue-500",
    },
    {
      status: "Maintenance",
      count: stats.maintenanceDue,
      color: "bg-yellow-500",
    },
    {
      status: "Out of Service",
      count: Math.max(
        0,
        stats.totalCars -
          stats.availableCars -
          stats.maintenanceDue -
          stats.activeBookings
      ),
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Transport Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your transport
          operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.color} border rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-gray-800">
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings & Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Performance
          </h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Vehicle Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fleet Status
          </h2>
          <div className="space-y-4">
            {fleetStatusItems.map((item) => {
              // Fixed: Safe calculation for progress bar width
              const percentage =
                stats.totalCars > 0 ? (item.count / stats.totalCars) * 100 : 0;

              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.status}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.count} vehicle{item.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <p className="text-blue-100 dark:text-blue-200 mt-2">
              Manage your transport operations efficiently
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              className="px-6 py-3 bg-white text-blue-600 dark:text-blue-700 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-100 transition"
              onClick={() => handleBookingNewVehicle()}
            >
              New Booking
            </button>
            <button
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 dark:hover:text-blue-700 transition"
              onClick={() =>
                alert("Schedule maintenance functionality to be implemented")
              }
            >
              Schedule Maintenance
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
