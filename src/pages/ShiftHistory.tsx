
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru, uz } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Shift } from "@/types";
import LanguageToggle from "@/components/LanguageToggle";

const ShiftHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { shifts, locations, employees } = useData();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Filter shifts by user and date
  const userShifts = shifts.filter((shift) => {
    // If admin, show all shifts or filter by date
    // If employee, only show their shifts
    const isUserShift = isAdmin() || shift.employeeId === user.id;
    
    // Filter by selected date if date is provided
    if (date) {
      const shiftDate = new Date(shift.startTime);
      return isUserShift && 
             shiftDate.getFullYear() === date.getFullYear() &&
             shiftDate.getMonth() === date.getMonth() &&
             shiftDate.getDate() === date.getDate();
    }
    
    return isUserShift;
  });
  
  // Sort shifts by start time (newest first)
  const sortedShifts = [...userShifts].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  // Format time function
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", {
      locale: language === "ru" ? ru : uz
    });
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", {
      locale: language === "ru" ? ru : uz
    });
  };
  
  // Calculate duration between start and end time
  const calculateDuration = (shift: Shift) => {
    const start = new Date(shift.startTime);
    const end = shift.endTime ? new Date(shift.endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs.toFixed(2);
  };

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : t("unknownLocation");
  };
  
  // Get employee name by ID (only for admin)
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : t("unknownEmployee");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">{t("shiftHistory")}</h1>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <div className="text-sm text-gray-600">
                {user.name} ({t(user.role)})
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("shiftHistory")}</CardTitle>
                <CardDescription>
                  {date ? formatDate(date.toISOString()) : t("allDates")}
                </CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {t("selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin() && <TableHead>{t("employee")}</TableHead>}
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("startTime")}</TableHead>
                  <TableHead>{t("endTime")}</TableHead>
                  <TableHead>{t("duration")} (ч)</TableHead>
                  <TableHead>{t("location")}</TableHead>
                  <TableHead>{t("manuallyCreated")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedShifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      {t("noShiftsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      {isAdmin() && <TableCell>{getEmployeeName(shift.employeeId)}</TableCell>}
                      <TableCell>{formatDate(shift.startTime)}</TableCell>
                      <TableCell>{formatTime(shift.startTime)}</TableCell>
                      <TableCell>
                        {shift.endTime ? formatTime(shift.endTime) : t("ongoing")}
                      </TableCell>
                      <TableCell>{calculateDuration(shift)}</TableCell>
                      <TableCell>{getLocationName(shift.locationId)}</TableCell>
                      <TableCell>
                        {shift.manuallyCreated ? t("yes") : t("no")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ShiftHistory;
