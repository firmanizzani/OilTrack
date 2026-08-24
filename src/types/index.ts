// ─── Core Entities ──────────────────────────────────────────────────────────

export type VehicleType = 'MOTORCYCLE' | 'CAR';

export type ReminderStatus = 'green' | 'yellow' | 'red';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface ReminderSettings {
  id: number;
  vehicleId: number;
  kmInterval: number;
  monthInterval: number;
}

export interface Vehicle {
  id: number;
  userId: number;
  name: string;
  type: VehicleType;
  licensePlate: string;
  brand: string;
  year: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  oilHistories?: OilHistory[];
  reminderSettings?: ReminderSettings;
  reminderStatus?: ReminderStatus;
}

export interface OilHistory {
  id: number;
  vehicleId: number;
  changeDate: string;
  odometer: number;
  oilType: string;
  price: number;
  workshop: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Pick<Vehicle, 'id' | 'name' | 'licensePlate'>;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface MonthlySpending {
  month: string; // 'YYYY-MM'
  total: number;
}

export interface DashboardVehicle {
  id: number;
  name: string;
  type: VehicleType;
  licensePlate: string;
  brand: string;
  icon?: string;
  lastChangeDate: string | null;
  lastChangeOdometer: number | null;
  reminderStatus: ReminderStatus;
  kmInterval: number;
  monthInterval: number;
}

export interface DashboardData {
  totalVehicles: number;
  totalSpending: number;
  spendingThisMonth: number;
  monthlySpending: MonthlySpending[];
  vehicles: DashboardVehicle[];
  recentHistory: OilHistory[];
}

// ─── Form Payloads ───────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface VehiclePayload {
  name: string;
  type: VehicleType;
  licensePlate: string;
  brand: string;
  year: number;
  icon?: string;
  kmInterval?: number;
  monthInterval?: number;
}

export interface OilHistoryPayload {
  vehicleId: number;
  changeDate: string;
  odometer: number;
  oilType: string;
  price: number;
  workshop: string;
  notes?: string;
}

// ─── Filter/Query Params ─────────────────────────────────────────────────────

export interface OilHistoryFilters {
  vehicleId?: number;
  dateFrom?: string;
  dateTo?: string;
  workshop?: string;
  page?: number;
  limit?: number;
}
