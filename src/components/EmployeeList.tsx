
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from "@/types";

const EmployeeList: React.FC = () => {
  const { t } = useLanguage();
  const { employees, updateEmployee, deleteEmployee } = useData();
  const { toast } = useToast();
  
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  // Sort employees: admins first, then by name
  const sortedEmployees = [...employees].sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return a.name.localeCompare(b.name);
  });

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setRole(employee.role);
    setHourlyRate(employee.hourlyRate || 0);
  };

  const handleSave = () => {
    if (!editEmployee) return;

    updateEmployee(editEmployee.id, {
      name,
      email,
      role,
      hourlyRate: role === "employee" ? hourlyRate : undefined,
    });

    toast({
      title: t("success"),
      description: t("employeeUpdated"),
    });

    setEditEmployee(null);
  };

  const confirmDelete = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!employeeToDelete) return;

    deleteEmployee(employeeToDelete);
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);

    toast({
      title: t("success"),
      description: t("employeeDeleted"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("employees")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead className="text-right">{t("hourlyRate")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <span className={employee.role === "admin" ? "text-brand-700 font-medium" : ""}>
                    {t(employee.role)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {employee.hourlyRate || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      {t("edit")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => confirmDelete(employee.id)}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Employee Dialog */}
      <Dialog open={editEmployee !== null} onOpenChange={(open) => !open && setEditEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editEmployee")}</DialogTitle>
            <DialogDescription>
              {t("updateEmployeeDetails")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("name")}</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t("email")}</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t("role")}</Label>
              <Select
                value={role}
                onValueChange={(value: "admin" | "employee") => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                  <SelectItem value="employee">{t("employee")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {role === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="edit-rate">{t("hourlyRate")}</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmployee(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteEmployee")}</DialogTitle>
            <DialogDescription>
              {t("deleteEmployeeConfirmation")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeeList;
