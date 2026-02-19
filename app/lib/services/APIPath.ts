// services/APIPath.ts
import { $axios } from "./api";

const apiService = {
    // Cars endpoints
    getCars: () => $axios.get("/cars/"),
    getCarById: (id: string) => $axios.get(`/cars/${id}/`),
    createCar: (data: any) => $axios.post("/cars/", data),
    updateCar: (id: string, data: any) => $axios.put(`/cars/${id}/`, data),
    updateCarStatus: (id: string, status: string) => $axios.post(`/cars/${id}/update_status/`, { status }),
    updateCarStatusWithEventPayload: (id: string, payload: any) => $axios.patch(`/cars/${id}/payload/`, payload),

    // Bookings endpoints
    fetchBookings: (params?: any) => $axios.get("/bookings/", { params }),
    createBooking: (data: any) => $axios.post("/bookings/", data),
    checkAvailability: (params: { car_id: string; start_date: string; end_date: string }) =>
        $axios.get("/bookings/check_availability/", { params }),
    getBookingById: (id: string) => $axios.get(`/bookings/${id}/`),
    cancelBooking: (id: string, data: any) => $axios.post(`/bookings/${id}/cancel/`, data),
    markBookingAsReturned: (id: string, data: any) => $axios.post(`/bookings/${id}/mark_returned/`, data),
    sendEmailReceipt: (id: string) => $axios.post(`/bookings/${id}/send_email_receipt/`),
    sendSMSReceipt: (id: string) => $axios.post(`/bookings/${id}/send_sms_receipt/`),
    bookingSMS: (bookingId: string) => $axios.post(`/bookings/${bookingId}/send_confirmation_sms/`),

    // Customers endpoints
    getCustomers: () => $axios.get("/customers/"),
    createCustomer: (data: any) => $axios.post("/customers/", data),
    getCustomerById: (id: string) => $axios.get(`/customers/${id}/`),
    getCustomerBookingsWithGuarantor: (customerId: string) => $axios.get(`/customers/${customerId}/bookings-with-guarantor/`),
    sendBulkSMS: (customerIds: string[], message: string) => $axios.post('/customers/send-bulk-sms/', { customer_ids: customerIds, message }),
    sendSingleSMS: (customerId: string, message: string) => $axios.post(`/customers/${customerId}/send-sms/`, { message }),
      
    // Staff endpoints
    getStaff: () => $axios.get("/staff/"),
    getStaffById: (id: string) => $axios.get(`/staff/${id}/`),
    createStaff: (data: any) => $axios.post("/staff/", data),
    updateStaff: (id: string, data: any) => $axios.put(`/staff/${id}/`, data),
    updateStaffStatus: (id: string, action: string, data?: any) => $axios.post(`/staff/${id}/${action}/`, data),
    getSalaryHistory: (staffId: string, params?: any) => $axios.get(`/staff/${staffId}/salary_history/`, { params }),
    createSalaryPayment: (data: any) => $axios.post("/salary-payments/", data),
    getDriverBookings: (driverId: string) => $axios.get(`/staff/${driverId}/bookings/`),
    sendSalaryEmail: (paymentId: string) => $axios.post(`/salary-payments/${paymentId}/send_email/`),
    sendSalarySMS: (paymentId: string) => $axios.post(`/salary-payments/${paymentId}/send_sms/`),
};

export default apiService;