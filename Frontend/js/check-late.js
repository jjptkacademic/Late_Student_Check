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
  
  showLoading();
  startClock();
  
  try {
    await Promise.all([
      loadStudents(),
      loadTodayRecords(),
      loadClassrooms()
    ]);
  } catch (error) {
    console.error('Error loading page:', error);
    showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  } finally {
    hideLoading();
  }
}

// Load students for current class
async function loadStudents() {
  const response = await API.getStudents({ class_room: currentClass });
  
  if (response.success) {
    allStudents = response.data;
    renderStudentsList(allStudents);
  }
}

// Load today's late records
async function loadTodayRecords() {
  const today = getCurrentDate();
  const response = await API.getLateRecords({
    date_from: today,
    date_to: today
  });
  
  if (response.success) {
    todayRecords = response.data.filter(r => {
      const student = allStudents.find(s => s.student_id === r.student_id);
      return student && student.class_room === currentClass;
    });
    renderTodayRecords();
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
  const list = document.getElementById('studentsList');
  list.innerHTML = '';
  
  students.forEach(student => {
    const item = Components.createStudentCheckbox(student);
    const checkbox = item.querySelector('input[type="checkbox"]');
    
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        selectedStudents.add(parseInt(this.value));
      } else {
        selectedStudents.delete(parseInt(this.value));
      }
      updateSelectionInfo();
    });
    
    list.appendChild(item);
  });
}

// Render today's records
function renderTodayRecords() {
  const section = document.getElementById('todayRecordsSection');
  const list = document.getElementById('todayRecordsList');
  const count = document.getElementById('todayCount');
  
  if (todayRecords.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  count.textContent = todayRecords.length;
  list.innerHTML = '';
  
  todayRecords.forEach(record => {
    const student = allStudents.find(s => s.student_id === record.student_id);
    if (student) {
      const item = Components.createTodayRecord(record, student);
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
      student.student_code.toLowerCase().includes(searchText) ||
      student.first_name.toLowerCase().includes(searchText) ||
      student.last_name.toLowerCase().includes(searchText)
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
  
  // Show modal for time and reason
  showLateFormModal();
}

// Show late form modal
function showLateFormModal() {
  const modal = document.getElementById('lateFormModal');
  const timeInput = document.getElementById('lateTime');
  const reasonSelect = document.getElementById('lateReason');
  const customReason = document.getElementById('customReason');
  
  // Set current time as default
  timeInput.value = getCurrentTime();
  reasonSelect.value = '';
  customReason.style.display = 'none';
  customReason.value = '';
  
  modal.style.display = 'flex';
  
  // Handle reason select change
  reasonSelect.onchange = function() {
    if (this.value === 'other') {
      customReason.style.display = 'block';
      customReason.focus();
    } else {
      customReason.style.display = 'none';
    }
  };
}

// Hide late form modal
function hideLateFormModal() {
  document.getElementById('lateFormModal').style.display = 'none';
}

// Confirm and save
async function confirmSave() {
  const timeInput = document.getElementById('lateTime');
  const reasonSelect = document.getElementById('lateReason');
  const customReason = document.getElementById('customReason');
  
  const time = timeInput.value;
  let reason = reasonSelect.value === 'other' ? customReason.value : reasonSelect.value;
  
  if (!time) {
    showNotification('กรุณาระบุเวลา', 'warning');
    return;
  }
  
  showLoading();
  
  try {
    const date = getCurrentDate();
    const promises = [];
    
    for (const studentId of selectedStudents) {
      promises.push(
        API.addLateRecord({
          student_id: studentId,
          late_date: date,
          late_time: time,
          reason: reason || ''
        })
      );
    }
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 0) {
      showNotification(`บันทึกสำเร็จ ${successCount} คน`, 'success');
      
      // Clear selection
      clearSelection();
      
      // Reload today's records
      await loadTodayRecords();
      
      // Hide modal
      hideLateFormModal();
    } else {
      showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  } catch (error) {
    console.error('Error saving late records:', error);
    showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
  } finally {
    hideLoading();
  }
}

// Clear selection
function clearSelection() {
  selectedStudents.clear();
  document.querySelectorAll('#studentsList input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.student-checkbox-item').classList.remove('checked');
  });
  updateSelectionInfo();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  loadPage();
  
  // Back button
  document.getElementById('backBtn')?.addEventListener('click', () => history.back());
  
  // Home button
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
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
