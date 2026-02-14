"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  FaCar,
  FaGasPump,
  FaWrench,
  FaShieldAlt,
  FaExclamationTriangle,
  // FaPlus,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { fetchCars } from "../../lib/slices/carsSlice";
import {
  selectCarsStats,
  selectFilteredCars,
} from "../../lib/slices/selectors";
import { AppDispatch, useAppSelector } from "../../lib/store";
import { Car } from "@/app/types/cars";

export default function CarsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  // Select cars from state
  const stats = useAppSelector(selectCarsStats);

  // Get filtered cars using selector
  const filteredCars = useAppSelector((state) =>
    selectFilteredCars(state, searchTerm, statusFilter)
  );

  const handleCarClick = useCallback(
    (carId: string) => {
      router.push(`/dashboard/cars/${carId}`);
    },
    [router]
  );

  // const handleAddCar = useCallback(() => {
  //   router.push("/dashboard/cars/new");
  // }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "rented":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "maintenance":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "retired":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "maintenance":
        return <FaWrench className="w-4 h-4 mr-1" />;
      case "retired":
        return <FaExclamationTriangle className="w-4 h-4 mr-1" />;
      case "rented":
        return <FaCalendarAlt className="w-4 h-4 mr-1" />;
      case "available":
        return <FaShieldAlt className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  // Get next available date from backend stats
  const getNextAvailableDate = (car: Car) => {
    if (car.status !== "rented" && car.status !== "maintenance") {
      return "Available now";
    }

    // Use precomputed date from backend
    if (car.stats?.nextAvailableDate) {
      return new Date(car.stats.nextAvailableDate).toLocaleDateString();
    }

    return car.status === "rented" ? "On rental" : "In maintenance";
  };

  // Get revenue info from backend stats
  // const getRevenueInfo = (car: Car) => {
  //   if (!car.stats?.totalRevenue) return "No revenue yet";
  //   return `$${car.stats.totalRevenue.toLocaleString()} total`;
  // };
  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Fleet Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your vehicle fleet, track status, and process bookings
          </p>
        </div>
        {/* <button
          onClick={handleAddCar}
          className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add New Vehicle
        </button> */}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.available}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaShieldAlt className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rented</p>
              <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maintenance
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.maintenance}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FaWrench className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Vehicles
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total}
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaCar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by make, model, or plate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "available", "rented", "maintenance", "retired"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${statusFilter === status
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {status === "all"
                    ? "All Vehicles"
                    : status === "retired"
                      ? "Unavailable"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCars.map((car, index) => (
          <motion.div
            key={car.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleCarClick(car.id)}
          >
            {/* Car Image Placeholder */}
            <div
              className="h-48 relative flex items-center justify-center"
              style={{
                background:
                  car.status === "available"
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : car.status === "rented"
                      ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                      : car.status === "maintenance"
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              }}
            >
              <FaCar className="text-white text-6xl opacity-90 group-hover:scale-110 transition-transform" />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusColor(
                    car.status
                  )}`}
                >
                  {getStatusIcon(car.status)}
                  {car.status === "retired"
                    ? "UNAVAILABLE"
                    : car.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Car Info */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>Year: {car.year}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: `${car.color}` }}
                      title={`Color: ${car.color}`}
                    />
                  </div>
                </div>
                {/* <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    ¢{car.dailyRate}
                    <span className="text-sm font-normal text-gray-500">
                      /day
                    </span>
                  </p>
                </div> */}
              </div>

              {/* Details */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <FaGasPump className="w-4 h-4" />
                  <span>Fuel: {car.fuel_type || "N/A"}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <span>Plate: {car.license_plate || "N/A"}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <span>Available: {getNextAvailableDate(car)}</span>
                </div>
              </div>

              {/* Stats from backend */}
              {car.stats && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Bookings
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {car.stats.totalBookings || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Revenue
                      </p>
                      <p className="font-bold text-green-600">
                        {car.stats.totalRevenue
                          ? `¢${car.stats.totalRevenue.toLocaleString()}`
                          : "¢0"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status-specific information */}
              {car.status === "maintenance" &&
                car.stats?.maintenanceDueDate && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      Maintenance until:{" "}
                      {new Date(
                        car.stats.maintenanceDueDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

              {car.status === "rented" && car.stats?.lastBookingDate && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Rented until:{" "}
                    {new Date(
                      car.stats.nextAvailableDate || car.stats.lastBookingDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4">
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <FaCar className="text-gray-400 dark:text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== "all"
              ? "No vehicles match your search"
              : "No vehicles in fleet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Contact the CEO"}
          </p>
          {/* <button
            onClick={handleAddCar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Vehicle
          </button> */}
        </div>
      )}

      {/* Footer Stats */}
      {filteredCars.length > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          Showing {filteredCars.length} of {stats.total} vehicles
        </div>
      )}
    </div>
  );
}
