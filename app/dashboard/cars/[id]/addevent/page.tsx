"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../../../lib/store";
import {
  updateCarStatusWithEventPayload,
  setSelectedCar,
} from "../../../../lib/slices/carsSlice";
import { selectCarById, selectSelectedCar } from "@/app/lib/slices/selectors";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaCalendar,
  FaWrench,
  FaExclamationTriangle,
  FaArrowUp,
  FaCar,
  FaShieldAlt,
} from "react-icons/fa";

// Define event types
type EventType =
  | "maintenance"
  | "revenue"
  | "insurance"
  | "accident"
  | "registration"
  | "inspection"
  | "other";

export default function AddEventPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const selectedCar = useAppSelector(selectSelectedCar);
  const [loading, setLoading] = useState(false);

  // Find the car by ID
  const carId = params.id as string;
  const currentCar = useAppSelector(selectCarById(carId));

  const [eventData, setEventData] = useState({
    type: "maintenance" as EventType,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    garage: "",
    provider: "",
    policyNumber: "",
    insuranceStartDate: new Date().toISOString().split("T")[0],
    insuranceEndDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .toISOString()
      .split("T")[0],
    severity: "low",
    maintenanceReturnDate: new Date(
      new Date().setDate(new Date().getDate() + 7)
    )
      .toISOString()
      .split("T")[0],
    revenueSource: "booking",
  });

  // Initialize car selection in Redux
  useEffect(() => {
    if (currentCar && !selectedCar) {
      dispatch(setSelectedCar(currentCar));
    }
  }, [currentCar, selectedCar, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentCar) {
        throw new Error("Car not found");
      }

      // Prepare event data for backend
      const eventPayload = {
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        amount: eventData.amount,
        // Type-specific data
        ...(eventData.type === "maintenance" && {
          garage: eventData.garage,
          returnDate: eventData.maintenanceReturnDate,
        }),
        ...(eventData.type === "insurance" && {
          provider: eventData.provider,
          policyNumber: eventData.policyNumber,
          startDate: eventData.insuranceStartDate,
          endDate: eventData.insuranceEndDate,
        }),
        ...(eventData.type === "accident" && {
          severity: eventData.severity,
          returnDate: eventData.maintenanceReturnDate,
        }),
        ...(eventData.type === "revenue" && {
          source: eventData.revenueSource,
        }),
      };

      // Send to backend - backend will update car status and return updated car
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setEventData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setEventData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Helper function to calculate min date for end date (must be after start date)
  const getMinEndDate = () => {
    return eventData.insuranceStartDate;
  };

  if (!currentCar) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaCar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Car not found
          </h3>
          <button
            onClick={() => router.push("/dashboard/cars")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
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
          <button
            onClick={() => router.push(`/dashboard/cars/${currentCar.id}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Add New Event: {currentCar.make} {currentCar.model}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Record maintenance, revenue, insurance, or other events
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/dashboard/cars/${currentCar.id}`)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FaTimes className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <FaSave className="w-4 h-4 inline mr-2" />
            {loading ? "Adding..." : "Add Event"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-6">
            {/* Event Type Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center mb-6">
                <FaCalendar className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Event Details
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="type"
                    value={eventData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="revenue">Revenue</option>
                    <option value="insurance">Insurance</option>
                    <option value="accident">Accident</option>
                    <option value="registration">Registration</option>
                    <option value="inspection">Inspection</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    placeholder="e.g., Oil Change, Major Service, Insurance Renewal"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (¢)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={eventData.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Description
              </h3>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white resize-none"
                placeholder="Provide details about the event..."
              />
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-6">
            {/* Type-Specific Fields */}
            {eventData.type === "maintenance" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-6">
                  <FaWrench className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Maintenance Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Garage/Service Center
                    </label>
                    <input
                      type="text"
                      name="garage"
                      value={eventData.garage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="e.g., ABC Auto Services"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start of Maintenance Date *
                      </label>
                      <input
                        type="date"
                        name="maintenanceReturnDate"
                        value={eventData.maintenanceReturnDate}
                        onChange={handleChange}
                        required
                        min={eventData.date}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Return Date *
                      </label>
                      <input
                        type="date"
                        name="maintenanceReturnDate"
                        value={eventData.maintenanceReturnDate}
                        onChange={handleChange}
                        required
                        min={eventData.date}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Car will be unavailable until this date
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {eventData.type === "insurance" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-6">
                  <FaShieldAlt className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Insurance Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Insurance Provider *
                    </label>
                    <input
                      type="text"
                      name="provider"
                      value={eventData.provider}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="e.g., State Farm, Allstate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Policy Number *
                    </label>
                    <input
                      type="text"
                      name="policyNumber"
                      value={eventData.policyNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      placeholder="e.g., POL-123456789"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="insuranceStartDate"
                        value={eventData.insuranceStartDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="insuranceEndDate"
                        value={eventData.insuranceEndDate}
                        onChange={handleChange}
                        required
                        min={getMinEndDate()}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {eventData.type === "accident" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-6">
                  <FaExclamationTriangle className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Accident Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity *
                    </label>
                    <select
                      name="severity"
                      value={eventData.severity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    >
                      <option value="low">Minor (Scratches/Dents)</option>
                      <option value="medium">Moderate (Body Damage)</option>
                      <option value="high">Major (Structural Damage)</option>
                      <option value="total">Total Loss</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Note: {"'"}Total Loss{"'"} will mark the car as retired
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Incident *
                      </label>
                      <input
                        type="date"
                        name="maintenanceReturnDate"
                        value={eventData.maintenanceReturnDate}
                        onChange={handleChange}
                        required
                        min={eventData.date}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expected Return Date *
                      </label>
                      <input
                        type="date"
                        name="maintenanceReturnDate"
                        value={eventData.maintenanceReturnDate}
                        onChange={handleChange}
                        required
                        min={eventData.date}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Car will be unavailable until this date
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {eventData.type === "revenue" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-6">
                  <FaArrowUp className="w-6 h-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Revenue Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source *
                    </label>
                    <select
                      name="revenueSource"
                      value={eventData.revenueSource}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    >
                      <option value="booking">Rental Booking</option>
                      <option value="service">Additional Service</option>
                      <option value="penalty">Late Return Penalty</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Event Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Event Preview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Type:
                  </span>
                  <span className="font-medium capitalize">
                    {eventData.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Date:
                  </span>
                  <span className="font-medium">
                    {new Date(eventData.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Title:
                  </span>
                  <span className="font-medium">
                    {eventData.title || "No title"}
                  </span>
                </div>
                {eventData.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount:
                    </span>
                    <span className="font-medium">
                      ¢{eventData.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {eventData.type === "maintenance" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Return Date:
                    </span>
                    <span className="font-medium">
                      {new Date(
                        eventData.maintenanceReturnDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {eventData.type === "insurance" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Coverage:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          eventData.insuranceStartDate
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          eventData.insuranceEndDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Vehicle Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Vehicle:
                  </span>
                  <span className="font-medium">
                    {currentCar.make} {currentCar.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Year:
                  </span>
                  <span className="font-medium">{currentCar.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Current Status:
                  </span>
                  <span
                    className={`font-medium ${
                      currentCar.status === "available"
                        ? "text-green-600"
                        : currentCar.status === "rented"
                        ? "text-blue-600"
                        : currentCar.status === "maintenance"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {currentCar.status.charAt(0).toUpperCase() +
                      currentCar.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    License Plate:
                  </span>
                  <span className="font-medium">
                    {currentCar.licensePlate || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
