// Dashboard Page Logic
requireAuth();

let allStudents = [];
let lateSummary = [];

// Load dashboard data
async function loadDashboard() {
  showLoading();
  
  try {
    // Fetch students and late summary
    const [studentsResponse, summaryResponse] = await Promise.all([
      API.getStudents(),
      API.getLateSummary()
    ]);
    
    if (studentsResponse.success) {
      allStudents = studentsResponse.data;
    }
    
    if (summaryResponse.success) {
      lateSummary = summaryResponse.data;
    }
    
    renderClassrooms();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
  }
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
  loadDashboard();
  
  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', function() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
      logout();
    }
  });
  
  // View stats button
  document.getElementById('viewStatsBtn')?.addEventListener('click', function() {
    window.location.href = 'stats.html';
  });
});
