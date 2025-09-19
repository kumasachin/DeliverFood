export const APP_CONFIG = {
  // Auto-refresh intervals (in milliseconds)
  AUTO_REFRESH: {
    ORDERS_DASHBOARD: 30000, // 30 seconds
    ORDER_STATUS: 10000, // 10 seconds
    DEFAULT: 30000, // 30 seconds
  },

  // API settings
  API: {
    TIMEOUT: 10000, // 10 seconds
  },

  // UI settings
  UI: {
    SEARCH_DEBOUNCE: 300, // 300ms
    TOAST_DURATION: 4000, // 4 seconds
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
