// Stats Page Logic
requireAuth();

let lateSummary = [];
let currentFilter = {
  class_room: '',
  period: 'month'
};

// Load stats page
async function loadStats() {
  // Check if we're on stats page (has required elements)
  if (!document.getElementById('totalLate')) {
    return; // Skip initialization if not on stats page
  }
  
  showLoading('loadingSpinner', '📊 กำลังโหลดสถิติ...');
  
  try {
    await Promise.all([
      loadSummary(),
      loadClassrooms()
    ]);
    
    renderStats();
  } catch (error) {
    console.error('Error loading stats:', error);
    showNotification('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
  }
}

// Load summary data
async function loadSummary() {
  const filters = {};
  if (currentFilter.class_room) {
    filters.class_room = currentFilter.class_room;
  }
  
  const response = await API.getLateSummary(filters);
  
  if (response.success) {
    lateSummary = response.data;
  }
}

// Load classrooms for filter
async function loadClassrooms() {
  const response = await API.getStudents();
  
  if (response.success) {
    const classrooms = getUniqueClassrooms(response.data);
    renderClassFilter(classrooms);
  }
}

// Render stats
function renderStats() {
  renderOverview();
  renderRanking();
  renderChart();
}

// Render overview cards
function renderOverview() {
  // Skip if elements don't exist (not on stats page)
  if (!document.getElementById('totalLate')) return;
  
  const totalLate = lateSummary.reduce((sum, s) => sum + s.total_late, 0);
  const totalStudents = lateSummary.filter(s => s.total_late > 0).length;
  const avgLate = totalStudents > 0 ? (totalLate / totalStudents).toFixed(1) : 0;
  
  // Find class with most late
  const byClass = groupBy(lateSummary, 'class_room');
  let topClass = '-';
  let topClassCount = 0;
  
  Object.keys(byClass).forEach(classroom => {
    const classTotal = byClass[classroom].reduce((sum, s) => sum + s.total_late, 0);
    if (classTotal > topClassCount) {
      topClassCount = classTotal;
      topClass = classroom;
    }
  });
  
  // Update UI
  document.getElementById('totalLate').textContent = totalLate;
  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('avgLate').textContent = avgLate;
  document.getElementById('topClass').textContent = topClass;
  document.getElementById('topClassCount').textContent = topClassCount > 0 ? `${topClassCount} ครั้ง` : '';
}

// Render ranking
function renderRanking() {
  const list = document.getElementById('rankingList');
  if (!list) return; // Skip if element doesn't exist
  
  list.innerHTML = '';
  
  // Sort by total_late descending
  const sorted = [...lateSummary]
    .filter(s => s.total_late > 0)
    .sort((a, b) => b.total_late - a.total_late)
    .slice(0, 10);
  
  sorted.forEach((student, index) => {
    const rank = index + 1;
    const item = Components.createRankingItem(rank, student, () => {
      showStudentDetail(student);
    });
    list.appendChild(item);
  });
  
  if (sorted.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--color-text-light); padding: var(--space-lg);">ไม่มีข้อมูลการมาสาย</p>';
  }
}

// Render chart
function renderChart() {
  const chart = document.getElementById('classChart');
  if (!chart) return; // Skip if element doesn't exist
  
  chart.innerHTML = '';
  
  // Group by classroom
  const byClass = groupBy(lateSummary, 'class_room');
  const classData = [];
  
  Object.keys(byClass).forEach(classroom => {
    const total = byClass[classroom].reduce((sum, s) => sum + s.total_late, 0);
    classData.push({ classroom, total });
  });
  
  // Sort by total descending
  classData.sort((a, b) => b.total - a.total);
  
  // Find max value for scaling
  const maxValue = Math.max(...classData.map(d => d.total), 1);
  
  // Create bars
  classData.forEach(data => {
    const bar = Components.createChartBar(data.classroom, data.total, maxValue);
    chart.appendChild(bar);
  });
  
  if (classData.length === 0) {
    chart.innerHTML = '<p style="text-align: center; color: var(--color-text-light); padding: var(--space-lg);">ไม่มีข้อมูลสำหรับสร้างกราฟ</p>';
  }
}

