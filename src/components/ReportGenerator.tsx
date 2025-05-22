
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Report } from "@/types";

const ReportGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { employees, generateReport } = useData();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = () => {
    setLoading(true);
    try {
      const generatedReport = generateReport(
        startDate, 
        endDate, 
        reportType, 
        selectedEmployee || undefined
      );
      
      setReport(generatedReport);
      
      toast({
        title: t("success"),
        description: t("reportGenerated"),
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

  const handleExportCSV = () => {
    if (!report) return;

    const csvContent = [
      ["Date", "Employee", "Hours Worked", "Earnings"].join(","),
      ...report.data.map(row => 
        [
          row.date, 
          row.employeeName, 
          row.hoursWorked.toFixed(2), 
          row.earnings.toFixed(2)
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `report-${report.startDate}-${report.endDate}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalHours = () => {
    if (!report) return 0;
    return report.data.reduce((sum, row) => sum + row.hoursWorked, 0).toFixed(2);
  };

  const getTotalEarnings = () => {
    if (!report) return 0;
    return report.data.reduce((sum, row) => sum + row.earnings, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("generateReport")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("reportType")}</Label>
              <Select
                value={reportType}
                onValueChange={(value: "daily" | "weekly" | "monthly") => setReportType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("daily")}</SelectItem>
                  <SelectItem value="weekly">{t("weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("selectEmployee")}</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all")}</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? t("loading") : t("generateReport")}
          </Button>
        </CardFooter>
      </Card>

      {report && report.data.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("reportResults")}</CardTitle>
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              {t("exportCsv")}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("employee")}</TableHead>
                  <TableHead className="text-right">{t("hoursWorked")}</TableHead>
                  <TableHead className="text-right">{t("earnings")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell className="text-right">{row.hoursWorked.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.earnings.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">
                    {t("total")}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {getTotalHours()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {getTotalEarnings()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : report ? (
        <Card>
          <CardContent className="py-4">
            <p className="text-center text-muted-foreground">{t("noData")}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ReportGenerator;
