"use client";

import { useState, useRef } from "react";
import { FaPrint, FaEnvelope, FaSms } from "react-icons/fa";
import { useAppDispatch } from "../../lib/store";
import { createSalaryPayment } from "../../lib/slices/staffSlice";
import { Staff } from "@/app/types/staff";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import apiService from "../../lib/services/APIPath";

interface Props {
    staff: Staff;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SalaryPaymentModal({ staff, onClose, onSuccess }: Props) {
    const dispatch = useAppDispatch();
    const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
    const [basicSalary, setBasicSalary] = useState(staff.salary);
    const [overtime, setOvertime] = useState(0);
    const [bonuses, setBonuses] = useState(0);
    const [deductions, setDeductions] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
    const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [loading, setLoading] = useState(false);
    const [createdPayment, setCreatedPayment] = useState<any>(null);

    const netSalary = basicSalary + overtime + bonuses - deductions;

    const handleSubmit = async () => {
        setLoading(true);
        const data = {
            staff: staff.id,
            month: month + "-01", // first day of month
            basic_salary: basicSalary,
            overtime,
            bonuses,
            deductions,
            net_salary: netSalary,
            is_paid: true,
            payment_date: paymentDate,
            payment_method: paymentMethod,
        };
        try {
            const result = await dispatch(createSalaryPayment(data)).unwrap();
            setCreatedPayment(result);
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("Failed to process payment");
        } finally {
            setLoading(false);
        }
    };

    if (createdPayment) {
        return <SalaryPayslip payment={createdPayment} staff={staff} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Process Salary Payment - {staff.name}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Basic Salary</label>
                        <input
                            type="number"
                            value={basicSalary}
                            onChange={(e) => setBasicSalary(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Overtime</label>
                        <input
                            type="number"
                            value={overtime}
                            onChange={(e) => setOvertime(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bonuses</label>
                        <input
                            type="number"
                            value={bonuses}
                            onChange={(e) => setBonuses(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Deductions</label>
                        <input
                            type="number"
                            value={deductions}
                            onChange={(e) => setDeductions(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        />
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                        <span>Net Salary:</span>
                        <span>¢{netSalary.toLocaleString()}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="mobile_money">Mobile Money</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Payment Date</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Process Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SalaryPayslip({ payment, staff, onClose }: any) {

    const contentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `Payslip_${staff.name}_${format(new Date(payment.month), "yyyy-MM")}`,
        onAfterPrint: () => console.log("Printed successfully"), // Optional callback
    });
    const handleEmail = async () => {
        try {
            await apiService.sendSalaryEmail(payment.id);
            alert("Email sent successfully!");
        } catch (error) {
            alert("Failed to send email.");
        }
    };
    const handleSMS = async () => {
        try {
            await apiService.sendSalarySMS(payment.id);
            alert("SMS sent successfully!");
        } catch (error) {
            alert("Failed to send SMS.");
        }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
        <div 
          ref={contentRef} 
          id="payslip" 
          className="p-8 border rounded-lg bg-white text-black"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold uppercase tracking-wide">Payslip</h2>
            <p className="text-lg font-semibold mt-2">{staff.name}</p>
            <p className="text-gray-600">{staff.role}</p>
            <p className="text-sm text-gray-500 mt-1">
              Period: {format(new Date(payment.month), "MMMM yyyy")}
            </p>
          </div>

          <div className="mt-4 border-t border-b py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary:</span>
              <span className="font-medium">¢{payment.basic_salary?.toLocaleString() || payment.basicSalary?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime:</span>
              <span className="font-medium">¢{payment.overtime?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bonuses:</span>
              <span className="font-medium">¢{payment.bonuses?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="text-gray-600">Deductions:</span>
              <span>-¢{payment.deductions?.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-bold text-xl mt-4 pt-2 border-t border-black">
            <span>Net Salary:</span>
            <span>¢{payment.net_salary?.toLocaleString() || payment.netSalary?.toLocaleString()}</span>
          </div>

          <div className="mt-8 text-xs text-gray-400 flex justify-between">
            <p>Payment Date: {format(new Date(payment.paymentDate), "dd MMM yyyy")}</p>
            <p>Method: {payment.paymentMethod.replace("_", " ").toUpperCase()}</p>
          </div>
        </div>

        {/* Action Buttons (These will NOT be printed because they are outside the ref) */}
        <div className="flex justify-end gap-4 mt-6 print:hidden">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            Close
          </button>
          <button 
            onClick={() => handlePrint()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FaPrint /> Print PDF
          </button>
          <button 
            onClick={handleEmail} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <FaEnvelope /> Email
          </button>
          <button 
            onClick={handleSMS} 
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg flex items-center gap-2 hover:bg-yellow-700"
          >
            <FaSms /> SMS
          </button>
        </div>
      </div>
    </div>
  );
}