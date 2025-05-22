
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminShiftControl: React.FC = () => {
  const { t } = useLanguage();
  const { employees, locations, startShift, endShift, getActiveShift } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const employeeOptions = employees.filter(e => e.role === "employee");
  const activeShift = selectedEmployee ? getActiveShift(selectedEmployee) : undefined;

  const handleStartShift = async () => {
    if (!user || !selectedEmployee || !selectedLocation) return;
    
    setLoading(true);
    try {
      await startShift(selectedEmployee, selectedLocation, true, user.id);
      toast({
        title: t("success"),
        description: `${t("startShift")} ${t("success")}`,
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!user || !selectedEmployee) return;
    
    setLoading(true);
    try {
      await endShift(selectedEmployee, true, user.id);
      toast({
        title: t("success"),
        description: `${t("endShift")} ${t("success")}`,
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("manualShiftControl")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label>{t("selectEmployee")}</label>
          <Select
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectEmployee")} />
            </SelectTrigger>
            <SelectContent>
              {employeeOptions.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployee && !activeShift && (
          <div className="space-y-2">
            <label>{t("selectLocation")}</label>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectLocation")} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedEmployee && (
          <div className="pt-2">
            {activeShift ? (
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleEndShift}
                disabled={loading}
              >
                {loading ? t("loading") : `${t("endShift")} ${t("for")} ${employeeOptions.find(e => e.id === selectedEmployee)?.name}`}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleStartShift}
                disabled={loading || !selectedLocation}
              >
                {loading ? t("loading") : `${t("startShift")} ${t("for")} ${employeeOptions.find(e => e.id === selectedEmployee)?.name}`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminShiftControl;
