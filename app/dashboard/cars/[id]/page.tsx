"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCar } from "@/app/lib/hooks/useCars";
import { useBookings } from "@/app/lib/hooks/useBookings";
import { useMaintenanceRecords } from "@/app/lib/hooks/useMaintenance";
import { useInsurancePolicies } from "@/app/lib/hooks/useInsurance";
import BookingsTable from "../../../components/cars/BookingsTable";
import MaintenanceTable from "../../../components/cars/MaintenanceTable";
import InsuranceTable from "../../../components/cars/InsuranceTable";
import StatusBadge from "../../../components/cars/StatusBadge";
import TabButton from "../../../components/cars/TabButton";

import {
  FaArrowLeft,
  FaPlus,
  FaCar,
  FaWrench,
  FaCalendarAlt,
  FaGasPump,
  FaCogs,
} from "react-icons/fa";

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;

  // Fetch data using React Query
  const { data: car, isLoading: carLoading, error: carError } = useCar(carId);
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings({ carId }); // Assuming API supports filtering by carId
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useMaintenanceRecords(carId);
  const { data: insurancePolicies = [], isLoading: insuranceLoading } = useInsurancePolicies({ vehicleId: carId });

  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleBack = () => {
    router.back();
  };

  const handleAddMaintenanceRecord = () => {
    router.push(`/dashboard/cars/${carId}/addevent?type=maintenance`);
  };

  const handleEditMaintenanceRecord = (record: any) => {
    // This would navigate to edit page or open modal
    console.log("Edit record:", record);
  };

  const handleDeleteMaintenanceRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      // This would be handled by a mutation
      console.log("Delete record:", id);
    }
  };

  const isLoading = carLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Loading vehicle details...
          </h3>
        </div>
      </div>
    );
  }

  if (carError || !car) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaCar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Vehicle not found
          </h3>
          <button
            onClick={() => router.push("/dashboard/cars")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go back to vehicles list
          </button>
        </div>
      </div>
    );
  }

  // Filter bookings for this car (if API didn't already)
  const carBookings = bookings.filter((b) => b.CarId === carId);

  // Calculate stats
  const totalBookings = carBookings.length;
  const completedBookings = carBookings.filter((b) => b.status === "completed").length;
  const utilizationRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const totalRevenue = carBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const maintenanceCosts = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Get last booking date
  const lastBooking = carBookings.length > 0
    ? carBookings.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {car.make} {car.model} ({car.year})
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1">
              <p className="text-gray-600 dark:text-gray-400">
                Vehicle ID: {car.id}
              </p>
              <StatusBadge status={car.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/dashboard/cars/${car.id}/addevent`)}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Update Vehicle Record
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalBookings}
              </p>
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
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ¢{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maintenance Costs
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                ¢{maintenanceCosts.toLocaleString()}
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
                Utilization Rate
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {utilizationRate}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaCogs className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {["overview", "bookings", "maintenance", "insurance"].map((tab) => (
            <TabButton
              key={tab}
              tab={tab}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bookings Table */}
          {activeTab === "bookings" && (
            <BookingsTable bookings={carBookings} vehicleId={car.id} />
          )}

          {/* Maintenance Table */}
          {activeTab === "maintenance" && (
            <MaintenanceTable
              records={maintenanceRecords}
              onAddRecord={handleAddMaintenanceRecord}
              onEditRecord={handleEditMaintenanceRecord}
              onDeleteRecord={handleDeleteMaintenanceRecord}
            />
          )}

          {/* Insurance Table */}
          {activeTab === "insurance" && (
            <InsuranceTable insurancePolicies={insurancePolicies} />
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Recent Bookings
                </h3>
                <BookingsTable
                  bookings={carBookings.slice(0, 5)}
                  vehicleId={car.id}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Recent Maintenance
                  </h3>
                  {maintenanceRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No recent maintenance
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {maintenanceRecords.slice(0, 3).map((record) => (
                        <li
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {record.type}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(record.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            ¢{record.cost.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Insurance Status
                  </h3>
                  {insurancePolicies.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No insurance policies
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {insurancePolicies.slice(0, 3).map((policy) => {
                        const isActive =
                          policy.status === "active" &&
                          new Date(policy.endDate) > new Date();
                        return (
                          <li
                            key={policy.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {policy.provider}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {isActive ? "Active" : "Expired"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Valid until:{" "}
                              {new Date(policy.endDate).toLocaleDateString()}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Vehicle Details */}
        <div className="space-y-6">
          {/* Vehicle Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Vehicle Status
              </h3>
              <StatusBadge status={car.status} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Utilization
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {utilizationRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Last Booking
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {lastBooking ? new Date(lastBooking.endDate).toLocaleDateString() : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Vehicle Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FaCar className="w-4 h-4" /> Color
                </span>
                <div
                  className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: car.color }}
                  title={`Color: ${car.color}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  License Plate
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {car.license_plate || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">VIN</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {car.vin || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FaGasPump className="w-4 h-4" /> Fuel Type
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {car.fuel_type || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transmission
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {car.transmission || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Seating Capacity
                </span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {car.seats || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Vehicle Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {car.features && car.features.length > 0 ? (
                car.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-500">No features listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}