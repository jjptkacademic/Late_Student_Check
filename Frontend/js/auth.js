// Authentication Functions

// Login function
function login(pin) {
  if (pin === CONFIG.AUTH_PIN) {
    const authData = {
      loggedIn: true,
      timestamp: Date.now()
    };
    Storage.set(CONFIG.STORAGE_KEYS.AUTH, authData);
    return true;
  }
  return false;
}

// Logout function
function logout() {
  Storage.remove(CONFIG.STORAGE_KEYS.AUTH);
  window.location.href = 'index.html';
}

// Check if user is authenticated
function isAuthenticated() {
  const authData = Storage.get(CONFIG.STORAGE_KEYS.AUTH);
  
  if (!authData || !authData.loggedIn) {
    return false;
  }
  
  // Check session timeout
  const now = Date.now();
  const sessionAge = now - authData.timestamp;
  
  if (sessionAge > CONFIG.SESSION_TIMEOUT) {
    logout();
    return false;
  }
  
  // Refresh timestamp
  authData.timestamp = now;
  Storage.set(CONFIG.STORAGE_KEYS.AUTH, authData);
  
  return true;
}

// Require authentication (call this on protected pages)
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'index.html';
  }
}
