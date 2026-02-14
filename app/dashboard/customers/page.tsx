"use client";

import { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSms,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../../lib/store";
import { format } from "date-fns";
import {
  selectCustomers,
  selectFilteredCustomers,
} from "../../lib/slices/selectors";
import { fetchCustomers, fetchCustomerBookingsWithGuarantor } from "@/app/lib/slices/customersSlice";
import BookingsModal from "@/app/components/booking/BookingsModal";

export default function CustomersPage() {
  const dispatch = useAppDispatch()
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [smsMessage, setSmsMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCustomers = useAppSelector(selectFilteredCustomers);

  const customers = useAppSelector(selectCustomers);

  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<{ id: string; name: string } | null>(null);
  const customerBookings = useAppSelector((state) => state.customers.customerBookings);
  const modalBookings = selectedCustomerForModal ? customerBookings[selectedCustomerForModal.id] || [] : [];

   useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, customers.length]);


   const handleViewDetails = (customerId: string, customerName: string) => {
    setSelectedCustomerForModal({ id: customerId, name: customerName });
    // Fetch bookings if not already in store (optional)
    if (!customerBookings[customerId]) {
      dispatch(fetchCustomerBookingsWithGuarantor(customerId));
    }
  };

  const closeModal = () => {
    setSelectedCustomerForModal(null);
  };

  const toggleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Customer Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage customer relationships and send communications
        </p>
      </div>

      {/* Bulk SMS Section */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaSms className="text-blue-600 dark:text-blue-400 text-xl" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Send Bulk SMS
          </h2>
          <span className="ml-auto text-sm text-gray-600 dark:text-gray-300">
            Selected: {selectedCustomers.length} customers
          </span>
        </div>

        <div className="space-y-4">
          <textarea
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="Type your SMS message here... (Max 160 characters)"
            maxLength={160}
            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors"
          />
          <div className="flex gap-4">
            <button
              onClick={() =>
                alert("SMS functionality would be implemented here")
              }
              disabled={selectedCustomers.length === 0 || !smsMessage.trim()}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send SMS ({selectedCustomers.length})
            </button>
            <button
              onClick={selectAll}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {selectedCustomers.length === filteredCustomers.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FaFilter />
            Filter
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedCustomers.length === filteredCustomers.length &&
                      filteredCustomers.length > 0
                    }
                    onChange={selectAll}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-800"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => toggleSelectCustomer(customer.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-800"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FaUser className="text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {customer.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <FaEnvelope />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaPhone />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {customer.totalBookings} bookings
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(customer.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* <button
                        onClick={() =>
                          alert("SMS functionality would be implemented here")
                        }
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition text-sm flex items-center gap-2"
                      >
                        <FaSms />
                        SMS
                      </button> */}
                      <button
                        onClick={() => handleViewDetails(customer.id, `${customer.firstName} ${customer.lastName}`)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-gray-700 dark:text-gray-300"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <FaDownload />
          Export Customer List
        </button>
      </div>
      {selectedCustomerForModal && (
        <BookingsModal
            isOpen={!!selectedCustomerForModal}
            onClose={closeModal}
            bookings={modalBookings}
            customerName={selectedCustomerForModal.name}
        />
      )}
    </div>
  );
}
