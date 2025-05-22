
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { Map, MapPin } from 'lucide-react';

interface LocationMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelected: (lat: number, lng: number) => void;
  mapboxToken?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  initialLatitude = 55.7558,
  initialLongitude = 37.6176,
  onLocationSelected,
  mapboxToken,
}) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState<string>(mapboxToken || localStorage.getItem('mapbox_token') || '');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [manualLatitude, setManualLatitude] = useState<string>(initialLatitude.toString());
  const [manualLongitude, setManualLongitude] = useState<string>(initialLongitude.toString());
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: initialLatitude,
    lng: initialLongitude,
  });
  const [mapView, setMapView] = useState<boolean>(true);

  const initializeMap = (accessToken: string) => {
    if (!mapContainer.current) return;
    
    try {
      mapboxgl.accessToken = accessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [coordinates.lng, coordinates.lat],
        zoom: 13,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      // Add marker on initial position
      marker.current = new mapboxgl.Marker({ draggable: true, color: '#FF0000' })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map.current);

      // Update coordinates when marker is dragged
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          updateCoordinates(lngLat.lat, lngLat.lng);
        }
      });

      // Add click handler to move marker
      map.current.on('click', (e) => {
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          updateCoordinates(e.lngLat.lat, e.lngLat.lng);
        }
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
    }
  };

  useEffect(() => {
    if (token && !map.current) {
      initializeMap(token);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [token]);

  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput);
      setToken(tokenInput);
    }
  };

  const updateCoordinates = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setManualLatitude(lat.toFixed(6));
    setManualLongitude(lng.toFixed(6));
  };

  const handleManualCoordinateChange = () => {
    try {
      const lat = parseFloat(manualLatitude);
      const lng = parseFloat(manualLongitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error(t("invalidCoordinates"));
      }

      updateCoordinates(lat, lng);

      // Also update the marker and map position if map is loaded
      if (map.current && marker.current) {
        marker.current.setLngLat([lng, lat]);
        map.current.flyTo({ center: [lng, lat] });
      }
    } catch (error) {
      console.error('Invalid coordinates:', error);
    }
  };

  const handleSelectLocation = () => {
    onLocationSelected(coordinates.lat, coordinates.lng);
  };

  const toggleView = () => {
    setMapView(!mapView);
  };

  if (!token) {
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <h3 className="text-lg font-medium mb-4">{t("mapboxTokenRequired")}</h3>
        <p className="mb-4 text-sm text-gray-600">
          {t("mapboxTokenDescription")}
        </p>
        <form onSubmit={handleSubmitToken} className="space-y-4">
          <div>
            <Label htmlFor="mapbox-token">{t("mapboxToken")}</Label>
            <Input
              id="mapbox-token"
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full mt-1"
              placeholder="pk.eyJ1IjoieW91..."
              required
            />
          </div>
          <Button type="submit">{t("saveToken")}</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("selectLocation")}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleView}
        >
          {mapView ? 
            <><Input className="h-4 w-4 mr-2" /> {t("manualCoordinates")}</> : 
            <><Map className="h-4 w-4 mr-2" /> {t("mapView")}</>
          }
        </Button>
      </div>

      {mapView ? (
        <div 
          ref={mapContainer} 
          className="w-full h-[400px] rounded-md border shadow-sm"
          aria-label={t("locationMap")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="latitude">{t("latitude")}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={manualLatitude}
                onChange={(e) => setManualLatitude(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="longitude">{t("longitude")}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={manualLongitude}
                onChange={(e) => setManualLongitude(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Button onClick={handleManualCoordinateChange} className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            {t("updateCoordinates")}
          </Button>
        </div>
      )}
      
      <div className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t("latitude")}</Label>
            <div className="text-sm font-medium">{coordinates.lat.toFixed(6)}</div>
          </div>
          <div>
            <Label>{t("longitude")}</Label>
            <div className="text-sm font-medium">{coordinates.lng.toFixed(6)}</div>
          </div>
        </div>
        
        <Button 
          onClick={handleSelectLocation} 
          disabled={!mapLoaded && mapView}
          className="mt-2"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {t("useThisLocation")}
        </Button>
      </div>
    </div>
  );
};

export default LocationMap;
