// StaffPayslipModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../lib/store";
import { fetchSalaryHistory } from "../../lib/slices/staffSlice";
import { Staff } from "@/app/types/staff";
import SalaryPayslip from "./SalaryPaySlip";

interface Props {
  staff: Staff;
  onClose: () => void;
}

export default function StaffPayslipModal({ staff, onClose }: Props) {
  const dispatch = useAppDispatch();
  const salaryHistoryMap = useAppSelector(state => state.staff.salaryHistory);
  const salaryHistory = salaryHistoryMap[staff.id] || [];
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!salaryHistoryMap[staff.id]) {
      setLoading(true);
      dispatch(fetchSalaryHistory(staff.id)).finally(() => setLoading(false));
    }
  }, [dispatch, staff.id, salaryHistoryMap]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">Loading payslip...</div>
      </div>
    );
  }

  const latestPayment = salaryHistory.length > 0 ? salaryHistory[0] : null;
  if (!latestPayment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>No payment records found for this staff.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return <SalaryPayslip payment={latestPayment} staff={staff} onClose={onClose} />;
}