// Render class filter
function renderClassFilter(classrooms) {
  const select = document.getElementById('classFilter');
  if (!select) return; // Skip if element doesn't exist
  
  const currentValue = select.value;
  
  select.innerHTML = '<option value="">ทั้งหมด</option>';
  
  classrooms.forEach(classroom => {
    const option = document.createElement('option');
    option.value = classroom;
    option.textContent = classroom;
    select.appendChild(option);
  });
  
  if (currentValue) {
    select.value = currentValue;
  }
}

// Show student detail modal
async function showStudentDetail(student) {
  const modal = document.getElementById('detailModal');
  
  // Set student info
  document.getElementById('detailName').textContent = `${student.first_name} ${student.last_name}`;
  document.getElementById('detailClass').textContent = student.class_room;
  document.getElementById('detailCode').textContent = student.student_code;
  document.getElementById('detailTotal').textContent = student.total_late;
  
  // Load and show late history
  const historyList = document.getElementById('detailHistory');
  historyList.innerHTML = '<p style="text-align: center;">⏳ กำลังโหลดประวัติ...</p>';
  
  modal.style.display = 'flex';
  
  try {
    const response = await API.getLateRecords({ student_id: student.student_id });
    
    if (response.success && response.data.length > 0) {
      // Create table
      const table = document.createElement('table');
      table.className = 'history-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สาเหตุ</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      
      const tbody = table.querySelector('tbody');
      
      response.data.forEach((record, index) => {
        const tr = document.createElement('tr');
        const displayTime = formatTime(record.late_time);
        
        tr.innerHTML = `
          <td class="text-center">${index + 1}</td>
          <td>📅 ${formatDateThai(record.late_date)}</td>
          <td>⏰ ${displayTime}</td>
          <td>${record.reason ? `💬 ${record.reason}` : '-'}</td>
        `;
        tbody.appendChild(tr);
      });
      
      historyList.innerHTML = '';
      historyList.appendChild(table);
    } else {
      historyList.innerHTML = '<p style="text-align: center; color: var(--color-text-light); padding: var(--space-lg);">ไม่มีประวัติการมาสาย</p>';
    }
  } catch (error) {
    console.error('Error loading history:', error);
    historyList.innerHTML = '<p style="text-align: center; color: var(--color-danger); padding: var(--space-lg);">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
}

// Export function for use in check-late.js
window.showStudentDetailFromStats = showStudentDetail;

// Hide student detail modal
function hideStudentDetail() {
  document.getElementById('detailModal').style.display = 'none';
}

// Export for check-late.js
window.hideStudentDetail = hideStudentDetail;

// Refresh stats
async function refreshStats() {
  await loadStats();
}

// Export to Excel (simple CSV for now)
function exportToExcel() {
  const sorted = [...lateSummary]
    .filter(s => s.total_late > 0)
    .sort((a, b) => b.total_late - a.total_late);
  
  let csv = 'อันดับ,รหัสนักเรียน,ชื่อ,นามสกุล,ห้อง,จำนวนครั้ง\n';
  
  sorted.forEach((student, index) => {
    csv += `${index + 1},${student.student_code},${student.first_name},${student.last_name},${student.class_room},${student.total_late}\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `สถิติการมาสาย_${getCurrentDate()}.csv`;
  link.click();
}

// Print stats
function printStats() {
  window.print();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  loadStats();
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => history.back());
  
  // Home button
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  // Class filter
  document.getElementById('classFilter')?.addEventListener('change', function() {
    currentFilter.class_room = this.value;
    refreshStats();
  });
  
  // Period filter
  document.getElementById('periodFilter')?.addEventListener('change', function() {
    currentFilter.period = this.value;
    // TODO: Implement period filtering with date ranges
  });
  
  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', refreshStats);
  
  // Export button
  document.getElementById('exportBtn')?.addEventListener('click', exportToExcel);
  
  // Print button
  document.getElementById('printBtn')?.addEventListener('click', printStats);
  
  // Modal close buttons
  document.getElementById('closeDetailModal')?.addEventListener('click', hideStudentDetail);
  document.getElementById('closeDetailBtn')?.addEventListener('click', hideStudentDetail);
  
  // Close modal on backdrop click
  document.getElementById('detailModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      hideStudentDetail();
    }
  });
});
