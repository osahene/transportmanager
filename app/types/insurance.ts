export type InsuranceStatus = 'active' | 'expired' | 'pending' | 'cancelled';
export type CoverageType = 'comprehensive' | 'third_party' | 'third_party_fire_and_theft';

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  provider: string;
  policyNumber: string;
  coverageType: CoverageType;
  startDate: string;
  endDate: string;
  premium: number;
  status: InsuranceStatus;
  createdAt: string;
  updatedAt: string;
}