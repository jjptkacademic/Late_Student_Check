// Check Late Page Logic
requireAuth();

let currentClass = null;
let allStudents = [];
let todayRecords = [];
let selectedStudents = new Set();

// Get class from URL parameter
function getClassFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('class');
}

// Load page data
async function loadPage() {
  currentClass = getClassFromURL();
  
  if (!currentClass) {
    window.location.href = 'dashboard.html';
    return;
  }
  
  showLoading('loadingSpinner', '📚 กำลังโหลดข้อมูลห้องเรียน...');
  startClock();
  
  try {
    // Load students first, then late records (sequential)
    await loadStudents();
    await loadClassrooms();
    await loadTodayRecords(); // Load after students loaded
  } catch (error) {
    console.error('Error loading page:', error);
    showNotification('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
  }
}

// Load students for current class
async function loadStudents() {
  const response = await API.getStudents({ class_room: currentClass });
  
  if (response.success) {
    allStudents = response.data;
    console.log('Students loaded:', allStudents); // Debug
    // Don't render yet, wait for todayRecords
  }
}

// Load today's late records
async function loadTodayRecords() {
  const today = getCurrentDate();
  const response = await API.getLateRecords({
    date_from: today,
    date_to: today
  });
  
  console.log('Today records response:', response); // Debug
  
  if (response.success && response.data) {
    // Filter records for current class
    todayRecords = response.data.filter(r => {
      const student = allStudents.find(s => s.student_id == r.student_id);
      console.log(`Checking record: student_id=${r.student_id}, found=${!!student}`); // Debug
      return student && student.class_room === currentClass;
    });
    console.log('Filtered today records:', todayRecords); // Debug
    renderTodayRecords();
    
    // Re-render students list with updated todayRecords
    if (allStudents.length > 0) {
      renderStudentsList(allStudents);
    }
  } else {
    todayRecords = [];
    renderTodayRecords();
    
    // Still render students even if no late records
    if (allStudents.length > 0) {
      renderStudentsList(allStudents);
    }
  }
}

// Load all classrooms for selector
async function loadClassrooms() {
  const response = await API.getStudents();
  
  if (response.success) {
    const classrooms = getUniqueClassrooms(response.data);
    renderClassSelector(classrooms);
  }
}

// Render students list with checkboxes
function renderStudentsList(students) {
  const tbody = document.getElementById('studentsTableBody');
  tbody.innerHTML = '';
  
  // Get list of student IDs who are already late today
  const lateStudentIds = new Set(todayRecords.map(r => r.student_id));
  
  students.forEach((student, index) => {
    const tr = document.createElement('tr');
    tr.dataset.studentId = student.student_id;
    
    const isAlreadyLate = lateStudentIds.has(student.student_id);
    
    // Add class if already late
    if (isAlreadyLate) {
      tr.classList.add('already-late');
    }
    
    // Column 1: ลำดับ
    const tdOrder = document.createElement('td');
    tdOrder.className = 'student-order';
    tdOrder.textContent = index + 1;
    
    // Column 2: รหัสนักเรียน
    const tdCode = document.createElement('td');
    tdCode.innerHTML = `<span class="student-code">${student.student_code}</span>`;
    
    // Column 3: ชื่อ - นามสกุล
    const tdName = document.createElement('td');
    tdName.innerHTML = `<span class="student-name">${student.first_name} ${student.last_name}</span>`;
    
    // Column 4: Checkbox มาสาย
    const tdCheckbox = document.createElement('td');
    tdCheckbox.className = 'student-checkbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `student-${student.student_id}`;
    checkbox.value = student.student_id;
    checkbox.disabled = isAlreadyLate; // Disable if already late
    
    if (isAlreadyLate) {
      // Show checkmark instead
      tdCheckbox.innerHTML = '<span style="color: var(--color-success); font-size: 1.2rem;">✓</span>';
    } else {
      checkbox.addEventListener('change', function() {
        if (this.checked) {
          selectedStudents.add(parseInt(this.value));
          tr.classList.add('checked');
          reasonSelect.disabled = false;
        } else {
          selectedStudents.delete(parseInt(this.value));
          tr.classList.remove('checked');
          reasonSelect.disabled = true;
          reasonSelect.value = 'อื่นๆ';
        }
        updateSelectionInfo();
      });
      tdCheckbox.appendChild(checkbox);
    }
    
    // Column 5: สาเหตุ (Combo box)
    const tdReason = document.createElement('td');
    const reasonSelect = document.createElement('select');
    reasonSelect.className = 'reason-select';
    reasonSelect.disabled = isAlreadyLate || true; // Disabled by default
    reasonSelect.dataset.studentId = student.student_id;
    
    // Add options
    const reasons = [
      'อื่นๆ',
      'รถติด',
      'ตื่นสาย',
      'ธุระส่วนตัว',
      'ป่วย',
      'ไปโรงพยาบาล',
      'รถเสีย'
    ];
    
    reasons.forEach(reason => {
      const option = document.createElement('option');
      option.value = reason;
      option.textContent = reason;
      reasonSelect.appendChild(option);
    });
    
    // Set default value or show existing reason
    if (isAlreadyLate) {
      const existingRecord = todayRecords.find(r => r.student_id == student.student_id);
      if (existingRecord && existingRecord.reason) {
        reasonSelect.value = existingRecord.reason;
      }
    } else {
      reasonSelect.value = 'อื่นๆ';
    }
    
    tdReason.appendChild(reasonSelect);
    
    tr.appendChild(tdOrder);
    tr.appendChild(tdCode);
    tr.appendChild(tdName);
    tr.appendChild(tdCheckbox);
    tr.appendChild(tdReason);
    
    tbody.appendChild(tr);
  });
}

// Render today's records
function renderTodayRecords() {
  const section = document.getElementById('todayRecordsSection');
  const list = document.getElementById('todayRecordsList');
  const count = document.getElementById('todayCount');
  
  if (!todayRecords || todayRecords.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  count.textContent = todayRecords.length;
  list.innerHTML = '';
  
  todayRecords.forEach(record => {
    const student = allStudents.find(s => s.student_id == record.student_id);
    if (student) {
      const item = document.createElement('div');
      item.className = 'today-record-item';
      
      // Format time properly
      const displayTime = formatTime(record.late_time);
      
      item.innerHTML = `
        <div class="record-student">
          ⚠️ <strong>${student.student_code}</strong> ${student.first_name} ${student.last_name}
        </div>
        <div class="record-info">
          <span>⏰ ${displayTime}</span>
          ${record.reason ? `<span class="record-reason">💬 ${record.reason}</span>` : ''}
        </div>
        <div class="record-actions">
          <button class="btn btn-sm btn-secondary" onclick="showStudentDetail(${student.student_id})">📊 สถิติ</button>
          <button class="btn btn-sm btn-outline" onclick="deleteLateRecord(${record.late_id})">🗑️ ลบ</button>
        </div>
      `;
      
      list.appendChild(item);
    }
  });
}

// Render class selector
function renderClassSelector(classrooms) {
  const select = document.getElementById('classSelect');
  select.innerHTML = '';
  
  classrooms.forEach(classroom => {
    const option = document.createElement('option');
    option.value = classroom;
    option.textContent = classroom;
    if (classroom === currentClass) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

// Update selection info
function updateSelectionInfo() {
  const info = document.getElementById('selectionInfo');
  const countElement = document.getElementById('selectedCount');
  
  if (selectedStudents.size > 0) {
    info.style.display = 'block';
    countElement.textContent = selectedStudents.size;
  } else {
    info.style.display = 'none';
  }
}

// Search students
const searchStudents = debounce(function(query) {
  const filtered = allStudents.filter(student => {
    const searchText = query.toLowerCase();
    return (
      String(student.student_code).toLowerCase().includes(searchText) ||
      String(student.first_name).toLowerCase().includes(searchText) ||
      String(student.last_name).toLowerCase().includes(searchText)
    );
  });
  
  renderStudentsList(filtered);
}, 300);

// Save late records
async function saveLateRecords() {
  if (selectedStudents.size === 0) {
    showNotification('กรุณาเลือกนักเรียนที่มาสาย', 'warning');
    return;
  }
  
  // Show modal for time
  showLateFormModal();
}

// Show late form modal
function showLateFormModal() {
  const modal = document.getElementById('lateFormModal');
  const timeInput = document.getElementById('lateTime');
  
  // Set current time as default
  timeInput.value = getCurrentTime();
  
  modal.style.display = 'flex';
}

// Hide late form modal
function hideLateFormModal() {
  document.getElementById('lateFormModal').style.display = 'none';
}

// Confirm and save
async function confirmSave() {
  const timeInput = document.getElementById('lateTime');
  const time = timeInput.value;
  
  if (!time) {
    showNotification('⚠️ กรุณาระบุเวลา', 'warning');
    return;
  }
  
  // Hide modal first
  hideLateFormModal();
  
  showLoading('loadingSpinner', '💾 กำลังบันทึกข้อมูล...');
  
  try {
    const date = getCurrentDate();
    const promises = [];
    
    // Get reasons from table
    for (const studentId of selectedStudents) {
      const reasonSelect = document.querySelector(`select.reason-select[data-student-id="${studentId}"]`);
      const reason = reasonSelect ? reasonSelect.value : 'อื่นๆ';
      
      promises.push(
        API.addLateRecord({
          student_id: studentId,
          late_date: date,
          late_time: time,
          reason: reason
        })
      );
    }
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 0) {
      showNotification(`✅ บันทึกสำเร็จ ${successCount} คน`, 'success');
      
      // Clear selection
      clearSelection();
      
      // Reload today's records
      await loadTodayRecords();
    } else {
      showNotification('❌ เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  } catch (error) {
    console.error('Error saving late records:', error);
    showNotification('❌ เกิดข้อผิดพลาดในการบันทึก', 'error');
  } finally {
    hideLoading();
  }
}

// Clear selection
function clearSelection() {
  selectedStudents.clear();
  document.querySelectorAll('#studentsTableBody tr').forEach(tr => {
    const cb = tr.querySelector('input[type="checkbox"]');
    const reasonSelect = tr.querySelector('.reason-select');
    if (cb) cb.checked = false;
    if (reasonSelect) {
      reasonSelect.disabled = true;
      reasonSelect.value = 'อื่นๆ';
    }
    tr.classList.remove('checked');
  });
  updateSelectionInfo();
}

// Delete late record
async function deleteLateRecord(lateId) {
  if (!confirm('ต้องการลบบันทึกนี้หรือไม่?')) {
    return;
  }
  
  showLoading('loadingSpinner', '🗑️ กำลังลบบันทึก...');
  
  try {
    const response = await API.deleteLateRecord(lateId);
    
    if (response.success) {
      showNotification('✅ ลบบันทึกสำเร็จ', 'success');
      await loadTodayRecords();
    } else {
      showNotification('❌ ลบบันทึกไม่สำเร็จ: ' + (response.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    showNotification('❌ เกิดข้อผิดพลาดในการลบบันทึก', 'error');
  } finally {
    hideLoading();
  }
}

// Show student detail modal
async function showStudentDetail(studentId) {
  const modal = document.getElementById('detailModal');
  const student = allStudents.find(s => s.student_id == studentId);
  
  if (!student) {
    showNotification('❌ ไม่พบข้อมูลนักเรียน', 'error');
    return;
  }
  
  // Use the same modal from stats.js
  window.showStudentDetailFromStats(student);
}

// Note: hideStudentDetail is exported from stats.js to window object

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  loadPage();
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => history.back());
  
  // Home button
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  // View stats button
  document.getElementById('viewStatsBtn')?.addEventListener('click', () => {
    window.location.href = 'stats.html';
  });
  
  // Class selector
  document.getElementById('classSelect')?.addEventListener('change', function() {
    window.location.href = `check-late.html?class=${encodeURIComponent(this.value)}`;
  });
  
  // Search
  document.getElementById('searchInput')?.addEventListener('input', function() {
    searchStudents(this.value);
  });
  
  // Save button
  document.getElementById('saveBtn')?.addEventListener('click', saveLateRecords);
  
  // Clear button
  document.getElementById('clearBtn')?.addEventListener('click', clearSelection);
  
  // Modal buttons
  document.getElementById('closeModal')?.addEventListener('click', hideLateFormModal);
  document.getElementById('cancelSaveBtn')?.addEventListener('click', hideLateFormModal);
  document.getElementById('confirmSaveBtn')?.addEventListener('click', confirmSave);
  
  // Copy time to all
  document.getElementById('copyTimeBtn')?.addEventListener('click', function() {
    const time = document.getElementById('lateTime').value;
    showNotification(`เวลา ${time} จะถูกใช้สำหรับทุกคนที่เลือก`, 'info');
  });
  
  // Close modal on backdrop click
  document.getElementById('lateFormModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
      hideLateFormModal();
    }
  });
});
