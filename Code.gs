/**
 * ระบบ Backend API สำหรับเช็คนักเรียนมาสาย
 * Google Apps Script - Web App API
 * 
 * Sheet Structure:
 * - Students: student_id, student_code, first_name, last_name, class_room, grade_level
 * - LateRecords: late_id, student_id, late_date, late_time, reason
 * - Reports: Auto-generated
 */

// ตั้งค่าชื่อ Sheet
const SHEET_NAME = {
  STUDENTS: 'Students',
  LATE_RECORDS: 'LateRecords',
  REPORTS: 'Reports'
};

// Blacklist columns - ไม่ส่งออกผ่าน API
const BLACKLIST_COLUMNS = ['fullname'];

/**
 * Main entry point for GET requests
 */
function doGet(e) {
  const path = e.parameter.path || '';
  const params = e.parameter;
  
  try {
    let result;
    
    switch(path) {
      case 'students':
        result = getStudents(params);
        break;
      case 'late-records':
        result = getLateRecords(params);
        break;
      case 'late-summary':
        result = getLateSummary(params);
        break;
      case 'student':
        result = getStudentById(params.id);
        break;
      case 'add-late-record':
        result = addLateRecord(params);
        break;
      case 'add-student':
        result = addStudent(params);
        break;
      case 'delete-late-record':
        result = deleteLateRecord(params);
        break;
      default:
        result = { error: 'Invalid endpoint', availableEndpoints: ['students', 'late-records', 'late-summary', 'student', 'add-late-record', 'add-student', 'delete-late-record'] };
    }
    
    return createResponse(result);
  } catch (error) {
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  const path = e.parameter.path || '';
  
  try {
    let postData;
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (err) {
      return createResponse({ error: 'Invalid JSON data' }, 400);
    }
    
    let result;
    
    switch(path) {
      case 'late-record':
        result = addLateRecord(postData);
        break;
      case 'student':
        result = addStudent(postData);
        break;
      default:
        result = { error: 'Invalid endpoint', availableEndpoints: ['late-record', 'student'] };
    }
    
    return createResponse(result);
  } catch (error) {
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * GET /students - ดึงข้อมูลนักเรียน
 * Query params: class_room, grade_level
 */
function getStudents(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let students = data.slice(1).map(row => {
    let student = {};
    headers.forEach((header, index) => {
      // กรอง empty header และ blacklist columns
      const headerStr = String(header).trim();
      if (headerStr && !BLACKLIST_COLUMNS.includes(headerStr.toLowerCase())) {
        student[header] = row[index];
      }
    });
    return student;
  });
  
  // กรองตาม class_room
  if (params.class_room) {
    students = students.filter(s => s.class_room === params.class_room);
  }
  
  // กรองตาม grade_level
  if (params.grade_level) {
    students = students.filter(s => s.grade_level == params.grade_level);
  }
  
  return {
    success: true,
    count: students.length,
    data: students
  };
}

/**
 * GET /student?id=xxx - ดึงข้อมูลนักเรียนคนเดียว
 */
function getStudentById(studentId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const studentRow = data.slice(1).find(row => row[0] == studentId);
  
  if (!studentRow) {
    return { success: false, error: 'Student not found' };
  }
  
  let student = {};
  headers.forEach((header, index) => {
    // กรอง empty header และ blacklist columns
    const headerStr = String(header).trim();
    if (headerStr && !BLACKLIST_COLUMNS.includes(headerStr.toLowerCase())) {
      student[header] = studentRow[index];
    }
  });
  
  return {
    success: true,
    data: student
  };
}

/**
 * GET /late-records - ดึงบันทึกการมาสาย
 * Query params: student_id, date_from, date_to
 */
function getLateRecords(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { success: true, count: 0, data: [] };
  }
  
  const headers = data[0];
  
  let records = data.slice(1).map(row => {
    let record = {};
    headers.forEach((header, index) => {
      // กรอง empty header
      const headerStr = String(header).trim();
      if (headerStr) {
        record[header] = row[index];
      }
    });
    return record;
  });
  
  // กรองตาม student_id
  if (params.student_id) {
    records = records.filter(r => r.student_id == params.student_id);
  }
  
  // กรองตามวันที่
  if (params.date_from) {
    records = records.filter(r => {
      const recordDate = formatDateToString(r.late_date);
      return recordDate >= params.date_from;
    });
  }
  
  if (params.date_to) {
    records = records.filter(r => {
      const recordDate = formatDateToString(r.late_date);
      return recordDate <= params.date_to;
    });
  }
  
  return {
    success: true,
    count: records.length,
    data: records
  };
}

/**
 * GET /late-summary - สรุปจำนวนครั้งที่มาสาย
 * Query params: class_room, grade_level
 */
function getLateSummary(params) {
  const studentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  const lateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  
  const studentsData = studentsSheet.getDataRange().getValues();
  const lateData = lateSheet.getDataRange().getValues();
  
  const studentsHeaders = studentsData[0];
  const lateHeaders = lateData[0];
  
  // แปลงข้อมูลนักเรียนเป็น object
  let students = studentsData.slice(1).map(row => {
    let student = {};
    studentsHeaders.forEach((header, index) => {
      student[header] = row[index];
    });
    return student;
  });
  
  // กรองนักเรียนตาม params
  if (params.class_room) {
    students = students.filter(s => s.class_room === params.class_room);
  }
  if (params.grade_level) {
    students = students.filter(s => s.grade_level == params.grade_level);
  }
  
  // นับจำนวนครั้งที่สายของแต่ละคน
  const summary = students.map(student => {
    const lateRecords = lateData.slice(1)
      .filter(row => row[1] == student.student_id)
      .map(row => {
        let record = {};
        lateHeaders.forEach((header, index) => {
          record[header] = row[index];
        });
        return record;
      });
    
    // สร้าง summary object โดยไม่รวม blacklist columns
    const summaryObj = {
      total_late: lateRecords.length,
      late_dates: lateRecords.map(r => r.late_date)
    };
    
    // เพิ่ม student data ที่ไม่อยู่ใน blacklist และไม่เป็น empty
    Object.keys(student).forEach(key => {
      const keyStr = String(key).trim();
      if (keyStr && !BLACKLIST_COLUMNS.includes(keyStr.toLowerCase())) {
        summaryObj[key] = student[key];
      }
    });
    
    return summaryObj;
  });
  
  // เรียงตามจำนวนครั้งที่สายมากไปน้อย
  summary.sort((a, b) => b.total_late - a.total_late);
  
  return {
    success: true,
    count: summary.length,
    data: summary
  };
}

/**
 * POST /late-record - บันทึกการมาสาย
 * Body: { student_id, late_date, late_time, reason }
 */
function addLateRecord(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  
  // Validate required fields
  if (!data.student_id) {
    return { success: false, error: 'student_id is required' };
  }
  
  // ตรวจสอบว่านักเรียนมีอยู่จริง
  const studentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  const studentData = studentSheet.getDataRange().getValues();
  const studentExists = studentData.slice(1).some(row => row[0] == data.student_id);
  
  if (!studentExists) {
    return { success: false, error: 'Student not found' };
  }
  
  // สร้าง late_id ใหม่
  const lastRow = sheet.getLastRow();
  const lateId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  // กำหนดค่า default
  const lateDate = data.late_date || new Date().toISOString().split('T')[0];
  const lateTime = data.late_time || new Date().toTimeString().split(' ')[0];
  const reason = data.reason || '';
  
  // เพิ่มข้อมูล
  sheet.appendRow([
    lateId,
    data.student_id,
    lateDate,
    lateTime,
    reason
  ]);
  
  return {
    success: true,
    message: 'Late record added successfully',
    data: {
      late_id: lateId,
      student_id: data.student_id,
      late_date: lateDate,
      late_time: lateTime,
      reason: reason
    }
  };
}

/**
 * POST /student - เพิ่มนักเรียนใหม่
 * Body: { student_code, first_name, last_name, class_room, grade_level }
 */
function addStudent(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  
  // Validate required fields
  if (!data.student_code || !data.first_name || !data.last_name) {
    return { success: false, error: 'student_code, first_name, and last_name are required' };
  }
  
  // สร้าง student_id ใหม่
  const lastRow = sheet.getLastRow();
  const studentId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  // เพิ่มข้อมูล
  sheet.appendRow([
    studentId,
    data.student_code,
    data.first_name,
    data.last_name,
    data.class_room || '',
    data.grade_level || ''
  ]);
  
  return {
    success: true,
    message: 'Student added successfully',
    data: {
      student_id: studentId,
      student_code: data.student_code,
      first_name: data.first_name,
      last_name: data.last_name,
      class_room: data.class_room,
      grade_level: data.grade_level
    }
  };
}

/**
 * สร้าง Response แบบ JSON พร้อม CORS headers
 */
function createResponse(data, statusCode = 200) {
  const output = JSON.stringify(data);
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * DELETE /delete-late-record - ลบบันทึกการมาสาย
 * Query params: { late_id }
 */
function deleteLateRecord(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  
  // Validate required fields
  if (!params.late_id) {
    return { success: false, error: 'late_id is required' };
  }
  
  const lateId = parseInt(params.late_id);
  const data = sheet.getDataRange().getValues();
  
  // Find row with late_id
  let rowToDelete = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == lateId) {
      rowToDelete = i + 1; // +1 เพราะ sheet index เริ่มที่ 1
      break;
    }
  }
  
  if (rowToDelete === -1) {
    return { success: false, error: 'Late record not found' };
  }
  
  // ลบแถว
  sheet.deleteRow(rowToDelete);
  
  return {
    success: true,
    message: 'Late record deleted successfully',
    late_id: lateId
  };
}

/**
 * Helper: แปลงวันที่เป็น String YYYY-MM-DD
 */
function formatDateToString(dateValue) {
  if (!dateValue) return '';
  
  // ถ้าเป็น Date object แล้ว
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // ถ้าเป็น string อยู่แล้ว
  if (typeof dateValue === 'string') {
    // ถ้าเป็นรูปแบบ YYYY-MM-DD อยู่แล้ว
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // ลองแปลงเป็น Date แล้วแปลงกลับ
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  return String(dateValue);
}

/**
 * Test function - ลบได้หลัง deploy
 */
function testAPI() {
  // Test GET students
  Logger.log('Test GET /students');
  const students = getStudents({});
  Logger.log(students);
  
  // Test GET late-summary
  Logger.log('Test GET /late-summary');
  const summary = getLateSummary({});
  Logger.log(summary);
}
