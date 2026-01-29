"use client";

import { useState, useRef, useMemo } from "react";
import {
  FaCalendarAlt,
  FaCar,
  FaUser, 
  FaPrint,
  FaPlus,
  FaSearch,
  FaEnvelope,
  FaSms,
  FaFilePdf,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAppSelector } from "../../lib/store";
import { selectAllBookingsWithDetails } from "../../lib/slices/selectors";
import BookingActions from "@/app/components/booking/bookingActions";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";

interface ReceiptData {
  bookingId: string;
  customerName: string;
  carDetails: string;
  bookingDates: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  date: Date;
}

type SortField = "startDate" | "endDate" | "totalAmount" | "customerName";
type SortDirection = "asc" | "desc";

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const allDetailedBookings = useAppSelector(selectAllBookingsWithDetails);
  const [selectedBooking, setSelectedBooking] = useState<ReceiptData | null>(
    null,
  );

  const receiptRef = useRef<HTMLDivElement>(null);

  // Client-side filtering
  const filteredBookings = useMemo(() => {
    return allDetailedBookings
      .filter((booking) => {
        const matchesStatus =
          statusFilter === "all" || booking.status === statusFilter;
        const matchesSearch =
          booking.customerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.carMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.id.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortField === "startDate" || sortField === "endDate") {
          const dateA = new Date(a[sortField]).getTime();
          const dateB = new Date(b[sortField]).getTime();
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortField === "totalAmount") {
          return sortDirection === "asc"
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        } else {
          // customerName
          const nameA = a.customerName.toLowerCase();
          const nameB = b.customerName.toLowerCase();
          if (sortDirection === "asc") {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        }
      });
  }, [allDetailedBookings, statusFilter, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = allDetailedBookings
    .slice(indexOfFirstItem, indexOfLastItem)
    .map((booking: any) => {
      if (booking.payload) {
        console.log("booking", booking);
        console.log("booking payload", booking.payload);
        return {
          ...booking,
          ...booking.payload,
        };
      }
      return booking;
    });

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field === "startDate" ? "desc" : "asc");
    }
  };

  // Get sort icon for a field
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="ml-1" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="ml-1" />
    ) : (
      <FaSortDown className="ml-1" />
    );
  };

  // Page navigation
  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            currentPage === 1
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            currentPage === i
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>,
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            currentPage === totalPages
              ? "bg-blue-600 dark:bg-blue-700 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  const generateReceiptData = (bookingId: string): ReceiptData | null => {
    // Search by booking.id, not carId
    const booking = allDetailedBookings.find((b) => b.payload.id === bookingId);
 
    if (!booking) return null;
    const { payload } = booking;
    const carDetails = `${booking.carMake} ${booking.carModel} (${booking.carLicensePlate})`;

    return {
      bookingId: payload.id,
      customerName: payload.customerName || "Unknown",
      carDetails: carDetails || "Unknown",
      bookingDates: `${format(
        new Date(payload.startDate),
        "MMM d, yyyy",
      )} - ${format(new Date(payload.endDate), "MMM d, yyyy")}`,
      totalAmount: payload.totalAmount,
      paymentMethod: payload.paymentMethod || "Credit Card",
      transactionId: `TXN-${payload.id.slice(0, 8).toUpperCase()}`,
      date: new Date(),
    };
  };

  const generatePDF = async (bookingId: string) => {
    const receiptData = generateReceiptData(bookingId);
    if (!receiptData) return;

    setSelectedBooking(receiptData);

    console.log("here i am");
    setTimeout(async () => {
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${receiptData.bookingId}.pdf`);

        setSelectedBooking(null);
      }
    }, 100);
  };

  const sendEmailReceipt = async (bookingId: string) => {
    const receiptData = generateReceiptData(bookingId);
    if (!receiptData) return;

    try {
      const response = await fetch("/api/email/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "customer@example.com",
          subject: `Booking Receipt - ${receiptData.bookingId}`,
          receiptData,
        }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const sendSMSReceipt = async (bookingId: string) => {
    const receiptData = generateReceiptData(bookingId);
    if (!receiptData) return;

    alert("SMS receipt functionality would be implemented here");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      confirmed:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      completed:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    );
  };

  const getStatusCount = (status: string) => {
    return allDetailedBookings.filter((booking) => booking.status === status)
      .length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Booking Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage all bookings and generate receipts
          </p>
        </div>
        <Link
          href="/dashboard/bookings/create"
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center gap-2"
        >
          <FaPlus />
          Create New Booking
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            status: "all",
            label: "Total Bookings",
            count: allDetailedBookings.length,
            color: "bg-blue-500",
          },
          {
            status: "confirmed",
            label: "Confirmed",
            count: getStatusCount("confirmed"),
            color: "bg-green-500",
          },
          {
            status: "pending",
            label: "Pending",
            count: getStatusCount("pending"),
            color: "bg-yellow-500",
          },
          {
            status: "completed",
            label: "Completed",
            count: getStatusCount("completed"),
            color: "bg-purple-500",
          },
        ].map((stat) => (
          <div
            key={stat.status}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.count}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <FaCalendarAlt className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by customer name, vehicle, or booking ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent dark:focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    statusFilter === status
                      ? "bg-blue-600 dark:bg-blue-700 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Items Per Page Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Items per page:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, totalItems)} of {totalItems} bookings
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr className="items-center">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("customerName")}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Customer & Vehicle
                    {getSortIcon("customerName")}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("startDate")}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Dates
                    {getSortIcon("startDate")}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("totalAmount")}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Amount
                    {getSortIcon("totalAmount")}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  More Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No bookings found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                currentBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created:{" "}
                        {format(new Date(booking.startDate), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400 dark:text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FaCar className="text-gray-400 dark:text-gray-500" />
                          <span>
                            {booking.carMake} {booking.carModel} (
                            {booking.carLicensePlate})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaCalendarAlt />
                        <span>
                          {format(new Date(booking.startDate), "MMM d")} -{" "}
                          {format(new Date(booking.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.ceil(
                          (new Date(booking.endDate).getTime() -
                            new Date(booking.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ¢{booking.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Daily: ¢{booking.carDailyRate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          booking.status,
                        )}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => generatePDF(booking.id)}
                            className="p-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition"
                            title="Generate PDF"
                          >
                            <FaFilePdf />
                          </button>
                          <button
                            onClick={() => sendEmailReceipt(booking.id)}
                            className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                            title="Send Email"
                          >
                            <FaEnvelope />
                          </button>
                          <button
                            onClick={() => sendSMSReceipt(booking.id)}
                            className="p-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition"
                            title="Send SMS"
                          >
                            <FaSms />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <BookingActions
                        bookingId={booking.id}
                        carId={booking.carId}
                        currentStatus={booking.status}
                        customerName={booking.customerName}
                        carName={`${booking.carMake} ${booking.carModel}`}
                        amountPaid={booking.totalAmount}
                        dailyRate={booking.carDailyRate}
                        endDate={booking.endDate}
                      />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
              >
                <FaChevronLeft />
              </button>
              {renderPaginationButtons()}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 md:mt-0">
              {totalItems} total bookings
            </div>
          </div>
        )}
      </div>

      {/* Hidden Receipt Template for PDF */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div ref={receiptRef} className="p-8 bg-white">
              {/* Receipt Header */}
              <div className="text-center mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  YOS Car Rentals
                </h1>
                <span>
                  <p className="text-gray-600 mt-2">
                    Location: 123 Main Street, City, Country
                  </p>
                  <p className="text-gray-600">
                    Phone: +1 (555) 123-4567 | Email: info@yoscarrentals.com
                  </p>
                </span>
                <h4 className="text-xl font-bold text-gray-900">
                  Official Receipt
                </h4>
              </div>

              {/* Receipt Details */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Receipt Number</p>
                    <p className="font-bold text-gray-900">
                      {selectedBooking.bookingId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold text-gray-900">
                      {format(selectedBooking.date, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Customer Details
                    </h3>
                    <p className="text-gray-800">
                      {selectedBooking.customerName}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Vehicle Details
                    </h3>
                    <p className="text-gray-800">
                      {selectedBooking.carDetails}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Booking Period
                  </h3>
                  <p className="text-gray-800">
                    {selectedBooking.bookingDates}
                  </p>
                </div>

                {/* Amount Breakdown */}
                <div className="border-t border-b py-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">
                      ¢{selectedBooking.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-bold text-gray-900">
                      ¢{(selectedBooking.totalAmount * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">
                      ¢{(selectedBooking.totalAmount * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Payment Method
                    </h3>
                    <p className="text-gray-800">
                      {selectedBooking.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Transaction ID
                    </h3>
                    <p className="text-gray-800">
                      {selectedBooking.transactionId}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600 text-sm">
                    Thank you for choosing YOS Car Rentals!
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    For inquiries: support@yoscarrentals.com | +233 20 123 4567
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaPrint />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
