"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../lib/store";
import { fetchSalaryHistory, fetchDriverBookings } from "../../lib/slices/staffSlice";
import { format } from "date-fns";
import { Staff } from "@/app/types/staff";

interface Props {
  staff: Staff;
  onClose: () => void;
}

export default function StaffDetailsModal({ staff, onClose }: Props) {
  const dispatch = useAppDispatch();
  const salaryHistoryMap = useAppSelector(state => state.staff.salaryHistory);
  const driverBookingsMap = useAppSelector(state => state.staff.driverBookings);
  const salaryHistory = salaryHistoryMap[staff.id] || [];
  const driverBookings = driverBookingsMap[staff.id] || [];
  const [activeTab, setActiveTab] = useState<"details" | "payments" | "bookings">("details");

  useEffect(() => {
    dispatch(fetchSalaryHistory(staff.id));

  }, [dispatch, staff.id, staff.role]);
  console.log("Driver bookings:", driverBookings);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${activeTab === "details" ? "border-b-2 border-blue-500 text-blue-600" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "payments" ? "border-b-2 border-blue-500 text-blue-600" : ""}`}
              onClick={() => setActiveTab("payments")}
            >
              Payment History
            </button>
            {staff.role.toLowerCase() === "driver" && (
              <button
                className={`px-4 py-2 ${activeTab === "bookings" ? "border-b-2 border-blue-500 text-blue-600" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                Bookings
              </button>
            )}
          </div>

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{staff.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Employee ID</label>
                <p className="font-medium">{staff.employeeId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <p className="font-medium">{staff.role}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <p className="font-medium">{staff.department}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{staff.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{staff.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Salary</label>
                <p className="font-medium">¢{staff.salary.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Bank Details</label>
                <p className="font-medium">{staff.bankName} - {staff.accountNumber}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Employment Type</label>
                <p className="font-medium">{staff.employmentType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Shift</label>
                <p className="font-medium">{staff.shift}</p>
              </div>
              {staff.driverLicenseId && (
                <div>
                  <label className="text-sm text-gray-500">Driver License</label>
                  <p className="font-medium">{staff.driverLicenseId} ({staff.driverLicenseClass})</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Month</th>
                    <th className="px-4 py-2 text-left">Basic</th>
                    <th className="px-4 py-2 text-left">Overtime</th>
                    <th className="px-4 py-2 text-left">Bonuses</th>
                    <th className="px-4 py-2 text-left">Deductions</th>
                    <th className="px-4 py-2 text-left">Net</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4">No payments recorded</td></tr>
                  ) : (
                    salaryHistory.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">{format(new Date(p.month), "MMM yyyy")}</td>
                        <td className="px-4 py-2">¢{p.basicSalary}</td>
                        <td className="px-4 py-2">¢{p.overtime}</td>
                        <td className="px-4 py-2">¢{p.bonuses}</td>
                        <td className="px-4 py-2">¢{p.deductions}</td>
                        <td className="px-4 py-2 font-bold">¢{p.netSalary}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${p.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {p.isPaid ? "Paid" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">Car</th>
                    <th className="px-4 py-2 text-left">Dates</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {driverBookings.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4">No bookings found</td></tr>
                  ) : (
                    driverBookings.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="px-4 py-2">{b.id.slice(0, 8)}...</td>
                        <td className="px-4 py-2">{b.carDetails?.make || "Unknown"} {b.carDetails?.model || "Unknown"}</td>
                        <td className="px-4 py-2">{format(new Date(b.startDate), "dd/MM/yy")} - {format(new Date(b.endDate), "dd/MM/yy")}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${b.status === "completed" ? "bg-green-100" : b.status === "active" ? "bg-blue-100" : "bg-amber-600"}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}