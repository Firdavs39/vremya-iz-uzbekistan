
import React, { createContext, useState, useContext, ReactNode } from "react";

type Language = "ru" | "uz";

type Translations = {
  [key: string]: {
    ru: string;
    uz: string;
  };
};

const translations: Translations = {
  login: {
    ru: "Вход",
    uz: "Kirish",
  },
  email: {
    ru: "Электронная почта",
    uz: "Elektron pochta",
  },
  password: {
    ru: "Пароль",
    uz: "Parol",
  },
  rememberMe: {
    ru: "Запомнить меня",
    uz: "Meni eslab qoling",
  },
  loginButton: {
    ru: "Войти",
    uz: "Kirish",
  },
  dashboard: {
    ru: "Панель управления",
    uz: "Boshqaruv paneli",
  },
  employees: {
    ru: "Сотрудники",
    uz: "Xodimlar",
  },
  locations: {
    ru: "Местоположения",
    uz: "Joylashuv",
  },
  reports: {
    ru: "Отчеты",
    uz: "Hisobotlar",
  },
  settings: {
    ru: "Настройки",
    uz: "Sozlamalar",
  },
  logout: {
    ru: "Выйти",
    uz: "Chiqish",
  },
  activeEmployees: {
    ru: "Активные сотрудники",
    uz: "Faol xodimlar",
  },
  totalHoursToday: {
    ru: "Общее время сегодня",
    uz: "Bugun jami soat",
  },
  scanQrCode: {
    ru: "Сканировать QR-код",
    uz: "QR-kodni skanerlash",
  },
  startShift: {
    ru: "Начать смену",
    uz: "Smenani boshlash",
  },
  endShift: {
    ru: "Закончить смену",
    uz: "Smenani tugatish",
  },
  currentStatus: {
    ru: "Текущий статус",
    uz: "Joriy holat",
  },
  active: {
    ru: "Активный",
    uz: "Faol",
  },
  inactive: {
    ru: "Неактивный",
    uz: "Faol emas",
  },
  todaysHours: {
    ru: "Часы сегодня",
    uz: "Bugungi soatlar",
  },
  weeklyHours: {
    ru: "Часы за неделю",
    uz: "Haftalik soatlar",
  },
  addEmployee: {
    ru: "Добавить сотрудника",
    uz: "Xodim qo'shish",
  },
  name: {
    ru: "Имя",
    uz: "Ism",
  },
  role: {
    ru: "Роль",
    uz: "Lavozim",
  },
  hourlyRate: {
    ru: "Почасовая ставка",
    uz: "Soatlik to'lov",
  },
  admin: {
    ru: "Администратор",
    uz: "Administrator",
  },
  employee: {
    ru: "Сотрудник",
    uz: "Xodim",
  },
  save: {
    ru: "Сохранить",
    uz: "Saqlash",
  },
  cancel: {
    ru: "Отмена",
    uz: "Bekor qilish",
  },
  addLocation: {
    ru: "Добавить местоположение",
    uz: "Joylashuv qo'shish",
  },
  locationName: {
    ru: "Название местоположения",
    uz: "Joylashuv nomi",
  },
  address: {
    ru: "Адрес",
    uz: "Manzil",
  },
  radius: {
    ru: "Радиус (м)",
    uz: "Radius (m)",
  },
  generateQr: {
    ru: "Сгенерировать QR",
    uz: "QR yaratish",
  },
  dateRange: {
    ru: "Диапазон дат",
    uz: "Sana oralig'i",
  },
  selectEmployee: {
    ru: "Выбрать сотрудника",
    uz: "Xodimni tanlang",
  },
  generateReport: {
    ru: "Сформировать отчет",
    uz: "Hisobot yaratish",
  },
  export: {
    ru: "Экспорт",
    uz: "Eksport",
  },
  daily: {
    ru: "Ежедневно",
    uz: "Kunlik",
  },
  weekly: {
    ru: "Еженедельно",
    uz: "Haftalik",
  },
  monthly: {
    ru: "Ежемесячно",
    uz: "Oylik",
  },
  locationRequired: {
    ru: "Требуется доступ к местоположению",
    uz: "Joylashuv ruxsati kerak",
  },
  outOfRange: {
    ru: "Вы находитесь вне допустимого радиуса",
    uz: "Siz ruxsat etilgan radius tashqaridasiz",
  },
  success: {
    ru: "Успешно",
    uz: "Muvaffaqiyatli",
  },
  error: {
    ru: "Ошибка",
    uz: "Xatolik",
  },
  welcome: {
    ru: "Добро пожаловать",
    uz: "Xush kelibsiz",
  },
  scannerInstructions: {
    ru: "Наведите камеру на QR-код",
    uz: "Kamerani QR-kodga qarating",
  },
  permissionDenied: {
    ru: "Доступ к камере запрещен",
    uz: "Kameraga ruxsat rad etildi",
  },
  loading: {
    ru: "Загрузка...",
    uz: "Yuklanmoqda...",
  },
  edit: {
    ru: "Редактировать",
    uz: "Tahrirlash",
  },
  delete: {
    ru: "Удалить",
    uz: "O'chirish",
  },
  confirmation: {
    ru: "Вы уверены?",
    uz: "Ishonchingiz komilmi?",
  },
  yes: {
    ru: "Да",
    uz: "Ha",
  },
  no: {
    ru: "Нет",
    uz: "Yo'q",
  },
  language: {
    ru: "Язык",
    uz: "Til",
  },
  russian: {
    ru: "Русский",
    uz: "Rus tili",
  },
  uzbek: {
    ru: "Узбекский",
    uz: "O'zbek tili",
  },
  hours: {
    ru: "часов",
    uz: "soat",
  },
  shifts: {
    ru: "Смены",
    uz: "Smenalar",
  },
  shiftHistory: {
    ru: "История смен",
    uz: "Smenalar tarixi",
  },
  loginSuccess: {
    ru: "Успешный вход в систему",
    uz: "Tizimga muvaffaqiyatli kirish",
  },
  invalidCredentials: {
    ru: "Неверные учетные данные",
    uz: "Noto'g'ri ma'lumotlar",
  },
  employeeAdded: {
    ru: "Сотрудник добавлен",
    uz: "Xodim qo'shildi",
  },
  employeeUpdated: {
    ru: "Сотрудник обновлен",
    uz: "Xodim yangilandi",
  },
  employeeDeleted: {
    ru: "Сотрудник удален",
    uz: "Xodim o'chirildi",
  },
  locationAdded: {
    ru: "Местоположение добавлено",
    uz: "Joylashuv qo'shildi",
  },
  locationDeleted: {
    ru: "Местоположение удалено",
    uz: "Joylashuv o'chirildi",
  },
  shiftStarted: {
    ru: "Смена начата",
    uz: "Smena boshlandi",
  },
  shiftEnded: {
    ru: "Смена завершена",
    uz: "Smena tugadi",
  },
  latitude: {
    ru: "Широта",
    uz: "Kenglik",
  },
  longitude: {
    ru: "Долгота",
    uz: "Uzunlik",
  },
  startTime: {
    ru: "Время начала",
    uz: "Boshlanish vaqti",
  },
  endTime: {
    ru: "Время окончания",
    uz: "Tugash vaqti",
  },
  hoursWorked: {
    ru: "Отработано часов",
    uz: "Ishlangan soatlar",
  },
  actions: {
    ru: "Действия",
    uz: "Amallar",
  },
  cameraNotAvailable: {
    ru: "Камера недоступна",
    uz: "Kamera mavjud emas",
  },
  simulateQrScan: {
    ru: "Имитировать сканирование QR",
    uz: "QR skanerlashni taqlid qilish",
  },
  invalidQrCode: {
    ru: "Неверный QR-код",
    uz: "Noto'g'ri QR-kod",
  },
  locationNotFound: {
    ru: "Местоположение не найдено",
    uz: "Joylashuv topilmadi",
  },
  qrCodeGenerated: {
    ru: "QR-код сгенерирован",
    uz: "QR-kod yaratildi",
  },
  downloadQr: {
    ru: "Скачать QR",
    uz: "QR yuklab olish",
  },
  allEmployees: {
    ru: "Все сотрудники",
    uz: "Barcha xodimlar",
  },
  selectLocation: {
    ru: "Выберите местоположение",
    uz: "Joylashuvni tanlang",
  },
  manualShiftControl: {
    ru: "Ручное управление сменами",
    uz: "Qo'lda smena boshqaruvi",
  },
  reportType: {
    ru: "Тип отчета",
    uz: "Hisobot turi",
  },
  from: {
    ru: "С",
    uz: "Dan",
  },
  to: {
    ru: "До",
    uz: "Gacha",
  },
  pageNotFound: {
    ru: "Страница не найдена",
    uz: "Sahifa topilmadi",
  },
  returnHome: {
    ru: "Вернуться на главную",
    uz: "Bosh sahifaga qaytish",
  },
  scanQrTitle: {
    ru: "Сканирование QR-кода",
    uz: "QR-kod skanerlash",
  },
  cameraError: {
    ru: "Ошибка доступа к камере",
    uz: "Kameraga kirishda xatolik",
  },
  unknownQrCode: {
    ru: "Неизвестный QR-код",
    uz: "Noma'lum QR-kod",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
