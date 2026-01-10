export type MaintenanceType =
  | "routine"
  | "repair"
  | "accident"
  | "inspection"
  | "scheduled_service"
  | "emergency";
export type MaintenanceStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "delayed";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  title: string;
  description: string;
  cost: number;
  garage: string;
  garageContact?: string;
  status: MaintenanceStatus;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate: string;
  notes: string;
  partsUsed?: Array<{
    name: string;
    cost: number;
    quantity: number;
  }>;
  laborCost?: number;
  createdAt: string;
  updatedAt: string;
}
