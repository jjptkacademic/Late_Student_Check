// Reusable UI Components

const Components = {
  // Create classroom card
  createClassroomCard(classroom, totalStudents, lateCount) {
    const card = document.createElement('div');
    card.className = 'classroom-card';
    card.onclick = () => {
      window.location.href = `check-late.html?class=${encodeURIComponent(classroom)}`;
    };
    
    card.innerHTML = `
      <div class="classroom-name">${classroom}</div>
      <div class="classroom-info">${totalStudents} คน</div>
      ${lateCount > 0 ? `<div class="classroom-late">${lateCount} ครั้ง</div>` : ''}
    `;
    
    return card;
  },
  
  // Create student checkbox item
  createStudentCheckbox(student) {
    const item = document.createElement('div');
    item.className = 'student-checkbox-item';
    item.dataset.studentId = student.student_id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `student-${student.student_id}`;
    checkbox.value = student.student_id;
    
    const label = document.createElement('label');
    label.htmlFor = `student-${student.student_id}`;
    label.className = 'student-info-text';
    label.innerHTML = `
      <span class="student-code">${student.student_code}</span>
      <span class="student-name">${student.first_name} ${student.last_name}</span>
    `;
    
    // Toggle checked class on change
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        item.classList.add('checked');
      } else {
        item.classList.remove('checked');
      }
    });
    
    // Make entire item clickable
    item.addEventListener('click', function(e) {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });
    
    item.appendChild(checkbox);
    item.appendChild(label);
    
    return item;
  },
  
  // Create today's late record item
  createTodayRecord(record, student) {
    const item = document.createElement('div');
    item.className = 'today-record-item';
    
    item.innerHTML = `
      <div class="record-student">
        ⚠️ <strong>${student.student_code}</strong> ${student.first_name} ${student.last_name}
      </div>
      <div class="record-info">
        <span>⏰ ${record.late_time || '-'}</span>
        ${record.reason ? `<span class="record-reason">💬 ${record.reason}</span>` : ''}
      </div>
      <button class="btn btn-sm btn-outline" onclick="editLateRecord(${record.late_id})">แก้ไข</button>
    `;
    
    return item;
  },
  
  // Create ranking item
  createRankingItem(rank, student, onClick) {
    const item = document.createElement('div');
    item.className = 'ranking-item';
    
    if (rank === 1) item.classList.add('top-1');
    else if (rank === 2) item.classList.add('top-2');
    else if (rank === 3) item.classList.add('top-3');
    
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    
    item.innerHTML = `
      <div class="ranking-left">
        <span class="ranking-rank">${medal} ${rank}.</span>
        <div class="ranking-student">
          <div class="ranking-name">${student.first_name} ${student.last_name}</div>
          <div class="ranking-class">${student.class_room}</div>
        </div>
      </div>
      <div class="ranking-count">${student.total_late} ครั้ง</div>
    `;
    
    if (onClick) {
      item.style.cursor = 'pointer';
      item.onclick = onClick;
    }
    
    return item;
  },
  
  // Create chart bar
  createChartBar(label, value, maxValue) {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    
    bar.innerHTML = `
      <div class="chart-label">${label}</div>
      <div class="chart-bar-container">
        <div class="chart-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="chart-value">${value}</div>
    `;
    
    return bar;
  }
};
