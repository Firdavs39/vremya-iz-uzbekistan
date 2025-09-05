import React, { useEffect } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: () => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        sendData: (data: string) => void;
        close: () => void;
      };
    };
  }
}

interface TelegramWebAppProps {
  children: React.ReactNode;
}

const TelegramWebApp: React.FC<TelegramWebAppProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Ready the app
      tg.ready();
      
      // Expand the app to full height
      tg.expand();
      
      // Apply Telegram theme colors to CSS variables
      if (tg.themeParams) {
        const root = document.documentElement;
        
        if (tg.themeParams.bg_color) {
          root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
          root.style.setProperty('--tg-text-color', tg.themeParams.text_color);
        }
        if (tg.themeParams.hint_color) {
          root.style.setProperty('--tg-hint-color', tg.themeParams.hint_color);
        }
        if (tg.themeParams.link_color) {
          root.style.setProperty('--tg-link-color', tg.themeParams.link_color);
        }
        if (tg.themeParams.button_color) {
          root.style.setProperty('--tg-button-color', tg.themeParams.button_color);
        }
        if (tg.themeParams.button_text_color) {
          root.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color);
        }
        if (tg.themeParams.secondary_bg_color) {
          root.style.setProperty('--tg-secondary-bg-color', tg.themeParams.secondary_bg_color);
        }
      }
      
      // Set theme class based on Telegram's color scheme
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return <>{children}</>;
};

export default TelegramWebApp;