import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Basic selectors
export const selectcars = (state: RootState) => state.car.Cars;
export const selectSelectedCar = (state: RootState) => state.car.selectedCar;
export const selectCarsLoading = (state: RootState) => state.car.loading;
export const selectBookings = (state: RootState) => state.bookings.bookings;
export const selectCustomers = (state: RootState) => state.customers.customers;
export const selectFinance = (state: RootState) => state.finance;
export const selectStaff = (state: RootState) => state.staff.staff;
export const selectActiveCustomers = createSelector(
  [selectCustomers],
  (customers) => customers.filter((c) => c.status === "active"),
);
export const selectSuspendedCustomers = (state: RootState) =>
  state.customers.customers.filter(
    (customer) => customer.status === "suspended",
  );
export const selectCustomerById = (customerId: string) => (state: RootState) =>
  state.customers.customers.find((customer) => customer.id === customerId);
export const selectCustomerStats = (state: RootState) => state.customers.stats;
export const selectCustomerFilters = (state: RootState) =>
  state.customers.filters;

// Car-related selectors
export const selectCarById = (carId: string) => (state: RootState) =>
  state.car.Cars.find((car) => car.id === carId);

export const selectBookingsByCarId = (carId: string) => (state: RootState) =>
  state.bookings.bookings.filter((booking) => booking.CarId === carId);

export const selectCompletedBookingsByCarId =
  (carId: string) => (state: RootState) =>
    state.bookings.bookings.filter(
      (booking) => booking.CarId === carId && booking.status === "completed",
    );

export const selectActiveBookingsByCarId =
  (carId: string) => (state: RootState) =>
    state.bookings.bookings.filter(
      (booking) =>
        booking.CarId === carId &&
        ["pending", "confirmed"].includes(booking.status),
    );

// Memoized selectors
export const selectAvailablecars = createSelector([selectcars], (cars) =>
  cars.filter((car) => car.status === "available"),
);

export const selectActiveBookings = createSelector(
  [selectBookings],
  (bookings) =>
    bookings.filter((booking) =>
      ["pending", "confirmed"].includes(booking.status),
    ),
);

export const selectDrivers = createSelector([selectStaff], (staff) =>
  staff.filter(
    (member) =>
      member.role.toLowerCase().includes("driver") ||
      member.department.toLowerCase().includes("operations"),
  ),
);

// Memoized selectors
export const selectFilteredCustomers = createSelector(
  [selectCustomers, (state: RootState) => state.customers.filters],
  (customers, filters) => {
    return customers.filter((customer) => {
      // Filter by status
      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }

      // Filter by loyalty tier
      if (
        filters.loyaltyTier !== "all" &&
        customer.loyaltyTier !== filters.loyaltyTier
      ) {
        return false;
      }

      // Filter by minimum bookings
      if (customer.totalBookings < filters.minBookings) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone.includes(filters.searchTerm) ||
          customer.ghanaCardId.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });
  },
);

export const selectCustomerLoyaltyTiers = createSelector(
  [selectCustomers],
  (customers) => {
    const tiers = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    customers.forEach((customer) => {
      tiers[customer.loyaltyTier] += 1;
    });

    return tiers;
  },
);

export const selectTopSpendingCustomers = createSelector(
  [selectCustomers],
  (customers) => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  },
);

export const selectDashboardMetrics = createSelector(
  [selectcars, selectBookings, selectCustomers, selectStaff],
  (cars, bookings, customers, staff) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Helper: check if booking's start date falls in given month/year
    const isBookingInMonth = (booking: any, month: number, year: number) => {
      const d = new Date(booking.startDate);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    // Current month bookings
    const currentMonthBookings = bookings.filter(b => isBookingInMonth(b, currentMonth, currentYear)).length;

    // Previous month bookings
    const previousMonthBookings = bookings.filter(b => isBookingInMonth(b, previousMonth, previousMonthYear)).length;

    // Monthly bookings for current year (Jan-Dec)
    const monthlyBookings = Array(12).fill(0).map((_, idx) => {
      return bookings.filter(b => {
        const d = new Date(b.startDate);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      }).length;
    });

    // Monthly revenue for current year (only completed bookings)
    const monthlyRevenue = Array(12).fill(0).map((_, idx) => {
      return bookings
        .filter(b => {
          const d = new Date(b.startDate);
          return d.getMonth() === idx && d.getFullYear() === currentYear && b.status === 'completed';
        })
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    });

    // Total customers
    const totalCustomers = customers.length;

    // Total drivers (role === 'driver')
    const totalDrivers = staff.filter(s => s.role?.toLowerCase() === 'driver').length;

    // Fleet status counts by car status
    const carStatusCounts = {
      available: cars.filter(c => c.status === 'available').length,
      rented: cars.filter(c => c.status === 'rented').length,
      maintenance: cars.filter(c => c.status === 'maintenance').length,
      insurance_expired: cars.filter(c => c.status === 'insurance_expired').length,
      accident: cars.filter(c => c.status === 'accident').length,
      retired: cars.filter(c => c.status === 'retired').length,
    };

    return {
      totalCars: cars.length,
      totalCustomers,
      totalDrivers,
      currentMonthBookings,
      previousMonthBookings,
      monthlyBookings,
      monthlyRevenue,
      carStatusCounts,
    };
  }
);
export const selectCarStats = createSelector(
  [
    selectSelectedCar,
    selectBookings,
    (state: RootState) => state.maintenance?.records || [],
    (state: RootState) => state.insurance?.policies || [],
  ],
  (selectedCar, bookings) => {
    if (!selectedCar) return null;

    const carBookings = bookings.filter((b) => b.CarId === selectedCar.id);
    const completedBookings = carBookings.filter(
      (b) => b.status === "completed",
    );

    // Minimal computation - these should ideally come from backend
    return {
      totalBookings: carBookings.length,
      completedBookings: completedBookings.length,
      utilizationRate: 0, // Should come from backend
      totalRevenue: 0, // Should come from backend
      maintenanceCosts: 0, // Should come from backend
      hasActiveInsurance: false, // Should come from backend
      lastMaintenance: null, // Should come from backend
      upcomingBookings: carBookings.filter(
        (b) =>
          ["pending", "confirmed"].includes(b.status) &&
          new Date(b.startDate) > new Date(),
      ).length,
    };
  },
);

