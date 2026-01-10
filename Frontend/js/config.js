// Configuration
const CONFIG = {
  // API Configuration
  API_URL: 'https://script.google.com/macros/s/AKfycby5Lhe_yOUgV-FeRMLyfr_BKi8FTpeWn6McenG6bfY4K-otdj_FvehoHakQIJ8p7Uo10A/exec',
  
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
  }
};
