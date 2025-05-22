
import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

// In a real app, use a proper QR code library
const QrGenerator: React.FC<{ value: string; name: string }> = ({ value, name }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Mock function to simulate a QR code
  // In a real app, actually generate a QR code with a proper library
  const mockQrCode = (
    <div className="w-48 h-48 border-2 bg-white p-2 mx-auto">
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-center">
        {value}
        <br />
        (Mock QR Code)
      </div>
    </div>
  );

  const downloadQr = () => {
    // In a real application, use a library to generate and download QR code
    alert(`Downloaded QR code for ${name}: ${value}`);
  };

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        <div ref={qrRef} className="mb-4">
          {mockQrCode}
        </div>
        <p className="text-sm font-medium">{name}</p>
        <Button onClick={downloadQr} variant="outline" size="sm">
          {t("download")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QrGenerator;
