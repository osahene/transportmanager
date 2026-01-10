"use client";

import { useState, useEffect, useRef } from "react";
import { FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { Customer } from "../../types/customer";

interface CustomerSelectionSectionProps {
  customerMode: "existing" | "new";
  setCustomerMode: (mode: "existing" | "new") => void;
  customerSearch: string;
  setCustomerSearch: (search: string) => void;
  filteredCustomers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  newCustomer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ghanaCardId: string;
    occupation: string;
    gpsAddress: string;
    address: {
      locality: string;
      town: string;
      city: string;
      region: string;
      country: string;
    };
    joinDate: string;
    status: "active";
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
    preferredVehicleType: string;
    notes: string;
    tags: string[];
    communicationPreferences: {
      email: boolean;
      sms: boolean;
      phone: boolean;
    };
    guarantor: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      ghanaCardId: string;
      occupation: string;
      gpsAddress: string;
      relationship: string;
      address: {
        locality: string;
        town: string;
        city: string;
        region: string;
        country: string;
      };
    };
    loyaltyTier: "bronze" | "silver" | "gold";
  };
  onNewCustomerChange: (name: string, value: string) => void;
  onCommunicationPrefChange: (
    field: keyof {
      email: boolean;
      sms: boolean;
      phone: boolean;
    },
    value: boolean
  ) => void;
  customers: Customer[];
}

