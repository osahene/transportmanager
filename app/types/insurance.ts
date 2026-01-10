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
  deductible?: number;
  status: InsuranceStatus;
  agentName?: string;
  agentContact?: string;
  renewalDate: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}