"use client";

import { useState } from "react";
import {
  FaUserTie,
  FaMoneyBillWave,
  FaFileInvoice,
  FaCalendarAlt,
  FaPrint,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAppSelector } from "../../lib/store";
import { selectStaff, selectDrivers } from "../../lib/slices/selectors";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { Staff } from "@/app/lib/slices/staffSlice";

interface PayslipData {
  staffId: string;
  staffName: string;
  role: string;
  month: string;
  basicSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

// Payment calculation function
const calculatePayment = (staffSalary: number) => {
  const basicSalary = staffSalary;
  const overtime = Math.floor(Math.random() * 500) + 100; // Random between 100-600
  const bonuses = Math.floor(Math.random() * 300) + 50; // Random between 50-350
  const deductions = Math.floor(Math.random() * 200) + 30; // Random between 30-230

  return {
    basicSalary,
    overtime,
    bonuses,
    deductions,
    netSalary: basicSalary + overtime + bonuses - deductions,
  };
};

export default function StaffPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);

  // Fixed: Using correct selector for staff
  const staff = useAppSelector(selectStaff);
  const drivers = useAppSelector(selectDrivers);

  // Get loading and error from staff slice
  const isLoading = useAppSelector((state) => state.staff?.loading || false);
  const error = useAppSelector((state) => state.staff?.error);

  // Generate payslip for a staff member
  const generatePayslip = (staffMember: Staff) => {
    const payment = calculatePayment(staffMember.salary);

    const payslip: PayslipData = {
      staffId: staffMember.id,
      staffName: staffMember.name,
      role: staffMember.role,
      month: format(new Date(selectedMonth + "-01"), "MMMM yyyy"),
      basicSalary: payment.basicSalary,
      overtime: payment.overtime,
      bonuses: payment.bonuses,
      deductions: payment.deductions,
      netSalary: payment.netSalary,
      bankDetails: {
        accountName: staffMember.name,
        accountNumber: "XXXX-XXXX-" + staffMember.employeeId.slice(-4),
        bankName: "Standard Bank",
      },
    };

    setPayslipData(payslip);
  };

  const downloadPayslipPDF = () => {
    if (!payslipData) return;

    const pdf = new jsPDF();

    pdf.setFontSize(24);
    pdf.setTextColor(0, 102, 204);
    pdf.text("YOS Car Rentals", 20, 20);
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("PAYSLIP", 20, 30);

    pdf.setFontSize(10);
    let y = 50;

    const details = [
      [`Employee ID:`, payslipData.staffId],
      [`Name:`, payslipData.staffName],
      [`Role:`, payslipData.role],
      [`Payment Month:`, payslipData.month],
      [`Bank:`, payslipData.bankDetails.bankName],
      [`Account:`, payslipData.bankDetails.accountNumber],
    ];

    details.forEach(([label, value]) => {
      pdf.text(label, 20, y);
      pdf.text(value.toString(), 80, y);
      y += 10;
    });

    y += 10;
    pdf.setFontSize(12);
    pdf.text("Earnings & Deductions", 20, y);
    y += 10;

    const earnings = [
      ["Basic Salary", `¢${payslipData.basicSalary.toFixed(2)}`],
      ["Overtime", `¢${payslipData.overtime.toFixed(2)}`],
      ["Bonuses", `¢${payslipData.bonuses.toFixed(2)}`],
      ["Deductions", `¢-${payslipData.deductions.toFixed(2)}`],
    ];

    earnings.forEach(([label, amount]) => {
      pdf.text(label, 20, y);
      pdf.text(amount, 150, y, { align: "right" });
      y += 8;
    });

    y += 5;
    pdf.setDrawColor(0);
    pdf.line(20, y, 190, y);
    y += 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("NET SALARY:", 20, y);
    pdf.text(`¢${payslipData.netSalary.toFixed(2)}`, 150, y, {
      align: "right",
    });

    y += 20;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("This is a computer-generated payslip.", 20, y);
    pdf.text("Authorized by: Transport Manager", 20, y + 5);
    pdf.text(
      `Generated on: ${format(new Date(), "MMM d, yyyy h:mm a")}`,
      20,
      y + 10
    );

    pdf.save(`payslip-${payslipData.staffName}-${payslipData.month}.pdf`);
    setPayslipData(null);
  };

  if (isLoading) {
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
            className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
            onClick={() => alert("Add staff functionality to be implemented")}
          >
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Staff
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.length}
              </p>
            </div>
            <FaUserTie className="text-blue-600 dark:text-blue-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monthly Payroll
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ¢{staff.reduce((sum, s) => sum + s.salary, 0).toLocaleString()}
              </p>
            </div>
            <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drivers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {drivers.length}
              </p>
            </div>
            <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Active Staff
              </p>
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
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((staffMember) => {
                  const payment = calculatePayment(staffMember.salary);
                  return (
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
                          {staffMember.employmentType
                            .replace("_", " ")
                            .toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Shift: {staffMember.shift}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            staffMember.status === "active"
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
                            onClick={() => generatePayslip(staffMember)}
                            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition text-sm"
                          >
                            Pay ¢{payment.netSalary}
                          </button>
                          <button
                            onClick={() => generatePayslip(staffMember)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          >
                            <FaFileInvoice />
                            Payslip
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
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
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                PAYSLIP - {payslipData.month}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Employee Details
                    </h3>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>Name:</strong> {payslipData.staffName}
                    </p>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>ID:</strong> {payslipData.staffId}
                    </p>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>Role:</strong> {payslipData.role}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Bank Details
                    </h3>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>Bank:</strong> {payslipData.bankDetails.bankName}
                    </p>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>Account:</strong>{" "}
                      {payslipData.bankDetails.accountNumber}
                    </p>
                    <p className="text-gray-800 dark:text-gray-300">
                      <strong>Name:</strong>{" "}
                      {payslipData.bankDetails.accountName}
                    </p>
                  </div>
                </div>

                <div className="border-t border-b py-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Earnings & Deductions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-300">
                        Basic Salary
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ¢{payslipData.basicSalary.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-300">
                        Overtime
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ¢{payslipData.overtime.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-300">
                        Bonuses
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ¢{payslipData.bonuses.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Deductions</span>
                      <span className="font-bold">
                        -¢{payslipData.deductions.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">
                        NET SALARY
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ¢{payslipData.netSalary.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>This payslip is generated by Transport Manager Pro</p>
                  <p className="mt-1">
                    Date: {format(new Date(), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setPayslipData(null)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={downloadPayslipPDF}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center gap-2"
              >
                <FaPrint />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