export default function CustomerSelectionSection({
  customerMode,
  setCustomerMode,
  customerSearch,
  setCustomerSearch,
  filteredCustomers,
  selectedCustomer,
  onCustomerSelect,
  newCustomer,
  onNewCustomerChange,
  onCommunicationPrefChange,
}: CustomerSelectionSectionProps) {
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setCustomerSearch(value);
    setShowCustomerDropdown(
      value.trim() !== "" && filteredCustomers.length > 0
    );
    if (value.trim() === "") {
      setShowCustomerDropdown(false);
    }
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelect(customer);
    setShowCustomerDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FaUser />
          Customer Information *
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setCustomerMode("existing");
              setShowCustomerDropdown(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              customerMode === "existing"
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Existing Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerMode("new");
              setShowCustomerDropdown(false);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              customerMode === "new"
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            New Customer
          </button>
        </div>
      </div>

      {customerMode === "existing" ? (
        <div className="space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Existing Customer *
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type customer name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                required
              />
            </div>

            {showCustomerDropdown && filteredCustomers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectCustomer(customer)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {customer.firstName}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {customer.phone}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {customer.totalBookings} previous bookings •{" "}
                      {customer.loyaltyTier}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <h3 className="font-medium text-2xl text-gray-900 dark:text-white mb-2">
                Selected Customer:
              </h3>
              <div>
                <h3 className="font-medium text-2xl text-gray-900 text-center dark:text-white">
                  Cutomer Details
                </h3>
              </div>
              <div className="grid grid-row-2 md:grid-rows-2 gap-4">
                {/* Personal details 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b-4 border-gray-300 pb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone Number
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaPhone className="text-sm" />
                      {selectedCustomer.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      E-mail Address
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaEnvelope className="text-sm" />
                      {selectedCustomer.email}
                    </p>
                  </div>
                  {/* Personal details 2 */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ghana card ID / Passport Number
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.ghanaCardId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Driver Licence
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaPhone className="text-sm" />
                      {selectedCustomer.driverLicenseId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Occupation
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaEnvelope className="text-sm" />
                      {selectedCustomer.occupation}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      GPS Address
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.gpsAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Locality
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.address.locality}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Town
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaPhone className="text-sm" />
                      {selectedCustomer.address.town}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      City
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaPhone className="text-sm" />
                      {selectedCustomer.address.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Region
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaEnvelope className="text-sm" />
                      {selectedCustomer.address.region}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Country
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <FaEnvelope className="text-sm" />
                      {selectedCustomer.address.country}
                    </p>
                  </div>
                </div>
                {/* Guarantor details */}
                <div>
                  <h3 className="font-medium text-2xl text-gray-900 text-center dark:text-white mt-3 mb-2">
                    Guarantor Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        First Name of Guarantor
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.guarantor.firstName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last Name of Guarantor
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.guarantor.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        {selectedCustomer.guarantor.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        E-mail Address
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        {selectedCustomer.guarantor.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ghana Card ID / Passport Number
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.guarantor.ghanaCardId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Occupation
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        {selectedCustomer.guarantor.occupation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Relation to Customer
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        {selectedCustomer.guarantor.relationship}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        GPS Address
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.guarantor.gpsAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Locality
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.guarantor.address.locality}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Town
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        {selectedCustomer.guarantor.address.town}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        City
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaPhone className="text-sm" />
                        {selectedCustomer.guarantor.address.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Region
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        {selectedCustomer.guarantor.address.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Country
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        {selectedCustomer.guarantor.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="mb-4 p-0">
            <h3 className="font-medium text-2xl text-gray-900 text-center dark:text-white">
              Cutomer Details
            </h3>
          </div>
          <div className="grid grid-row-2 md:grid-rows-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    onNewCustomerChange("first_name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    onNewCustomerChange("last_name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email}
                  onChange={(e) => onNewCustomerChange("email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={(e) => onNewCustomerChange("phone", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghana card ID / Passport Number
                </label>
                <input
                  type="text"
                  name="ghanaCardId"
                  value={newCustomer.ghanaCardId}
                  onChange={(e) =>
                    onNewCustomerChange("ghanaCardId", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={newCustomer.occupation}
                  onChange={(e) =>
                    onNewCustomerChange("occupation", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPS Address
                </label>
                <input
                  type="text"
                  name="gpsAddress"
                  value={newCustomer.gpsAddress}
                  onChange={(e) =>
                    onNewCustomerChange("gpsAddress", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Locality
                </label>
                <input
                  type="text"
                  name="locality"
                  value={newCustomer.address.locality}
                  onChange={(e) =>
                    onNewCustomerChange("locality", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Town
                </label>
                <input
                  type="text"
                  name="town"
                  value={newCustomer.address.town}
                  onChange={(e) => onNewCustomerChange("town", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={newCustomer.address.city}
                  onChange={(e) => onNewCustomerChange("city", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={newCustomer.address.region}
                  onChange={(e) =>
                    onNewCustomerChange("region", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={newCustomer.address.country}
                  onChange={(e) =>
                    onNewCustomerChange("country", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="m-4 p-0">
              <h3 className="font-medium text-2xl text-gray-900 text-center dark:text-white">
                Guarantor Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="guarantor_first_name"
                  value={newCustomer.guarantor.firstName}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_first_name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="guarantor_last_name"
                  value={newCustomer.guarantor.lastName}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_last_name", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="guarantor_email"
                  value={newCustomer.guarantor.email}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_email", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="guarantor_phone"
                  value={newCustomer.guarantor.phone}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_phone", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghana card ID / Passport Number
                </label>
                <input
                  type="text"
                  name="guarantor_ghanaCardId"
                  value={newCustomer.guarantor.ghanaCardId}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_ghanaCardId", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  name="guarantor_occupation"
                  value={newCustomer.guarantor.occupation}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_occupation", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPS Address
                </label>
                <input
                  type="text"
                  name="guarantor_gpsAddress"
                  value={newCustomer.guarantor.gpsAddress}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_gpsAddress", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship to Customer
                </label>
                <input
                  type="text"
                  name="guarantor_relationship"
                  value={newCustomer.guarantor.relationship}
                  onChange={(e) =>
                    onNewCustomerChange(
                      "guarantor_relationship",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Locality
                </label>
                <input
                  type="text"
                  name="guarantor_locality"
                  value={newCustomer.guarantor.address.locality}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_locality", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Town
                </label>
                <input
                  type="text"
                  name="guarantor_town"
                  value={newCustomer.guarantor.address.town}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_town", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="guarantor_city"
                  value={newCustomer.guarantor.address.city}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_city", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="guarantor_region"
                  value={newCustomer.guarantor.address.region}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_region", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="guarantor_country"
                  value={newCustomer.guarantor.address.country}
                  onChange={(e) =>
                    onNewCustomerChange("guarantor_country", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={newCustomer.notes}
              onChange={(e) => onNewCustomerChange("notes", e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Any additional notes about this customer..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={newCustomer.communicationPreferences.email}
                onChange={(e) =>
                  onCommunicationPrefChange("email", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="sendEmail"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Send email confirmation
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendSMS"
                checked={newCustomer.communicationPreferences.sms}
                onChange={(e) =>
                  onCommunicationPrefChange("sms", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="sendSMS"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Send SMS confirmation
              </label>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
