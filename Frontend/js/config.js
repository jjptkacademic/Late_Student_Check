// Configuration
const CONFIG = {
  // API Configuration
  API_URL: ' https://script.google.com/macros/s/AKfycbw-2eMP9UGfT9rGPkhpg0u8DyTzXuA-n0HxL5wMM9aZrtERdkwmB8TSo4zyvriGz_N9vg/exec',
  
  // Authentication
  AUTH_PIN: '1234', // เปลี่ยนรหัสผ่านตรงนี้
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  
  // App Settings
  APP_NAME: 'ระบบเช็คนักเรียนมาสาย',
  APP_VERSION: '1.0.0',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH: 'late_check_auth',
    DRAFT: 'late_check_draft',
    CACHE: 'late_check_cache'
  },

  // Performance Monitor
  ENABLE_PERFORMANCE_MONITOR: false // เปลี่ยนเป็น true เพื่อเปิดใช้งาน Performance Monitor
};
