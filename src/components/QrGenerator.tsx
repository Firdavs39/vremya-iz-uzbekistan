
import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Download } from "lucide-react";

// Функция для создания QR-кода (в реальном приложении использовалась бы QR-библиотека)
const generateQrCode = (canvas: HTMLCanvasElement, value: string) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Очистить холст
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // В реальном приложении здесь использовалась бы библиотека для генерации QR-кода
  // Здесь мы создаем более реалистичную имитацию QR-кода
  ctx.fillStyle = "#000000";
  
  // Нарисовать рамку
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  // Нарисовать имитацию QR-модулей
  const moduleSize = 8;
  const margin = 20;
  const modules = 16; // 16x16 модулей для более детального QR
  
  // Создаем фиксированный паттерн для одинакового QR кода
  const hashValue = simpleHash(value);
  const random = seedRandom(hashValue);
  
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      // Рисуем фиксированные угловые маркеры (как в настоящих QR-кодах)
      const isTopLeftCorner = (i < 3 && j < 3);
      const isTopRightCorner = (i >= modules - 3 && j < 3);
      const isBottomLeftCorner = (i < 3 && j >= modules - 3);
      const isCornerMarker = isTopLeftCorner || isTopRightCorner || isBottomLeftCorner;
      
      if (isCornerMarker) {
        // Создаем маркеры позиционирования как в настоящем QR коде
        const isOuterFrame = i === 0 || i === 2 || j === 0 || j === 2 || 
                             i === modules - 1 || i === modules - 3 || j === modules - 1 || j === modules - 3;
        
        if (isOuterFrame || (i === 1 && j === 1) || 
            (i === modules - 2 && j === 1) || 
            (i === 1 && j === modules - 2)) {
          ctx.fillRect(
            margin + i * moduleSize, 
            margin + j * moduleSize, 
            moduleSize, 
            moduleSize
          );
        }
      } else {
        // Остальные модули генерируем с помощью псевдослучайной функции с сидом
        const shouldFill = random() > 0.5;
        if (shouldFill) {
          ctx.fillRect(
            margin + i * moduleSize, 
            margin + j * moduleSize, 
            moduleSize, 
            moduleSize
          );
        }
      }
    }
  }
  
  // Добавить текст с значением QR-кода в нижней части
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(value, canvas.width / 2, canvas.height - 6);
};

// Простая хеш-функция для генерации числа на основе строки
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Простой псевдослучайный генератор с сидом
const seedRandom = (seed: number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

const QrGenerator: React.FC<{ value: string; name: string }> = ({ value, name }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (qrRef.current) {
      generateQrCode(qrRef.current, value);
    }
  }, [value]);

  const downloadQr = () => {
    if (qrRef.current) {
      // Создаем временную ссылку для скачивания
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
