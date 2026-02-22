// SalaryPayslip.tsx
"use client";

import { useRef } from "react";
import { FaPrint, FaEnvelope, FaSms } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import apiService from "../../lib/services/APIPath";

interface Props {
  payment: any;          // SalaryPayment object
  staff: any;            // Staff object
  onClose: () => void;
}

export default function SalaryPayslip({ payment, staff, onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Payslip_${staff.name}_${format(new Date(payment.month), "yyyy-MM")}`,
  });

  const handleEmail = async () => {
    try {
      await apiService.sendSalaryEmail(payment.id);
      alert("Email sent successfully!");
    } catch {
      alert("Failed to send email.");
    }
  };

  const handleSMS = async () => {
    try {
      await apiService.sendSalarySMS(payment.id);
      alert("SMS sent successfully!");
    } catch {
      alert("Failed to send SMS.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6">
        {/* Payslip content (prints only this part) */}
        <div
          ref={contentRef}
          className="bg-white text-gray-900 p-8 border border-gray-200 shadow-lg rounded-lg"
        >
          {/* Header with company info */}
          <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800">YOS Car Rentals</h1>
              <p className="text-sm text-gray-600"> Opposite Shell filling station, Mango Down, Patasi, Kumasi, Ghana</p>
              <p className="text-sm text-gray-600">+233 54 621 3027 | +233 24 445 5757 | Email: info@yoscarrentals.com</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">PAYSLIP</p>
              <p className="text-sm">Period: {format(new Date(payment.month), "MMMM yyyy")}</p>
              <p className="text-sm">Payment Date: {format(new Date(payment.paymentDate), "dd MMM yyyy")}</p>
            </div>
          </div>

          {/* Employee details */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-xs text-gray-500">Employee Name</p>
              <p className="font-medium">{staff.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employee ID</p>
              <p className="font-medium">{staff.employeeId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role / Department</p>
              <p className="font-medium">{staff.role} / {staff.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="font-medium">{payment.paymentMethod?.replace("_", " ").toUpperCase()}</p>
            </div>
          </div>

          {/* Earnings & Deductions table */}
          <table className="w-full mb-6">
            <thead className="border-t border-b border-gray-300 bg-gray-100">
              <tr>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Amount (¢)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">Basic Salary</td>
                <td className="py-2 text-right">{payment.basic_salary?.toLocaleString() || payment.basicSalary?.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2">Overtime</td>
                <td className="py-2 text-right">{payment.overtime?.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2">Bonuses</td>
                <td className="py-2 text-right">{payment.bonuses?.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-2 font-medium">Total Earnings</td>
                <td className="py-2 text-right font-medium">
                  ¢{((payment.basic_salary || payment.basicSalary) + (payment.overtime || 0) + (payment.bonuses || 0)).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-red-600">Deductions</td>
                <td className="py-2 text-right text-red-600">- ¢{payment.deductions?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Net Pay */}
          <div className="flex justify-between items-center border-t-2 border-gray-400 pt-4 text-xl font-bold">
            <span>NET PAY (GHS)</span>
            <span>¢{payment.net_salary?.toLocaleString() || payment.netSalary?.toLocaleString()}</span>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 mt-6 text-center">
            This is a computer‑generated document. No signature required.
          </p>
        </div>

        {/* Action buttons – outside the printable ref */}
        <div className="flex justify-end gap-4 mt-6 print:hidden">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Close
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <FaPrint /> Print PDF
          </button>
          <button onClick={handleEmail} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
            <FaEnvelope /> Email
          </button>
          <button onClick={handleSMS} className="px-4 py-2 bg-yellow-600 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-700">
            <FaSms /> SMS
          </button>
        </div>
      </div>
    </div>
  );
}