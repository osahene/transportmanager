// /components/cars/BookingsTable.tsx
import { useState } from "react";
import { Booking } from "../../types/booking";
import { FaEye, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

interface BookingsTableProps {
  bookings: Booking[];
  vehicleId: string;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  vehicleId,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "no-show":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatusColor = (status: Booking["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Filter bookings for this specific vehicle
  const vehicleBookings = bookings.filter(
    (booking) => booking.carId === vehicleId
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Booking History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total {vehicleBookings.length} booking(s) for this vehicle
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {vehicleBookings.filter((b) => b.status === "confirmed").length}
              </span>{" "}
              Active
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {vehicleBookings.filter((b) => b.status === "completed").length}
              </span>{" "}
              Completed
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Period
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Duration
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Booking Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Payment Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicleBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaCalendarAlt className="w-12 h-12 text-gray-400 mb-2" />
                      <p>No booking history found</p>
                      <p className="text-sm mt-1">
                        This vehicle has no bookings yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicleBookings
                  .sort(
                    (a, b) =>
                      new Date(b.startDate).getTime() -
                      new Date(a.startDate).getTime()
                  )
                  .map((booking) => {
                    const duration = calculateDuration(
                      booking.startDate,
                      booking.endDate
                    );
                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {formatDate(booking.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FaCalendarAlt className="w-4 h-4" />
                            <span>
                              {formatDate(booking.startDate)} -{" "}
                              {formatDate(booking.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {duration} day{duration !== 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                ${booking.totalAmount.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Paid: ${booking.amountPaid.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus.charAt(0).toUpperCase() +
                              booking.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                              title="View Details"
                            >
                              <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            {booking.status === "confirmed" && (
                              <button
                                onClick={() => {
                                  /* Handle cancellation */
                                }}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                title="Cancel Booking"
                              >
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  Cancel
                                </span>
                              </button>
                            )}
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

      {/* Modal for booking details */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Booking Details
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
                    Booking ID
                  </label>
                  <p className="text-gray-800 dark:text-white font-mono">
                    {selectedBooking.id}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
              </div>

              {/* Booking Period */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedBooking.startDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedBooking.endDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {calculateDuration(
                      selectedBooking.startDate,
                      selectedBooking.endDate
                    )}{" "}
                    days
                  </p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Financial Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Amount:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ¢{selectedBooking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount Paid:
                    </span>
                    <span
                      className={`font-medium ${
                        selectedBooking.amountPaid >=
                        selectedBooking.totalAmount
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      ¢{selectedBooking.amountPaid.toLocaleString()}
                    </span>
                  </div>
                  {selectedBooking.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment Method:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {selectedBooking.paymentMethod
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  {selectedBooking.refundAmount &&
                    selectedBooking.refundAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          Refund Amount:
                        </span>
                        <span className="font-medium text-red-600">
                          ¢{selectedBooking.refundAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Booking Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status.charAt(0).toUpperCase() +
                      selectedBooking.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Payment Status
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() +
                      selectedBooking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Locations */}
              {selectedBooking.pickupLocation ||
              selectedBooking.dropoffLocation ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBooking.pickupLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Pickup Location
                      </label>
                      <p className="text-gray-800 dark:text-white">
                        {selectedBooking.pickupLocation}
                      </p>
                    </div>
                  )}
                  {selectedBooking.dropoffLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Drop-off Location
                      </label>
                      <p className="text-gray-800 dark:text-white">
                        {selectedBooking.dropoffLocation}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Additional Services */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Additional Services
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Driver Service:
                    </span>
                    <span
                      className={`font-medium ${
                        selectedBooking.hasDriver
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedBooking.hasDriver ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Insurance Coverage:
                    </span>
                    <span
                      className={`font-medium ${
                        selectedBooking.insuranceCoverage
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedBooking.insuranceCoverage ? "Yes" : "No"}
                    </span>
                  </div>
                  {selectedBooking.driverId && (
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Driver ID:
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white ml-2">
                        {selectedBooking.driverId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation Info */}
              {selectedBooking.status === "cancelled" &&
                selectedBooking.cancelledAt && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      Cancellation Information
                    </h4>
                    <p className="text-red-700 dark:text-red-400">
                      Cancelled on: {formatDate(selectedBooking.cancelledAt)}
                    </p>
                    {selectedBooking.refundReason && (
                      <p className="text-red-700 dark:text-red-400 mt-1">
                        Reason: {selectedBooking.refundReason}
                      </p>
                    )}
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
    </>
  );
};

export default BookingsTable;
