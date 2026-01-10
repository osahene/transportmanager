export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ghanaCardId: string;
  driverLicenseId?: string;
  occupation: string;
  gpsAddress: string;
  address: CustomerAddress;
  status: "active" | "suspended" | "inactive";
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  totalSpent: number;
  totalBookings: number;
  createdAt: string;
  lastBookingDate?: string;
  notes: Note[];
  guarantor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    ghanaCardId: string;
    occupation: string;
    gpsAddress: string;
    relationship: string;
    address: CustomerAddress;
  };
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}
export interface CustomerAddress {
  locality: string;
  town: string;
  city: string;
  region: string;
  country: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export type NewCustomer = Omit<
  Customer,
  | "id"
  | "createdAt"
  | "totalSpent"
  | "totalBookings"
  | "lastBookingDate"
  | "notes"
> & {
  notes?: Note[]; // Make optional for new customers
};
