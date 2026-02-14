export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  department: string;
  role: string;
  joinDate: string;
  status: "active" | "inactive" | "on_leave" | "terminated";
  salary: number;
  employmentType: string;
  shift: string;
  permissions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: {
    idProof: string;
    addressProof: string;
    contract: string;
  };
  performance: {
    rating: number;
    lastReview: string;
    notes: string;
  };
  // Additional backend fields
  driverLicenseId?: string;
  driverLicenseClass?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface SalaryPayment {
  id: string;
  staff: string;
  staffName?: string;
  staffRole?: string;
  month: string;
  basicSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
}