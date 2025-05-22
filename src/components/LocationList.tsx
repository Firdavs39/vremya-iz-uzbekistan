
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
import { Slider } from "@/components/ui/slider";
import { Location } from "@/types";
import QrGenerator from "./QrGenerator";

const LocationList: React.FC = () => {
  const { t } = useLanguage();
  const { locations, updateLocation, deleteLocation } = useData();
  const { toast } = useToast();
  
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [selectedQrLocation, setSelectedQrLocation] = useState<Location | null>(null);
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radius, setRadius] = useState(200);

  const handleShowQr = (location: Location) => {
    setSelectedQrLocation(location);
    setShowQrDialog(true);
  };

  const handleEdit = (location: Location) => {
    setEditLocation(location);
    setName(location.name);
    setAddress(location.address);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setRadius(location.radius);
  };

  const handleSave = () => {
    if (!editLocation) return;

    updateLocation(editLocation.id, {
      name,
      address,
      latitude,
      longitude,
      radius,
    });

    toast({
      title: t("success"),
      description: t("locationUpdated"),
    });

    setEditLocation(null);
  };

  const confirmDelete = (id: string) => {
    setLocationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!locationToDelete) return;

    deleteLocation(locationToDelete);
    setDeleteDialogOpen(false);
    setLocationToDelete(null);

    toast({
      title: t("success"),
      description: t("locationDeleted"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("locations")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("address")}</TableHead>
              <TableHead className="text-right">{t("radius")} (m)</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell className="text-right">{location.radius}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShowQr(location)}
                    >
                      QR
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(location)}
                    >
                      {t("edit")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => confirmDelete(location.id)}
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

      {/* Edit Location Dialog */}
      <Dialog open={editLocation !== null} onOpenChange={(open) => !open && setEditLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editLocation")}</DialogTitle>
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
              <Label htmlFor="edit-address">{t("address")}</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-radius">{t("radius")} (m)</Label>
                <span>{radius} m</span>
              </div>
              <Slider
                id="edit-radius"
                min={50}
                max={500}
                step={10}
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLocation(null)}>
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
            <DialogTitle>{t("deleteLocation")}</DialogTitle>
            <DialogDescription>
              {t("deleteLocationConfirmation")}
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

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("qrCode")}: {selectedQrLocation?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedQrLocation && (
              <QrGenerator value={selectedQrLocation.qrCode} name={selectedQrLocation.name} />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LocationList;
