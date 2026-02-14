"use client";

import { useState, useEffect } from "react";
import {
  FaUserTie,
  FaMoneyBillWave,
  FaFileInvoice,
  FaCalendarAlt,
  FaCheckCircle,
  FaEye,
  FaPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "../../lib/store";
import { selectStaff, selectDrivers } from "../../lib/slices/selectors";
import { fetchStaff } from "../../lib/slices/staffSlice";
import { format } from "date-fns";
import StaffDetailsModal from "@/app/components/staff/StaffDetailsModal";
import SalaryPaymentModal from "@/app/components/staff/SalaryPaymentModal";
import AddStaffModal from "@/app/components/staff/AddStaffModal";

export default function StaffPage() {
  const dispatch = useAppDispatch();
  const staff = useAppSelector(selectStaff);
  const drivers = useAppSelector(selectDrivers);
  const loading = useAppSelector((state) => state.staff.loading);
  const error = useAppSelector((state) => state.staff.error);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<any>(null);
  const [paymentStaff, setPaymentStaff] = useState<any>(null);

  useEffect(() => {
    if (staff.length === 0) {
      dispatch(fetchStaff());
    }
  }, [dispatch, staff.length]);

  const monthlyPayroll = staff.reduce((sum, s) => sum + s.salary, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading staff data...</div>
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staff & Payroll
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage staff payments and generate payslips
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
          >
            <FaPlus />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staff.length}</p>
            </div>
            <FaUserTie className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Payroll</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">¢{monthlyPayroll.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Drivers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{drivers.length}</p>
            </div>
            <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.filter((s) => s.status === "active").length}
              </p>
            </div>
            <FaCalendarAlt className="text-yellow-600 dark:text-yellow-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Employment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((staffMember) => (
                  <motion.tr
                    key={staffMember.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FaUserTie className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {staffMember.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {staffMember.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mb-1">
                          {staffMember.role}
                        </span>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {staffMember.department}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ¢{staffMember.salary.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {staffMember.employmentType.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {staffMember.employmentType.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Shift: {staffMember.shift}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${staffMember.status === "active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          }`}
                      >
                        {staffMember.status.toUpperCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStaffDetails(staffMember)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => setPaymentStaff(staffMember)}
                          className="px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition text-sm flex items-center gap-1"
                        >
                          <FaMoneyBillWave />
                          Pay
                        </button>
                        <button
                          onClick={() => {
                            // Optionally open payslip for last payment
                            alert("Payslip feature will show last payment details");
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm flex items-center gap-1 text-gray-700 dark:text-gray-300"
                        >
                          <FaFileInvoice />
                          Payslip
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drivers Section */}
      {drivers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Drivers
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Drivers available for assignment to customer bookings
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FaUserTie className="text-blue-600 dark:text-blue-400 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {driver.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {driver.phone}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                          {driver.shift}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          {driver.employmentType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStaffDetails(driver)}
                    className="mt-3 w-full px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStaffDetails && (
        <StaffDetailsModal
          staff={selectedStaffDetails}
          onClose={() => setSelectedStaffDetails(null)}
        />
      )}
      {paymentStaff && (
        <SalaryPaymentModal
          staff={paymentStaff}
          onClose={() => setPaymentStaff(null)}
          onSuccess={() => {
            // Optionally refresh staff list or show success
            setPaymentStaff(null);
          }}
        />
      )}
      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // Optionally refetch staff list
            dispatch(fetchStaff());
          }}
        />
      )}
    </div>
  );
}