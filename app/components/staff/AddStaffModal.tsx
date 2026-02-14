"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAppDispatch } from "../../lib/store";
import { createStaff } from "../../lib/slices/staffSlice";

interface AddStaffModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStaffModal({ onClose, onSuccess }: AddStaffModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("driver");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [shift, setShift] = useState("day");
  const [salary, setSalary] = useState(0);
  const [hireDate, setHireDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [driverLicenseId, setDriverLicenseId] = useState("");
  const [driverLicenseClass, setDriverLicenseClass] = useState("");

  const showDriverFields = role === "driver";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Convert camelCase to snake_case for backend
    const payload = {
      name,
      email,
      phone,
      role,
      department,
      employment_type: employmentType,
      shift,
      salary,
      hire_date: hireDate,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      ...(showDriverFields && {
        driver_license_id: driverLicenseId,
        driver_license_class: driverLicenseClass,
      }),
    };
    try {
      await dispatch(createStaff(payload)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      alert("Failed to create staff. Check console for details.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Staff Member</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="driver">Driver</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Employment Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Employment Type *</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              {/* Shift */}
              <div>
                <label className="block text-sm font-medium mb-1">Shift *</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="flexible">Flexible</option>
                  <option value="24_hour">24 Hour</option>
                </select>
              </div>
              {/* Salary */}
              <div>
                <label className="block text-sm font-medium mb-1">Salary *</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  required
                  min="0"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Hire Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Hire Date *</label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Driver-specific fields */}
            {showDriverFields && (
              <div className="border-t pt-4 mt-2">
                <h3 className="text-lg font-semibold mb-2">Driver License Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Driver License ID</label>
                    <input
                      type="text"
                      value={driverLicenseId}
                      onChange={(e) => setDriverLicenseId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">License Class</label>
                    <input
                      type="text"
                      value={driverLicenseClass}
                      onChange={(e) => setDriverLicenseClass(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}