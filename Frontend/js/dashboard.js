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
  PM.start('loadDashboard');
  
  showLoading('loadingSpinner', '🏫 กำลังโหลดข้อมูลห้องเรียน...');
  
  try {
    PM.checkpoint('loadDashboard', 'Checking cache...');
    
    // Check cache first
    if (!forceRefresh && isCacheValid()) {
      const cachedStudents = Storage.get('cached_students');
      const cachedSummary = Storage.get('cached_summary');
      
      if (cachedStudents && cachedSummary) {
        console.log('📦 Using cached data');
        PM.checkpoint('loadDashboard', 'Using cached data');
        allStudents = cachedStudents;
        lateSummary = cachedSummary;
        
        PM.start('renderClassrooms');
        renderClassrooms();
        PM.end('renderClassrooms');
        
        hideLoading();
        PM.end('loadDashboard');
        return;
      }
    }
    
    console.log('🔄 Fetching fresh data');
    PM.checkpoint('loadDashboard', 'Fetching from API');
    
    // Fetch students and late summary
    PM.start('API.getStudents+getLateSummary');
    const [studentsResponse, summaryResponse] = await Promise.all([
      API.getStudents(),
      API.getLateSummary()
    ]);
    PM.end('API.getStudents+getLateSummary');
    
    if (studentsResponse.success) {
      allStudents = studentsResponse.data;
      PM.checkpoint('loadDashboard', `Loaded ${allStudents.length} students`);
      Storage.set('cached_students', allStudents);
    }
    
    if (summaryResponse.success) {
      lateSummary = summaryResponse.data;
      PM.checkpoint('loadDashboard', `Loaded ${lateSummary.length} summary records`);
      Storage.set('cached_summary', lateSummary);
    }
    
    // Update cache timestamp
    cacheTimestamp = Date.now();
    Storage.set('cache_timestamp', cacheTimestamp);
    
    PM.start('renderClassrooms');
    renderClassrooms();
    PM.end('renderClassrooms');
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    PM.checkpoint('loadDashboard', `ERROR: ${error.message}`);
    showNotification('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
    PM.end('loadDashboard');
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
  document.getElementById('refreshBtn')?.addEventListener('click', async function() {
    const btn = this;
    
    // ✅ แสดง Loading ทันที!
    showLoading('loadingSpinner', '🔄 กำลังรีเฟรชข้อมูล...');
    
    btn.disabled = true;
    btn.textContent = '⏳';
    
    console.log('🔄 Refresh button clicked');
    console.log('📦 API object:', API);
    console.log('🔍 API.clearCache exists?', typeof API.clearCache);
    
    try {
      // Clear cache on server
      if (typeof API.clearCache === 'function') {
        console.log('✅ Calling API.clearCache()...');
        await API.clearCache();
      } else {
        console.error('❌ API.clearCache is not a function!');
        console.log('Available API methods:', Object.keys(API));
        throw new Error('API.clearCache is not a function');
      }
      
      // Clear local cache
      clearCache();
      
      // Reload data (loadDashboard จะ hideLoading เอง)
      await loadDashboard(true); // Force refresh and wait
      
      showNotification('🔄 รีเฟรชข้อมูลเรียบร้อย', 'success');
    } catch (error) {
      console.error('❌ Refresh error:', error);
      showNotification('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
      hideLoading(); // ต้อง hide เองเพราะ loadDashboard อาจไม่ทำงาน
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄';
    }
  });
});
