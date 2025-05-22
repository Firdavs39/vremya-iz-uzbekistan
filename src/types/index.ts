
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  hourlyRate?: number;
  activeShift?: Shift;
}

export interface Shift {
  id: string;
  employeeId: string;
  locationId: string;
  startTime: string;
  endTime?: string;
  manuallyCreated?: boolean;
  manuallyCreatedBy?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  qrCode: string;
}

export interface Report {
  id: string;
  employeeId?: string;
  startDate: string;
  endDate: string;
  type: "daily" | "weekly" | "monthly";
  data: ReportData[];
}

export interface ReportData {
  date: string;
  employeeId: string;
  employeeName: string;
  hoursWorked: number;
  earnings: number;
}
