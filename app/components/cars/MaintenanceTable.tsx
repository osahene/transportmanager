import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../lib/store";
import {
  setSelectedRecord,
  updateMaintenanceStatus,
  completeMaintenance,
  extendMaintenanceDeadline,
  selectMaintenanceBycarId,
} from "../../lib/slices/maintenanceSlice";
import { MaintenanceRecord, MaintenanceStatus } from "../../types/maintenance";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaWrench,
  FaCalendarPlus,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

interface MaintenanceTableProps {
  vehicleId: string;
  onAddRecord: () => void;
  onEditRecord: (record: MaintenanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  vehicleId,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const records = useSelector(selectMaintenanceBycarId(vehicleId));

  const [localSelectedRecord, setLocalSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedRecordForAction, setSelectedRecordForAction] =
    useState<MaintenanceRecord | null>(null);
  const [newEstimatedDate, setNewEstimatedDate] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [actualReturnDate, setActualReturnDate] = useState("");

  const handleViewDetails = (record: MaintenanceRecord) => {
    dispatch(setSelectedRecord(record));
    setLocalSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (record: MaintenanceRecord) => {
    setSelectedRecordForAction(record);
    setIsStatusModalOpen(true);
  };

  const handleExtendDeadline = (record: MaintenanceRecord) => {
    setSelectedRecordForAction(record);
    setNewEstimatedDate(record.estimatedEndDate);
    setIsExtendModalOpen(true);
  };

  const handleCompleteEarly = (record: MaintenanceRecord) => {
    setSelectedRecordForAction(record);
    setActualReturnDate(new Date().toISOString().split("T")[0]);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmStatusUpdate = async (newStatus: MaintenanceStatus) => {
    if (selectedRecordForAction) {
      try {
        await dispatch(
          updateMaintenanceStatus({
            recordId: selectedRecordForAction.id,
            status: newStatus,
            carId: vehicleId,
            estimatedEndDate: selectedRecordForAction.estimatedEndDate,
            notes: `Status updated to ${newStatus}`,
          })
        ).unwrap();
        setIsStatusModalOpen(false);
        setSelectedRecordForAction(null);
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  const handleConfirmExtendDeadline = async () => {
    if (selectedRecordForAction && newEstimatedDate && extensionReason) {
      try {
        await dispatch(
          extendMaintenanceDeadline({
            recordId: selectedRecordForAction.id,
            newEstimatedDate,
            reason: extensionReason,
          })
        ).unwrap();
        setIsExtendModalOpen(false);
        setSelectedRecordForAction(null);
        setNewEstimatedDate("");
        setExtensionReason("");
      } catch (error) {
        console.error("Failed to extend deadline:", error);
      }
    }
  };

  const handleConfirmCompleteEarly = async () => {
    if (selectedRecordForAction) {
      try {
        await dispatch(
          completeMaintenance({
            recordId: selectedRecordForAction.id,
            carId: vehicleId,
            actualEndDate: actualReturnDate || undefined,
          })
        ).unwrap();
        setIsCompleteModalOpen(false);
        setSelectedRecordForAction(null);
        setActualReturnDate("");
      } catch (error) {
        console.error("Failed to complete maintenance:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "delayed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const isDatePassed = (dateString: string) => {
    const today = new Date();
    const dateObj = new Date(dateString);
    return dateObj < today;
  };

  const calculateDaysDifference = (dateString: string) => {
    const today = new Date();
    const dateObj = new Date(dateString);
    const diffTime = Math.abs(today.getTime() - dateObj.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Maintenance Records
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage maintenance with flexible deadlines for Ghanaian mechanics
            </p>
          </div>
          <button
            onClick={onAddRecord}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Record
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Start Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Est. Return
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaWrench className="w-12 h-12 text-gray-400 mb-2" />
                      <p>No maintenance records found</p>
                      <p className="text-sm mt-1">
                        Add your first maintenance record
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const estimatedDatePassed = isDatePassed(
                    record.estimatedEndDate
                  );
                  const isDelayed =
                    record.status === "delayed" ||
                    (record.status === "in-progress" && estimatedDatePassed);
                  const daysOverdue = estimatedDatePassed
                    ? calculateDaysDifference(record.estimatedEndDate)
                    : 0;

                  return (
                    <tr
                      key={record.id}
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isDelayed ? "bg-orange-50 dark:bg-orange-900/10" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.type}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${record.cost.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(record.startDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {formatDate(record.estimatedEndDate)}
                          </div>
                          {estimatedDatePassed &&
                            (record.status === "in-progress" ||
                              record.status === "scheduled") && (
                              <div className="flex items-center mt-1">
                                <FaExclamationTriangle className="w-3 h-3 text-orange-500 mr-1" />
                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                  {daysOverdue} day
                                  {daysOverdue !== 1 ? "s" : ""} overdue
                                </span>
                              </div>
                            )}
                          {record.actualEndDate && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Actual: {formatDate(record.actualEndDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            record.status
                          )}`}
                        >
                          {record.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(record)}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>

                          {(record.status === "in-progress" ||
                            record.status === "scheduled" ||
                            record.status === "delayed") && (
                            <>
                              <button
                                onClick={() => handleCompleteEarly(record)}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                                title="Mark as Completed (Early)"
                              >
                                <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </button>

                              <button
                                onClick={() => handleExtendDeadline(record)}
                                className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900 rounded"
                                title="Extend Deadline"
                              >
                                <FaCalendarPlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleUpdateStatus(record)}
                            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded"
                            title="Update Status"
                          >
                            <FaClock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </button>

                          <button
                            onClick={() => onEditRecord(record)}
                            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded"
                            title="Edit Record"
                          >
                            <FaEdit className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </button>

                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            <FaTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for maintenance details */}
      {isModalOpen && localSelectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Maintenance Details
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Maintenance Type
                  </label>
                  <p className="text-gray-800 dark:text-white font-medium">
                    {localSelectedRecord.type}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                        localSelectedRecord.status
                      )}`}
                    >
                      {localSelectedRecord.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(localSelectedRecord.startDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Estimated Return
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(localSelectedRecord.estimatedEndDate)}
                    {isDatePassed(localSelectedRecord.estimatedEndDate) &&
                      (localSelectedRecord.status === "in-progress" ||
                        localSelectedRecord.status === "scheduled") && (
                        <span className="ml-2 text-sm text-orange-600">
                          (
                          {calculateDaysDifference(
                            localSelectedRecord.estimatedEndDate
                          )}{" "}
                          days overdue)
                        </span>
                      )}
                  </p>
                </div>

                {localSelectedRecord.actualEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Actual Return
                    </label>
                    <p className="dark:text-white text-green-600 font-medium">
                      {formatDate(localSelectedRecord.actualEndDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Garage/Service Center
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {localSelectedRecord.garage}
                  </p>
                  {localSelectedRecord.garageContact && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {localSelectedRecord.garageContact}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Cost
                  </label>
                  <p className="text-gray-800 dark:text-white text-xl font-bold">
                    ${localSelectedRecord.cost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <p className="text-gray-800 dark:text-white whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {localSelectedRecord.description || "No description provided"}
                </p>
              </div>

              {/* Notes */}
              {localSelectedRecord.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Update Notes
                  </label>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <div className="text-gray-800 dark:text-yellow-200 whitespace-pre-line text-sm">
                      {localSelectedRecord.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for updating maintenance status */}
      {isStatusModalOpen && selectedRecordForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Update Maintenance Status
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-white">
                  {selectedRecordForAction.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Est. Return:{" "}
                  {formatDate(selectedRecordForAction.estimatedEndDate)}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Select New Status
                </label>

                <button
                  onClick={() => handleConfirmStatusUpdate("scheduled")}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-center">
                    <FaClock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Scheduled
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Maintenance is planned for future
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmStatusUpdate("in-progress")}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                >
                  <div className="flex items-center">
                    <FaWrench className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-yellow-800 dark:text-yellow-300">
                        In Progress
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Car is currently with mechanic
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmStatusUpdate("delayed")}
                  className="w-full flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <div className="flex items-center">
                    <FaExclamationTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-orange-800 dark:text-orange-300">
                        Delayed
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        Extension needed beyond estimate
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for extending maintenance deadline */}
      {isExtendModalOpen && selectedRecordForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Extend Maintenance Deadline
              </h3>
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-white">
                  {selectedRecordForAction.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current deadline:{" "}
                  {formatDate(selectedRecordForAction.estimatedEndDate)}
                </p>
                {isDatePassed(selectedRecordForAction.estimatedEndDate) && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    ⚠️ This maintenance is overdue by{" "}
                    {calculateDaysDifference(
                      selectedRecordForAction.estimatedEndDate
                    )}{" "}
                    days
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  New Estimated Return Date
                </label>
                <input
                  type="date"
                  value={newEstimatedDate}
                  onChange={(e) => setNewEstimatedDate(e.target.value)}
                  min={selectedRecordForAction.estimatedEndDate}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select a new date when you expect the car to be ready
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Reason for Extension *
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white resize-none"
                  placeholder="e.g., Awaiting parts, Mechanic unavailable, Additional repairs needed..."
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsExtendModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtendDeadline}
                disabled={!newEstimatedDate || !extensionReason}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Extend Deadline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for completing maintenance early */}
      {isCompleteModalOpen && selectedRecordForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Complete Maintenance Early
              </h3>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="font-medium text-gray-800 dark:text-white">
                  {selectedRecordForAction.type}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current deadline:{" "}
                  {formatDate(selectedRecordForAction.estimatedEndDate)}
                </p>
                {!isDatePassed(selectedRecordForAction.estimatedEndDate) && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✅ This maintenance will be completed{" "}
                    {calculateDaysDifference(
                      selectedRecordForAction.estimatedEndDate
                    )}{" "}
                    days early
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Actual Return Date
                </label>
                <input
                  type="date"
                  value={actualReturnDate}
                  onChange={(e) => setActualReturnDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-1">
                  When did the car actually return? (Defaults to today)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Note
                    </h4>
                    <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      <p>Completing maintenance early will:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Mark the car as available for booking</li>
                        <li>Update the maintenance record as completed</li>
                        <li>Update the actual return date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteEarly}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceTable;