export const selectCarDetails = createSelector(
  [
    selectSelectedCar,
    (state: RootState) => state.car.loading,
    selectBookings,
    (state: RootState) => state.maintenance.records,
    (state: RootState) => state.insurance.policies,
    selectCarStats,
  ],
  (
    selectedCar,
    loading,
    bookings,
    maintenanceRecords,
    insurancePolicies,
    stats,
  ) => {
    if (!selectedCar) return null;

    const carBookings = bookings.filter((b) => b.CarId === selectedCar.id);
    const carMaintenance = maintenanceRecords.filter(
      (r) => r.vehicleId === selectedCar.id,
    );
    const carInsurance = insurancePolicies.filter(
      (p) => p.vehicleId === selectedCar.id,
    );

    return {
      car: selectedCar,
      loading,
      bookings: carBookings,
      maintenanceRecords: carMaintenance,
      insurancePolicies: carInsurance,
      stats: stats || {
        totalBookings: 0,
        completedBookings: 0,
        utilizationRate: 0,
        totalRevenue: 0,
        maintenanceCosts: 0,
        hasActiveInsurance: false,
        lastMaintenance: null,
        upcomingBookings: 0,
      },
    };
  },
);

// Get maintenance status from backend (if needed for filtering)
export const selectCarsInMaintenance = createSelector([selectcars], (cars) =>
  cars.filter((car) => car.status === "maintenance"),
);

export const selectRentedCars = createSelector([selectcars], (cars) =>
  cars.filter((car) => car.status === "rented"),
);

export const selectRetiredCars = createSelector([selectcars], (cars) =>
  cars.filter((car) => car.status === "retired"),
);

// Minimal frontend computation - just counting
export const selectCarsStats = createSelector(
  [
    selectcars,
    selectAvailablecars,
    selectCarsInMaintenance,
    selectRentedCars,
    selectRetiredCars,
  ],
  (cars, availableCars, maintenanceCars, rentedCars, retiredCars) => {
    return {
      total: cars.length,
      available: availableCars.length,
      rented: rentedCars.length,
      maintenance: maintenanceCars.length,
      retired: retiredCars.length,
    };
  },
);

// Simple search filter - minimal computation
export const selectFilteredCars = createSelector(
  [
    selectcars,
    (state: RootState, searchTerm: string) => searchTerm,
    (state: RootState, searchTerm: string, statusFilter: string) =>
      statusFilter,
  ],
  (cars, searchTerm, statusFilter) => {
    if (!searchTerm && statusFilter === "all") return cars;

    return cars.filter((car) => {
      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus =
        statusFilter === "all" || car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  },
);

export const selectAllBookingsWithDetails = createSelector(
  [selectBookings, selectcars, selectCustomers],
  (bookings, cars, customers) => {
    return bookings
      .map((booking) => {
        const carId = booking.CarId;
        const customerId = booking.customerId;
        const car = cars.find((c) => c.id === carId);
        const customer = customers.find((c) => c.id === customerId);
              // Calculate duration
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const durationDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          ...booking,
          carId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown Customer",
          customerEmail: customer?.email || "N/A",
          customerPhone: customer?.phone || "N/A",

          // Car details
          car: car || null,
          carMake: car?.make || "Unknown",
          carModel: car?.model || "Unknown",
          carYear: car?.year || "N/A",
          carlicense_plate: car?.license_plate || "N/A",
          carColor: car?.color || "N/A",

          // Computed fields
          durationDays,
          formattedDates: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,

          // Status with colors
          statusColor:
            booking.status === "completed"
              ? "green"
              : booking.status === "confirmed"
                ? "blue"
                : booking.status === "pending"
                  ? "yellow"
                  : "red",
        };
      })
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
  },
);

export const selectBookingStats = createSelector(
  [selectBookings],
  (bookings) => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      totalRevenue: bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + b.totalAmount, 0),
    };
  },
);
