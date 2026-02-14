"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../../lib/store";
import {
  updateCarStatusWithEventPayload,
  fetchCarById,
} from "../../../../lib/slices/carsSlice";
import { selectCarById } from "@/app/lib/slices/selectors"; // Removed unused selectSelectedCar
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaCalendar,
  FaWrench,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCar,
} from "react-icons/fa";

// 1. Unified Event Types
type EventType = "maintenance" | "insurance" | "accident" | "other";

// 2. Extracted Styles to avoid repetition
const INPUT_CLASSES = "w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white";

export default function AddEventPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const carId = params.id as string;
  const currentCar = useAppSelector(selectCarById(carId));

  // 3. Consolidated State
  // We use generic names (startDate, endDate, vendor) and map them on submit
  const [formData, setFormData] = useState({
    type: "maintenance" as EventType,
    title: "",
    description: "",
    amount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    vendor: "", // Covers: Garage, Insurance Provider
    referenceNumber: "", // Covers: Policy Number
    severity: "low",
  });

  useEffect(() => {
    if (!currentCar && carId) {
      dispatch(fetchCarById(carId));
    }
  }, [carId, currentCar, dispatch]);

  // 4. Helper to get labels based on type
  const getTypeConfig = useMemo(() => {
    switch (formData.type) {
      case "insurance":
        return {
          icon: <FaShieldAlt className="w-6 h-6 text-blue-500 mr-2" />,
          sectionTitle: "Insurance Details",
          vendorLabel: "Insurance Provider",
          refLabel: "Policy Number",
          startLabel: "Coverage Start Date",
          endLabel: "Coverage End Date",
          showVendor: true,
          showRef: true,
          showEnd: true,
        };
      case "accident":
        return {
          icon: <FaExclamationTriangle className="w-6 h-6 text-blue-500 mr-2" />,
          sectionTitle: "Accident Details",
          startLabel: "Date of Incident",
          endLabel: "Expected Return Date",
          showVendor: false,
          showRef: false,
          showEnd: true,
        };
      case "maintenance":
      default:
        return {
          icon: <FaWrench className="w-6 h-6 text-blue-500 mr-2" />,
          sectionTitle: "Maintenance Details",
          vendorLabel: "Garage/Service Center",
          startLabel: "Start Date",
          endLabel: "Expected Return Date",
          showVendor: true,
          showRef: false,
          showEnd: true,
        };
    }
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentCar) throw new Error("Car not found");

      // 5. Map generic state to backend specific payload
      const eventPayload: any = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
      };

      // Add type-specific fields
      if (formData.type === "maintenance") {
        eventPayload.garage = formData.vendor;
        eventPayload.startDate = formData.startDate;
        eventPayload.returnDate = formData.endDate;
      } else if (formData.type === "insurance") {
        eventPayload.provider = formData.vendor;
        eventPayload.policyNumber = formData.referenceNumber;
        eventPayload.startDate = formData.startDate;
        eventPayload.endDate = formData.endDate;
      } else if (formData.type === "accident") {
        eventPayload.severity = formData.severity;
        eventPayload.startDate = formData.startDate;
        eventPayload.returnDate = formData.endDate;
      }

      await dispatch(
        updateCarStatusWithEventPayload({
          CarId: currentCar.id,
          payload: eventPayload,
        })
      ).unwrap();

      alert("Event added successfully!");
      router.push(`/dashboard/cars/${carId}`);
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  if (!currentCar) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaCar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Car not found</h3>
          <button onClick={() => router.push("/dashboard/cars")} className="text-blue-600 dark:text-blue-400 hover:underline">
            Go back to cars list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push(`/dashboard/cars/${currentCar.id}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Add New Event: {currentCar.make} {currentCar.model}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Record maintenance, insurance, or other events</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => router.push(`/dashboard/cars/${currentCar.id}`)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <FaTimes className="w-4 h-4 inline mr-2" /> Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
            <FaSave className="w-4 h-4 inline mr-2" /> {loading ? "Adding..." : "Add Event"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - General Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center mb-6">
                <FaCalendar className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Event Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} required className={INPUT_CLASSES}>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="accident">Accident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className={INPUT_CLASSES} placeholder="e.g., Oil Change, Renewal" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (¢)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0" step="0.01" className={INPUT_CLASSES} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Description</h3>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={`${INPUT_CLASSES} resize-none`} placeholder="Provide details..." />
            </div>
          </div>

          {/* Right Column - Dynamic Fields & Preview */}
          <div className="space-y-6">
            
            {/* Dynamic Type Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center mb-6">
                {getTypeConfig.icon}
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{getTypeConfig.sectionTitle}</h3>
              </div>

              <div className="space-y-4">
                {getTypeConfig.showVendor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{getTypeConfig.vendorLabel}</label>
                    <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} className={INPUT_CLASSES} placeholder={`Enter ${getTypeConfig.vendorLabel}`} />
                  </div>
                )}

                {getTypeConfig.showRef && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{getTypeConfig.refLabel} *</label>
                    <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required className={INPUT_CLASSES} />
                  </div>
                )}

                {formData.type === "accident" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity *</label>
                    <select name="severity" value={formData.severity} onChange={handleChange} required className={INPUT_CLASSES}>
                      <option value="low">Minor (Scratches/Dents)</option>
                      <option value="medium">Moderate (Body Damage)</option>
                      <option value="high">Major (Structural Damage)</option>
                      <option value="total">Total Loss</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{getTypeConfig.startLabel} *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={INPUT_CLASSES} />
                  </div>
                  
                  {getTypeConfig.showEnd && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{getTypeConfig.endLabel} *</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required min={formData.startDate} className={INPUT_CLASSES} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simplified Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Event Preview</h3>
              <div className="space-y-3">
                <PreviewRow label="Type" value={formData.type} capitalize />
                <PreviewRow label="Title" value={formData.title || "No title"} />
                {formData.amount > 0 && <PreviewRow label="Amount" value={`¢${formData.amount.toLocaleString()}`} />}
                
                {formData.type === "maintenance" && (
                   <PreviewRow label="Garage" value={formData.vendor || "N/A"} />
                )}
                {formData.type === "insurance" && (
                   <PreviewRow label="Valid Until" value={new Date(formData.endDate).toLocaleDateString()} />
                )}
              </div>
            </div>

            {/* Vehicle Info (Kept as is, just cleaner structure) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
               <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Vehicle Information</h3>
               <div className="space-y-3">
                  <PreviewRow label="Vehicle" value={`${currentCar.make} ${currentCar.model}`} />
                  <PreviewRow label="Status" value={currentCar.status} capitalize />
               </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}

const PreviewRow = ({ label, value, capitalize }: { label: string; value: string | number; capitalize?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-gray-600 dark:text-gray-400">{label}:</span>
    <span className={`font-medium ${capitalize ? "capitalize" : ""}`}>{value}</span>
  </div>
);