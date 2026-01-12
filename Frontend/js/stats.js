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
let rankingFilters = {
  minTimes: 1,
  limit: 10
};

function renderRanking() {
  const tbody = document.getElementById('rankingTableBody');
  const noDataMsg = document.getElementById('noDataMessage');
  
  if (!tbody) return; // Skip if element doesn't exist
  
  tbody.innerHTML = '';
  
  // Filter and sort by total_late descending
  const filtered = [...lateSummary]
    .filter(s => s.total_late >= rankingFilters.minTimes)
    .sort((a, b) => b.total_late - a.total_late);
  
  // Apply limit
  const limited = rankingFilters.limit === 'all' 
    ? filtered 
    : filtered.slice(0, parseInt(rankingFilters.limit));
  
  if (limited.length === 0) {
    tbody.style.display = 'none';
    noDataMsg.style.display = 'block';
    return;
  }
  
  tbody.style.display = '';
  noDataMsg.style.display = 'none';
  
  limited.forEach((student, index) => {
    const tr = document.createElement('tr');
    tr.onclick = () => showStudentDetail(student);
    
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.student_code}</td>
      <td>${student.first_name} ${student.last_name}</td>
      <td>${student.class_room}</td>
      <td>${student.total_late} ครั้ง</td>
    `;
    
    tbody.appendChild(tr);
  });
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
      // Update total_late with actual count from records
      document.getElementById('detailTotal').textContent = response.data.length;
      
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
      // Update total_late to 0 if no records
      document.getElementById('detailTotal').textContent = 0;
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

// Copy stats as text
function copyStatsAsText() {
  const filtered = [...lateSummary]
    .filter(s => s.total_late >= rankingFilters.minTimes)
    .sort((a, b) => b.total_late - a.total_late);
  
  const limited = rankingFilters.limit === 'all' 
    ? filtered 
    : filtered.slice(0, parseInt(rankingFilters.limit));
  
  if (limited.length === 0) {
    showNotification('❌ ไม่มีข้อมูลให้คัดลอก', 'error');
    return;
  }
  
  // Create text format
  const today = new Date();
  const thaiDate = formatDateThai(today);
  
  let text = `📊 ระบบเช็คมาสาย\n`;
  text += `สถิติมาสาย วันที่ ${thaiDate}\n`;
  text += `(มาสายมากกว่า ${rankingFilters.minTimes} ครั้ง)\n`;
  text += `${'='.repeat(60)}\n\n`;
  
  limited.forEach((student, index) => {
    text += `${index + 1}. ${student.first_name} ${student.last_name} - ห้อง ${student.class_room} - มาสาย ${student.total_late} ครั้ง\n`;
  });
  
  text += `\n${'='.repeat(60)}\n`;
  text += `รวมทั้งหมด ${limited.length} คน`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(text).then(() => {
    showNotification('✅ คัดลอกข้อความสำเร็จ', 'success');
  }).catch(err => {
    console.error('Copy failed:', err);
    showNotification('❌ ไม่สามารถคัดลอกได้', 'error');
  });
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
  
  // Min times slider
  document.getElementById('minTimesFilter')?.addEventListener('input', function() {
    rankingFilters.minTimes = parseInt(this.value);
    document.getElementById('minTimesValue').textContent = this.value;
    renderRanking();
  });
  
  // Decrease button
  document.getElementById('decreaseBtn')?.addEventListener('click', function() {
    const slider = document.getElementById('minTimesFilter');
    const currentValue = parseInt(slider.value);
    if (currentValue > parseInt(slider.min)) {
      slider.value = currentValue - 1;
      rankingFilters.minTimes = currentValue - 1;
      document.getElementById('minTimesValue').textContent = slider.value;
      renderRanking();
    }
  });
  
  // Increase button
  document.getElementById('increaseBtn')?.addEventListener('click', function() {
    const slider = document.getElementById('minTimesFilter');
    const currentValue = parseInt(slider.value);
    if (currentValue < parseInt(slider.max)) {
      slider.value = currentValue + 1;
      rankingFilters.minTimes = currentValue + 1;
      document.getElementById('minTimesValue').textContent = slider.value;
      renderRanking();
    }
  });
  
  // Limit select
  document.getElementById('limitSelect')?.addEventListener('change', function() {
    rankingFilters.limit = this.value;
    renderRanking();
  });
  
  // Copy button
  document.getElementById('copyStatsBtn')?.addEventListener('click', copyStatsAsText);
  
  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', refreshStats);
  
  // Export button (removed - can add back if needed)
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    showNotification('ℹ️ ฟีเจอร์นี้กำลังพัฒนา', 'info');
  });
  
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
