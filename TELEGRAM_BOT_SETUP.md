# Настройка Telegram Bot для DS Tracker

## Создание бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Придумайте имя для бота (например: "DS Tracker")
4. Придумайте username (например: "ds_tracker_bot")
5. Сохраните полученный токен бота

## Создание Web App

1. В чате с @BotFather отправьте `/newapp`
2. Выберите созданного бота
3. Введите название приложения: "DS Tracker"
4. Введите описание: "Система учета рабочего времени"
5. Загрузите фото (512x512 пикселей)
6. Введите URL вашего приложения (например: https://yourdomain.com)

## Настройка команд бота

Отправьте @BotFather команду `/setcommands` и выберите своего бота, затем отправьте:

```
start - Запустить DS Tracker
help - Помощь
app - Открыть приложение
```

## Настройка описания

1. `/setdescription` - установить описание бота
2. Введите: "Система учета рабочего времени сотрудников. Отслеживайте рабочие смены через QR-коды и геолокацию."

## Настройка изображения

1. `/setuserpic` - установить аватар бота
2. Загрузите изображение 512x512 пикселей

## Код бота (Node.js)

Создайте файл `bot.js`:

```javascript
const TelegramBot = require('node-telegram-bot-api');

// Замените на ваш токен
const token = 'ВАШ_ТОКЕН_БОТА';
const bot = new TelegramBot(token, {polling: true});

// URL вашего Web App
const webAppUrl = 'https://yourdomain.com';

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Добро пожаловать в DS Tracker! 🕒\n\nСистема учета рабочего времени для сотрудников.\n\nИспользуйте кнопку ниже для запуска приложения:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🚀 Открыть DS Tracker',
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Обработка команды /app
bot.onText(/\/app/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Запустить DS Tracker:', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: '📱 Открыть приложение',
          web_app: { url: webAppUrl }
        }
      ]]
    }
  });
});

// Обработка команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpText = `
🔧 *Помощь по DS Tracker*

*Для сотрудников:*
• Сканируйте QR-код на рабочем месте
• Начинайте и завершайте смены
• Просматривайте статистику работы

*Для администраторов:*
• Управляйте сотрудниками
• Добавляйте рабочие места
• Генерируйте отчеты
• Контролируйте смены

*Команды:*
/start - Запустить приложение
/app - Открыть DS Tracker
/help - Показать эту справку

*Поддержка:* @your_support_username
  `;
  
  bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

// Обработка данных из Web App
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  // Обработка данных от Web App
  console.log('Данные от Web App:', data);
  
  bot.sendMessage(chatId, '✅ Данные получены!');
});

console.log('🤖 DS Tracker Bot запущен!');
```

## Установка зависимостей

```bash
npm init -y
npm install node-telegram-bot-api
node bot.js
```

## Важные моменты

1. **HTTPS обязателен** - Telegram Web Apps работают только по HTTPS
2. **Домен должен быть доступен** - URL должен быть публично доступным
3. **Тестирование** - Используйте ngrok для локального тестирования

## Тестирование локально с ngrok

```bash
# Установите ngrok
npm install -g ngrok

# Запустите ваше приложение (обычно на порту 5173)
npm run dev

# В другом терминале запустите ngrok
ngrok http 5173

# Используйте полученный HTTPS URL в настройках Web App
```

## Учетные данные по умолчанию

**Администратор:**
- Email: AdminDSM
- Пароль: 55555

**Тестовый сотрудник:**
- Email: employee@example.com  
- Пароль: employee123

## Функционал

✅ **Реализовано:**
- Аутентификация пользователей
- Управление сотрудниками (админ)
- Управление локациями (админ)
- QR-сканер для начала/окончания смен
- Проверка геолокации
- Ручное управление сменами (админ)
- Генерация отчетов
- Мультиязычность (русский/узбекский)
- Адаптивный дизайн
- Интеграция с Telegram Web App API

✅ **Особенности Telegram Mini App:**
- Автоматическая адаптация к теме Telegram
- Поддержка темной и светлой тем
- Тактильная обратная связь
- Интеграция с главной кнопкой Telegram
- Оптимизированный для мобильных устройств