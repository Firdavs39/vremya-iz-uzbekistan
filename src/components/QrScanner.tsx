
import React, { useState, useEffect, useRef } from "react";
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
import { Loader, QrCode, Camera, ScanQrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const QrScanner: React.FC = () => {
  const { user } = useAuth();
  const { locations, startShift, endShift, getActiveShift, checkLocationProximity } = useData();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState(user ? getActiveShift(user.id) : undefined);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mockQrDetected, setMockQrDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      setActiveShift(getActiveShift(user.id));
    }
    
    return () => {
      if (scannerIntervalRef.current) {
        window.clearInterval(scannerIntervalRef.current);
      }
      stopCamera();
    };
  }, [user, getActiveShift]);

  const startCamera = async () => {
    try {
      setError(null);
      setMessage(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // If MediaDevices API is not available, use mock mode
        simulateScan();
        return;
      }
      
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };
      
      console.log("Requesting camera access with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(err => {
          console.error("Camera access error:", err);
          // If camera access fails, use mock mode
          simulateScan();
          throw err;
        });
      
      if (!stream) return; // Stream will be undefined if we caught an error above
      
      console.log("Camera access granted, stream:", stream);
      
      if (!videoRef.current) {
        console.error("Video ref is null");
        setError(t("videoElementNotFound"));
        simulateScan();
        return;
      }
      
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, starting QR scanning");
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setScanning(true);
            startQrScanning();
          }).catch(err => {
            console.error("Error playing video:", err);
            setError(t("cameraPlaybackFailed"));
            simulateScan();
          });
        }
      };
    } catch (err) {
      console.error("Camera access error:", err);
      setError(t("cameraAccessDenied"));
      toast({
        title: t("error"),
        description: t("cameraAccessDenied"),
        variant: "destructive",
      });
      // Continue with mock scanning
      simulateScan();
    }
  };

  // Function to simulate QR scanning when camera is not available
  const simulateScan = () => {
    setMessage(t("simulatingQrScan"));
    setScanning(true);
    setMockQrDetected(true);
    
    // Simulate finding QR after 2 seconds
    setTimeout(() => {
      processQrCode("location:1");
    }, 2000);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
      
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    setMockQrDetected(false);
    
    if (scannerIntervalRef.current) {
      window.clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
  };

  const startQrScanning = () => {
    if (scannerIntervalRef.current) {
      window.clearInterval(scannerIntervalRef.current);
    }

    scannerIntervalRef.current = window.setInterval(() => {
      captureQrCode();
    }, 500) as unknown as number;
  };

  const captureQrCode = () => {
    if (mockQrDetected) return; // Skip if we're using mock mode
    
    if (!videoRef.current || !canvasRef.current) return;
    
    // Wait for video to be ready
    if (!videoRef.current.videoWidth) {
      console.log("Video not ready yet");
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real app, we would use a QR scanner library like jsQR
    // For mock purposes, we'll simulate finding a QR code after 2 seconds
    setTimeout(() => {
      processQrCode("location:1");
    }, 2000);
  };

  const processQrCode = async (qrData: string) => {
    if (!user || !qrData.startsWith('location:')) return;
    
    stopCamera();
    setError(null);
    setMessage(t("qrDetected"));
    
    try {
      const locationId = qrData.replace('location:', '');
      const location = locations.find(l => l.id === locationId);
      
      if (!location) {
        throw new Error(t("invalidQrCode"));
      }
      
      // If ending shift, no need to check location
      if (activeShift) {
        setLoading(true);
        await endShift(user.id);
        setActiveShift(undefined);
        toast({
          title: t("success"),
          description: t("shiftEnded"),
        });
        return;
      }
      
      // For starting shift, check geolocation
      setGettingLocation(true);
      setMessage(t("checkingLocation"));
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if within allowed radius
          const inRange = checkLocationProximity(locationId, latitude, longitude);
          
          if (!inRange) {
            setError(t("outOfRange"));
            setGettingLocation(false);
            toast({
              title: t("error"),
              description: t("outOfRange"),
              variant: "destructive",
            });
            return;
          }
          
          // Start shift
          setLoading(true);
          await startShift(user.id, locationId);
          setActiveShift(getActiveShift(user.id));
          toast({
            title: t("success"),
            description: t("shiftStarted"),
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(t("locationAccessDenied"));
          setGettingLocation(false);
          toast({
            title: t("error"),
            description: t("locationAccessDenied"),
            variant: "destructive",
          });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: t("error"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGettingLocation(false);
    }
  };
  
  const handleScan = () => {
    if (activeShift) {
      // For ending shift, we can just process directly without scanning again
      handleEndShift();
    } else {
      // For starting shift, start scanning
      setError(null);
      setMessage(null);
      startCamera();
    }
  };
  
  const handleEndShift = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await endShift(user.id);
      setActiveShift(undefined);
      toast({
        title: t("success"),
        description: t("shiftEnded"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: t("error"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <div className="relative bg-gray-100 w-full h-64 flex items-center justify-center rounded-lg overflow-hidden">
            {!mockQrDetected && (
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                playsInline 
                muted
              />
            )}
            <div className="absolute inset-0 border-2 border-dashed border-primary opacity-70 pointer-events-none z-10" />
            <ScanQrCode className="absolute text-primary opacity-50" size={120} />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="bg-gray-100 w-full h-64 flex flex-col items-center justify-center rounded-lg">
            {gettingLocation ? (
              <>
                <Loader className="animate-spin h-10 w-10 mb-2 text-primary" />
                <p>{t("checkingLocation")}</p>
              </>
            ) : (
              <>
                <QrCode size={80} className="text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  {activeShift ? t("clickToEndShift") : t("clickToScanQR")}
                </p>
              </>
            )}
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {message && !error && (
          <Alert className="w-full">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${activeShift ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
          <p>
            {t("currentStatus")}: <span className={activeShift ? "text-green-500" : "text-red-500"}>
              {activeShift ? t("active") : t("inactive")}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScan} 
          disabled={scanning || loading || gettingLocation}
          className="w-full"
          variant={activeShift ? "destructive" : "default"}
        >
          {(loading || gettingLocation) ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {activeShift ? t("endShift") : t("startShift")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QrScanner;
