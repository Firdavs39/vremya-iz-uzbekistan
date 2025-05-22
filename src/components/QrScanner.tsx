
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "lucide-react";

// For a real application, import a proper QR scanner library
// For this demo, we'll simulate QR scanning
const mockScanQRCode = () => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve("location:1");
    }, 1500);
  });
};

const mockGetGeolocation = () => {
  return new Promise<{ latitude: number; longitude: number }>((resolve) => {
    setTimeout(() => {
      resolve({ latitude: 55.7558, longitude: 37.6176 }); // Coordinates close to the mock office
    }, 1000);
  });
};

const QrScanner: React.FC = () => {
  const { user } = useAuth();
  const { locations, startShift, endShift, getActiveShift, checkLocationProximity } = useData();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState(user ? getActiveShift(user.id) : undefined);

  useEffect(() => {
    if (user) {
      setActiveShift(getActiveShift(user.id));
    }
  }, [user, getActiveShift]);

  const handleScan = async () => {
    if (!user) return;
    
    setScanning(true);
    setError(null);
    
    try {
      if (activeShift) {
        // End shift
        setLoading(true);
        await endShift(user.id);
        setActiveShift(undefined);
        toast({
          title: t("success"),
          description: t("endShift") + " " + t("success"),
        });
      } else {
        // Start shift - scan QR and check location
        const locationCode = await mockScanQRCode();
        const locationId = locationCode.replace("location:", "");
        const location = locations.find((l) => l.id === locationId);
        
        if (!location) {
          throw new Error("Invalid QR code");
        }
        
        // Get user's current geolocation
        const { latitude, longitude } = await mockGetGeolocation();
        
        // Check if user is within allowed radius
        const inRange = checkLocationProximity(locationId, latitude, longitude);
        
        if (!inRange) {
          throw new Error(t("outOfRange"));
        }
        
        // Start shift
        setLoading(true);
        await startShift(user.id, locationId);
        setActiveShift(getActiveShift(user.id));
        toast({
          title: t("success"),
          description: t("startShift") + " " + t("success"),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: t("error"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t("scanQrCode")}</CardTitle>
        <CardDescription>
          {activeShift ? t("endShift") : t("startShift")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {scanning ? (
          <div className="bg-gray-100 w-full h-64 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <Loader className="animate-spin h-10 w-10 mx-auto mb-2" />
              <p>{t("scannerInstructions")}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 w-full h-64 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">{t("scanQrCode")}</p>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
          <p>
            {t("currentStatus")}:{" "}
            <span className={activeShift ? "text-green-500" : "text-red-500"}>
              {activeShift ? t("active") : t("inactive")}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScan} 
          disabled={scanning || loading}
          className="w-full"
          variant={activeShift ? "destructive" : "default"}
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {activeShift ? t("endShift") : t("startShift")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QrScanner;
