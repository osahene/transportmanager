"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCar,
  FaCalendarCheck,
  FaUsers,
  FaUserTie,
  FaTools,
} from "react-icons/fa";
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
import { useAppDispatch, useAppSelector } from "../lib/store";
import { selectDashboardMetrics } from "../lib/slices/selectors";
import { fetchCars } from "../lib/slices/carsSlice";
import { fetchCustomers } from "../lib/slices/customersSlice";
import { fetchStaff } from "../lib/slices/staffSlice";
import { fetchBookings } from "../lib/slices/bookingsSlice";

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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const metrics = useAppSelector(selectDashboardMetrics);
  const carsLoading = useAppSelector((state) => state.car.loading);
  const customersLoading = useAppSelector((state) => state.customers.loading);
  const staffLoading = useAppSelector((state) => state.staff.loading);
  const bookingsLoading = useAppSelector((state) => state.bookings.loading);

  const isLoading = carsLoading || customersLoading || staffLoading || bookingsLoading;
  const params: any = {
    page: 1,
    page_size: 30
  };
  // Fetch data if not already loaded
  useEffect(() => {
    if (metrics.totalCars === 0) dispatch(fetchCars());
    if (metrics.totalCustomers === 0) dispatch(fetchCustomers());
    if (metrics.totalDrivers === 0) dispatch(fetchStaff());
    if (metrics.currentMonthBookings === 0) dispatch(fetchBookings(params));
  }, [dispatch]);

  const handleBookingNewVehicle = () => {
    router.push("/dashboard/bookings/create");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Bookings",
        data: metrics.monthlyBookings,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Revenue (¢)",
        data: metrics.monthlyRevenue,
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
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
        ticks: { color: "#6b7280", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          callback: function (value: number | string) {
            if (typeof value === "number") {
              return value >= 1000 ? `¢${value / 1000}k` : `¢${value}`;
            }
            return value;
          },
        },
      },
    },
  };

  const statCards = [
    {
      title: "Total Cars",
      value: metrics.totalCars,
      icon: <FaCar className="text-blue-600 dark:text-blue-400" size={24} />,
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      change: `${metrics.carStatusCounts.available} available`,
    },
    {
      title: "Bookings (This Month)",
      value: metrics.currentMonthBookings,
      icon: <FaCalendarCheck className="text-green-600 dark:text-green-400" size={24} />,
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      change: `Last month: ${metrics.previousMonthBookings}`,
    },
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      icon: <FaUsers className="text-emerald-600 dark:text-emerald-400" size={24} />,
      color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
      change: "Registered customers",
    },
    {
      title: "Total Drivers",
      value: metrics.totalDrivers,
      icon: <FaUserTie className="text-red-600 dark:text-red-400" size={24} />,
      color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      change: "Active drivers",
    },
  ];

  const fleetStatusItems = [
    { status: "Available", count: metrics.carStatusCounts.available, color: "bg-green-500" },
    { status: "Rented", count: metrics.carStatusCounts.rented, color: "bg-blue-500" },
    { status: "Maintenance", count: metrics.carStatusCounts.maintenance, color: "bg-yellow-500" },
    { status: "Insurance Expired", count: metrics.carStatusCounts.insurance_expired, color: "bg-orange-500" },
    { status: "Accident", count: metrics.carStatusCounts.accident, color: "bg-red-500" },
    { status: "Retired", count: metrics.carStatusCounts.retired, color: "bg-gray-500" },
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
            Yearly Performance ({new Date().getFullYear()})
          </h2>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Fleet Status */}
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
              const percentage = metrics.totalCars > 0 ? (item.count / metrics.totalCars) * 100 : 0;
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
                      style={{ width: `${percentage}%` }}
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
              onClick={handleBookingNewVehicle}
            >
              New Booking
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}