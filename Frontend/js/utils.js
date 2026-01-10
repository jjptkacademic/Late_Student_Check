// Utility Functions

// Format date to Thai format
function formatDateThai(date) {
  const d = new Date(date);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543; // Convert to Buddhist year
  
  return `${day} ${month} ${year}`;
}

// Format time to HH:MM
function formatTime(date) {
  // ถ้าเป็น string ที่เป็นเวลาอยู่แล้ว (HH:MM หรือ HH:MM:SS)
  if (typeof date === 'string') {
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(date)) {
      return date.substring(0, 5); // เอาแค่ HH:MM
    }
  }
  
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current time in HH:MM format
function getCurrentTime() {
  return formatTime(new Date());
}

// Debounce function for search input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Show loading spinner
function showLoading(elementId = 'loadingSpinner', message = 'กำลังโหลดข้อมูล...') {
  const spinner = document.getElementById(elementId);
  if (spinner) {
    const messageElement = spinner.querySelector('p');
    if (messageElement) {
      messageElement.textContent = message;
    }
    spinner.style.display = 'flex';
  }
}

// Hide loading spinner
function hideLoading(elementId = 'loadingSpinner') {
  const spinner = document.getElementById(elementId);
  if (spinner) spinner.style.display = 'none';
}

// Show notification (simple alert for now, can be enhanced later)
function showNotification(message, type = 'info') {
  // Simple implementation - can be enhanced with toast notifications
  alert(message);
}

// Group array by key
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

// Sort array by key
function sortBy(array, key, ascending = true) {
  return array.sort((a, b) => {
    if (ascending) {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

// Get unique classrooms from students array
function getUniqueClassrooms(students) {
  const classrooms = [...new Set(students.map(s => s.class_room))];
  return classrooms.sort();
}

// Update clock display
function updateClock() {
  const dateElement = document.getElementById('currentDate');
  const timeElement = document.getElementById('currentTime');
  
  if (dateElement) {
    dateElement.textContent = formatDateThai(new Date());
  }
  
  if (timeElement) {
    timeElement.textContent = getCurrentTime();
  }
}

// Start clock update interval
function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}
