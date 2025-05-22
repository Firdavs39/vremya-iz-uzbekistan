
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Navigate, Outlet } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import QrScanner from "@/components/QrScanner";
import EmployeeList from "@/components/EmployeeList";
import LocationList from "@/components/LocationList";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import AddLocationForm from "@/components/AddLocationForm";
import AdminShiftControl from "@/components/AdminShiftControl";
import ReportGenerator from "@/components/ReportGenerator";
import LanguageToggle from "@/components/LanguageToggle";

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { getActiveEmployees, getTodayHours, getWeekHours, getActiveShift } = useData();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  const activeEmployees = getActiveEmployees();
  const todayHours = getTodayHours(isAdmin() ? undefined : user.id);
  const weekHours = getWeekHours(isAdmin() ? undefined : user.id);
  const activeShift = user.id ? getActiveShift(user.id) : undefined;

  // Different dashboard layouts for admin and employee
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">{t("dashboard")}</h1>
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
        {/* User stats summary section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isAdmin() ? t("activeEmployees") : t("currentStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin() ? activeEmployees.length : (
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      activeShift ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    {activeShift ? t("active") : t("inactive")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("todaysHours")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayHours.toFixed(2)} {t("hours")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("weeklyHours")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weekHours.toFixed(2)} {t("hours")}
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdmin() ? (
          // Admin dashboard content
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-[500px]">
              <TabsTrigger value="employees">{t("employees")}</TabsTrigger>
              <TabsTrigger value="locations">{t("locations")}</TabsTrigger>
              <TabsTrigger value="shifts">{t("shifts")}</TabsTrigger>
              <TabsTrigger value="reports">{t("reports")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="employees" className="space-y-4">
              <EmployeeList />
              <Separator className="my-6" />
              <AddEmployeeForm />
            </TabsContent>
            
            <TabsContent value="locations" className="space-y-4">
              <LocationList />
              <Separator className="my-6" />
              <AddLocationForm />
            </TabsContent>
            
            <TabsContent value="shifts">
              <AdminShiftControl />
            </TabsContent>
            
            <TabsContent value="reports">
              <ReportGenerator />
            </TabsContent>
          </Tabs>
        ) : (
          // Employee dashboard content
          <div className="space-y-6">
            <QrScanner />
          </div>
        )}
      </main>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
};

export default Dashboard;
