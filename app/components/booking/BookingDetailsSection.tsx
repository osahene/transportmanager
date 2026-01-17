"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaRegAddressCard } from "react-icons/fa";
import { motion } from "framer-motion";
import { Driver } from "../../types/booking";

interface BookingDetailsSectionProps {
  startDate: string;
  endDate: string;
  selfDrive: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverId: string;
  specialRequests: string;
  drivers: Driver[];
  onFieldChange: (field: string, value: string) => void;
  getMinDate: () => string;
  getMaxDate: () => string;
  driverLicenseId?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseExpiryDate?: string;
}

export default function BookingDetailsSection({
  startDate,
  endDate,
  selfDrive,
  pickupLocation,
  dropoffLocation,
  driverId,
  specialRequests,
  drivers,
  onFieldChange,
  getMinDate,
  getMaxDate,
  driverLicenseId = "",
  driverLicenseClass = "",
  driverLicenseIssueDate = "",
  driverLicenseExpiryDate = "",
}: BookingDetailsSectionProps) {
  const [localSelfDrive, setLocalSelfDrive] = useState(selfDrive === "true");

  // Sync with parent prop changes
  useEffect(() => {
    setLocalSelfDrive(selfDrive === "true");
  }, [selfDrive]);

  const handleSelfDriveToggle = (checked: boolean) => {
    setLocalSelfDrive(checked);
    onFieldChange("selfDrive", checked ? "true" : "false");
    // Reset driver selection when toggling self-drive
    if (checked) {
      onFieldChange("driverId", "");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <FaCalendarAlt />
        Booking Details *
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pickup Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onFieldChange("startDate", e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Return Date *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onFieldChange("endDate", e.target.value)}
              min={startDate || getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pickup Location
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => onFieldChange("pickupLocation", e.target.value)}
              placeholder="e.g., Airport Terminal 3, Main Office"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop-off Location
            </label>
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => onFieldChange("dropoffLocation", e.target.value)}
              placeholder="e.g., Same as pickup location"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Self-drive toggle and driver selection section */}
      <div className="mt-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectSelfDrive"
              checked={localSelfDrive}
              onChange={(e) => handleSelfDriveToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="selectSelfDrive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Self-drive (I will drive myself)
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {localSelfDrive
              ? "You will need to provide your driver's license details"
              : "A driver will be assigned to you from our available drivers"}
          </p>
        </div>

        {/* Conditional rendering based on self-drive selection */}
        {localSelfDrive ? (
          <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <FaRegAddressCard />
              Driver{"'"}s License Details *
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  value={driverLicenseId}
                  onChange={(e) =>
                    onFieldChange("driverLicenseId", e.target.value)
                  }
                  placeholder="Enter driver's license number"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={localSelfDrive}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class of License *
                </label>
                <input
                  type="text"
                  value={driverLicenseClass}
                  onChange={(e) =>
                    onFieldChange("driverLicenseClass", e.target.value)
                  }
                  placeholder="e.g., B, C, CE"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={localSelfDrive}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Issue *
                </label>
                <input
                  type="date"
                  value={driverLicenseIssueDate}
                  onChange={(e) =>
                    onFieldChange("driverLicenseIssueDate", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={localSelfDrive}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Expiry *
                </label>
                <input
                  type="date"
                  value={driverLicenseExpiryDate}
                  onChange={(e) =>
                    onFieldChange("driverLicenseExpiryDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={localSelfDrive}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Driver *
            </label>
            <select
              value={driverId}
              onChange={(e) => onFieldChange("driverId", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required={!localSelfDrive}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.phone}) - {driver.role}
                </option>
              ))}
            </select>
            {driverId && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Selected driver:{" "}
                  {drivers.find((d) => d.id === driverId)?.name} -{" "}
                  {drivers.find((d) => d.id === driverId)?.phone}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Special Requests
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => onFieldChange("specialRequests", e.target.value)}
          placeholder="Any special requirements or notes (e.g., child seat, GPS, etc.)"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        />
      </div>
    </motion.div>
  );
}
