// services/APIPath.ts
import { $axios } from "./api";

const apiService = {
    // Cars endpoints
    getCars: () => $axios.get("/cars/"),
    getCarById: (id: string) => $axios.get(`/cars/${id}/`),
    createCar: (data: any) => $axios.post("/cars/", data),
    updateCar: (id: string, data: any) => $axios.put(`/cars/${id}/`, data),
    updateCarStatus: (id: string, status: string) => $axios.patch(`/cars/${id}/status/`, { status }),
    updateCarStatusWithEventPayload: (id: string, payload: any) => $axios.patch(`/cars/${id}/payload/`, payload),

    // Bookings endpoints
    fetchBookings: (params?: any) => $axios.get("/bookings/", { params }),
    createBooking: (data: any) => $axios.post("/bookings/", data),
    checkAvailability: (params: { car_id: string; start_date: string; end_date: string }) =>
        $axios.get("/bookings/check_availability/", { params }),
    getBookingById: (id: string) => $axios.get(`/bookings/${id}/`),
    cancelBooking: (id: string, data: any) => $axios.post(`/bookings/${id}/cancel/`, data),

    // Customers endpoints
    getCustomers: () => $axios.get("/customers/"),
    createCustomer: (data: any) => $axios.post("/customers/", data),
    getCustomerById: (id: string) => $axios.get(`/customers/${id}/`),
    getCustomerBookingsWithGuarantor: (customerId: string) => 
    $axios.get(`/customers/${customerId}/bookings-with-guarantor/`),

    // Other endpoints as needed
};

export default apiService;