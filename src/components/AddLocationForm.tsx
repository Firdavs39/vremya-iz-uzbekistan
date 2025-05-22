
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Map } from "lucide-react";
import QrGenerator from "./QrGenerator";
import LocationMap from "./LocationMap";

interface AddLocationFormProps {
  onSuccess?: () => void;
}

const AddLocationForm: React.FC<AddLocationFormProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const { addLocation } = useData();
  const { toast } = useToast();
  const [qrLocation, setQrLocation] = useState<{ id: string; name: string; qrCode: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [mapboxToken, setMapboxToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
      radius: 200,
    },
  });

  const radius = watch("radius");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Load mapbox token from localStorage if available
  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const newLocation = addLocation({
        name: data.name,
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        radius: data.radius,
      });

      toast({
        title: t("success"),
        description: t("addLocation") + " " + t("success"),
      });

      setQrLocation({
        id: newLocation.id,
        name: newLocation.name,
        qrCode: newLocation.qrCode,
      });

      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude);
          setValue("longitude", position.coords.longitude);
          toast({
            title: t("success"),
            description: t("coordinatesObtained"),
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: t("error"),
            description: t("locationError"),
            variant: "destructive",
          });
          
          // Fallback to Moscow coordinates
          setValue("latitude", 55.7558);
          setValue("longitude", 37.6176);
        }
      );
    } else {
      toast({
        title: t("error"),
        description: t("geolocationNotSupported"),
        variant: "destructive",
      });
      
      // Fallback to Moscow coordinates
      setValue("latitude", 55.7558);
      setValue("longitude", 37.6176);
    }
  };

  const handleLocationSelected = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    toast({
      title: t("success"),
      description: t("locationSelected"),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("addLocation")}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("locationName")}</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{t("locationName")} {t("required")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                {...register("address", { required: true })}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{t("address")} {t("required")}</p>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="manual">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("manualCoordinates")}
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  {t("selectOnMap")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">{t("latitude")}</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      {...register("latitude", { required: true, valueAsNumber: true })}
                      className={errors.latitude ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">{t("longitude")}</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      {...register("longitude", { required: true, valueAsNumber: true })}
                      className={errors.longitude ? "border-red-500" : ""}
                    />
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={getCurrentLocation}
                  className="w-full mt-4"
                >
                  {t("useCurrentLocation")}
                </Button>
              </TabsContent>
              
              <TabsContent value="map" className="mt-4">
                <LocationMap 
                  initialLatitude={latitude || 55.7558} 
                  initialLongitude={longitude || 37.6176}
                  onLocationSelected={handleLocationSelected}
                  mapboxToken={mapboxToken}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="radius">{t("radius")} (m)</Label>
                <span>{radius} m</span>
              </div>
              <Slider
                id="radius"
                min={50}
                max={500}
                step={10}
                value={[radius]}
                onValueChange={(value) => setValue("radius", value[0])}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => reset()}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("loading") : t("save")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {qrLocation && (
        <Card>
          <CardHeader>
            <CardTitle>{t("generateQr")}</CardTitle>
          </CardHeader>
          <CardContent>
            <QrGenerator value={qrLocation.qrCode} name={qrLocation.name} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddLocationForm;
