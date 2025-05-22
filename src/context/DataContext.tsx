
import React, { createContext, useState, useContext, ReactNode } from "react";
import { Employee, Location, Shift, Report } from "../types";
import { useToast } from "../hooks/use-toast";

// Mock initial data
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Админ Администраторов",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Иван Сотрудников",
    email: "employee@example.com",
    role: "employee",
    hourlyRate: 500,
  },
  {
    id: "3",
    name: "Анна Работникова",
    email: "anna@example.com",
    role: "employee",
    hourlyRate: 450,
  },
];

const initialLocations: Location[] = [
  {
    id: "1",
    name: "Головной офис",
    address: "ул. Пушкина 10, Москва",
    latitude: 55.7558,
    longitude: 37.6176,
    radius: 200,
    qrCode: "location:1",
  },
];

const initialShifts: Shift[] = [
  {
    id: "1",
    employeeId: "2",
    locationId: "1",
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endTime: undefined,
  },
];

interface DataContextType {
  employees: Employee[];
  locations: Location[];
  shifts: Shift[];
  reports: Report[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addLocation: (location: Omit<Location, "id" | "qrCode">) => Location;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  startShift: (employeeId: string, locationId: string, manual?: boolean, adminId?: string) => Promise<void>;
  endShift: (employeeId: string, manual?: boolean, adminId?: string) => Promise<void>;
  generateReport: (startDate: string, endDate: string, type: "daily" | "weekly" | "monthly", employeeId?: string) => Report;
  getActiveEmployees: () => Employee[];
  getTodayHours: (employeeId?: string) => number;
  getWeekHours: (employeeId?: string) => number;
  getActiveShift: (employeeId: string) => Shift | undefined;
  checkLocationProximity: (locationId: string, userLat: number, userLng: number) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [reports, setReports] = useState<Report[]>([]);
  const { toast } = useToast();

  // Employee management
  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    };
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, ...employee } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // Location management
  const addLocation = (location: Omit<Location, "id" | "qrCode">) => {
    const id = Date.now().toString();
    const newLocation = {
      ...location,
      id,
      qrCode: `location:${id}`,
    };
    setLocations([...locations, newLocation]);
    return newLocation;
  };

  const updateLocation = (id: string, location: Partial<Location>) => {
    setLocations(locations.map(l => l.id === id ? { ...l, ...location } : l));
  };

  const deleteLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  // Time tracking
  const startShift = async (employeeId: string, locationId: string, manual = false, adminId?: string) => {
    // Check if employee already has active shift
    const activeShift = shifts.find(s => s.employeeId === employeeId && !s.endTime);
    if (activeShift) {
      throw new Error("Сотрудник уже имеет активную смену");
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      employeeId,
      locationId,
      startTime: new Date().toISOString(),
      manuallyCreated: manual,
      manuallyCreatedBy: adminId,
    };

    setShifts([...shifts, newShift]);
    
    // Update employee activeShift reference
    updateEmployee(employeeId, { activeShift: newShift });
  };

  const endShift = async (employeeId: string, manual = false, adminId?: string) => {
    const activeShiftIndex = shifts.findIndex(s => s.employeeId === employeeId && !s.endTime);
    
    if (activeShiftIndex === -1) {
      throw new Error("Активная смена не найдена");
    }

    const updatedShifts = [...shifts];
    updatedShifts[activeShiftIndex] = {
      ...updatedShifts[activeShiftIndex],
      endTime: new Date().toISOString(),
      manuallyCreated: manual ? true : updatedShifts[activeShiftIndex].manuallyCreated,
      manuallyCreatedBy: manual ? adminId : updatedShifts[activeShiftIndex].manuallyCreatedBy,
    };

    setShifts(updatedShifts);
    
    // Remove the activeShift reference from employee
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      updateEmployee(employeeId, { activeShift: undefined });
    }
  };

  // Reports
  const generateReport = (startDate: string, endDate: string, type: "daily" | "weekly" | "monthly", employeeId?: string) => {
    // Filter shifts based on date range and employee if specified
    const filteredShifts = shifts.filter(shift => {
      const shiftStart = new Date(shift.startTime);
      const reportStart = new Date(startDate);
      const reportEnd = new Date(endDate);
      
      const matchesEmployee = employeeId ? shift.employeeId === employeeId : true;
      const matchesDateRange = shiftStart >= reportStart && shiftStart <= reportEnd;
      
      return matchesEmployee && matchesDateRange && shift.endTime;
    });

    // Calculate hours and earnings
    const reportData = filteredShifts.map(shift => {
      const employee = employees.find(e => e.id === shift.employeeId);
      const startTime = new Date(shift.startTime);
      const endTime = shift.endTime ? new Date(shift.endTime) : new Date();
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const earnings = employee?.hourlyRate ? hoursWorked * employee.hourlyRate : 0;

      return {
        date: startTime.toISOString().split('T')[0],
        employeeId: shift.employeeId,
        employeeName: employee?.name || "Unknown",
        hoursWorked,
        earnings
      };
    });

    const report = {
      id: Date.now().toString(),
      startDate,
      endDate,
      type,
      employeeId,
      data: reportData
    };

    setReports([...reports, report]);
    return report;
  };

  // Utility functions
  const getActiveEmployees = () => {
    return employees.filter(employee => 
      shifts.some(shift => shift.employeeId === employee.id && !shift.endTime)
    );
  };

  const getTodayHours = (employeeId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.startTime).toISOString().split('T')[0];
        return shiftDate === today && (employeeId ? shift.employeeId === employeeId : true);
      })
      .reduce((total, shift) => {
        const startTime = new Date(shift.startTime);
        const endTime = shift.endTime ? new Date(shift.endTime) : new Date();
        return total + (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }, 0);
  };

  const getWeekHours = (employeeId?: string) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return shifts
      .filter(shift => {
        const shiftStartTime = new Date(shift.startTime);
        return shiftStartTime >= startOfWeek && 
               (employeeId ? shift.employeeId === employeeId : true);
      })
      .reduce((total, shift) => {
        const startTime = new Date(shift.startTime);
        const endTime = shift.endTime ? new Date(shift.endTime) : new Date();
        return total + (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      }, 0);
  };

  const getActiveShift = (employeeId: string) => {
    return shifts.find(shift => shift.employeeId === employeeId && !shift.endTime);
  };

  const checkLocationProximity = (locationId: string, userLat: number, userLng: number) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return false;

    // Calculate distance between two points using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = location.latitude * Math.PI / 180;
    const φ2 = userLat * Math.PI / 180;
    const Δφ = (userLat - location.latitude) * Math.PI / 180;
    const Δλ = (userLng - location.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= location.radius;
  };

  return (
    <DataContext.Provider value={{
      employees,
      locations,
      shifts,
      reports,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLocation,
      updateLocation,
      deleteLocation,
      startShift,
      endShift,
      generateReport,
      getActiveEmployees,
      getTodayHours,
      getWeekHours,
      getActiveShift,
      checkLocationProximity,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
