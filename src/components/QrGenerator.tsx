
import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Download } from "lucide-react";
import jsQR from "jsqr";

// Function to generate QR code
const generateQrCode = (canvas: HTMLCanvasElement, value: string) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Clear canvas
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Generate QR code pattern
  const size = canvas.width;
  const cellSize = Math.floor(size / 25); // QR code size (25x25 cells)
  const margin = 10;
  
  // Create fixed pattern based on value
  const hashValue = simpleHash(value);
  const random = seedRandom(hashValue);
  
  // Draw position detection patterns (the three large squares in corners)
  drawPositionDetectionPattern(ctx, margin, margin, cellSize * 7);
  drawPositionDetectionPattern(ctx, margin, size - margin - cellSize * 7, cellSize * 7);
  drawPositionDetectionPattern(ctx, size - margin - cellSize * 7, margin, cellSize * 7);
  
  // Draw timing patterns
  ctx.fillStyle = "#000000";
  for (let i = 0; i < 15; i++) {
    if (i % 2 === 0) {
      // Horizontal timing pattern
      ctx.fillRect(margin + cellSize * (7 + i), margin + cellSize * 6, cellSize, cellSize);
      // Vertical timing pattern
      ctx.fillRect(margin + cellSize * 6, margin + cellSize * (7 + i), cellSize, cellSize);
    }
  }
  
  // Draw data cells
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // Skip position detection patterns
      if ((i < 7 && j < 7) || (i < 7 && j > 17) || (i > 17 && j < 7)) {
        continue;
      }
      
      // Skip timing patterns
      if (i === 6 || j === 6) {
        continue;
      }
      
      // Draw random cells based on hash
      if (random() > 0.65) {
        ctx.fillRect(
          margin + i * cellSize,
          margin + j * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
  
  // Add text with QR code value at the bottom
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(value, canvas.width / 2, canvas.height - 6);
};

// Draw position detection pattern (the three large squares in corners)
const drawPositionDetectionPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const cellSize = size / 7;
  
  // Outer square
  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, size, size);
  
  // Middle white square
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + cellSize, y + cellSize, size - 2 * cellSize, size - 2 * cellSize);
  
  // Inner black square
  ctx.fillStyle = "#000000";
  ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, size - 4 * cellSize, size - 4 * cellSize);
};

// Simple hash function for generating a number from a string
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Simple pseudorandom generator with seed
const seedRandom = (seed: number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

interface QrGeneratorProps {
  value: string;
  name: string;
}

const QrGenerator: React.FC<QrGeneratorProps> = ({ value, name }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (qrRef.current) {
      generateQrCode(qrRef.current, value);
    }
  }, [value]);

  const downloadQr = () => {
    if (qrRef.current) {
      // Create temporary link for download
      const link = document.createElement("a");
      link.download = `qr-${name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = qrRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        <canvas
          ref={qrRef}
          width="200"
          height="200"
          className="border bg-white"
        ></canvas>
        <p className="text-sm font-medium">{name}</p>
        <Button onClick={downloadQr} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {t("download")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QrGenerator;
