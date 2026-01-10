// Dashboard Page Logic
requireAuth();

let allStudents = [];
let lateSummary = [];
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Check if cache is valid
function isCacheValid() {
  if (!cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

// Load dashboard data
async function loadDashboard(forceRefresh = false) {
  showLoading('loadingSpinner', '🏫 กำลังโหลดข้อมูลห้องเรียน...');
  
  try {
    // Check cache first
    if (!forceRefresh && isCacheValid()) {
      const cachedStudents = Storage.get('cached_students');
      const cachedSummary = Storage.get('cached_summary');
      
      if (cachedStudents && cachedSummary) {
        console.log('📦 Using cached data');
        allStudents = cachedStudents;
        lateSummary = cachedSummary;
        renderClassrooms();
        hideLoading();
        return;
      }
    }
    
    console.log('🔄 Fetching fresh data');
    
    // Fetch students and late summary
    const [studentsResponse, summaryResponse] = await Promise.all([
      API.getStudents(),
      API.getLateSummary()
    ]);
    
    if (studentsResponse.success) {
      allStudents = studentsResponse.data;
      Storage.set('cached_students', allStudents);
    }
    
    if (summaryResponse.success) {
      lateSummary = summaryResponse.data;
      Storage.set('cached_summary', lateSummary);
    }
    
    // Update cache timestamp
    cacheTimestamp = Date.now();
    Storage.set('cache_timestamp', cacheTimestamp);
    
    renderClassrooms();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showNotification('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
  }
}

// Load cache timestamp on init
function initCache() {
  const savedTimestamp = Storage.get('cache_timestamp');
  if (savedTimestamp) {
    cacheTimestamp = savedTimestamp;
  }
}

// Clear cache
function clearCache() {
  Storage.remove('cached_students');
  Storage.remove('cached_summary');
  Storage.remove('cache_timestamp');
  cacheTimestamp = null;
  console.log('🗑️ Cache cleared');
}

// Render classroom cards
function renderClassrooms() {
  const grid = document.getElementById('classroomGrid');
  grid.innerHTML = '';
  
  // Group students by classroom
  const grouped = groupBy(allStudents, 'class_room');
  
  // Create card for each classroom
  Object.keys(grouped).sort().forEach(classroom => {
    const students = grouped[classroom];
    const totalStudents = students.length;
    
    // Count late records for this classroom
    const classLate = lateSummary
      .filter(s => s.class_room === classroom)
      .reduce((sum, s) => sum + s.total_late, 0);
    
    const card = Components.createClassroomCard(classroom, totalStudents, classLate);
    grid.appendChild(card);
  });
  
  if (Object.keys(grouped).length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--color-text-light);">ไม่มีข้อมูลห้องเรียน</p>';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  initCache();
  loadDashboard();
  
  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
      clearCache(); // Clear cache on logout
      logout();
    }
  });
  
  // View stats button
  document.getElementById('viewStatsBtn')?.addEventListener('click', function() {
    window.location.href = 'stats.html';
  });
  
  // Refresh button (if exists)
  document.getElementById('refreshBtn')?.addEventListener('click', function() {
    clearCache();
    loadDashboard(true); // Force refresh
    showNotification('🔄 รีเฟรชข้อมูลเรียบร้อย', 'success');
  });
});
