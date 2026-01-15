/**
 * ระบบ Backend API สำหรับเช็คนักเรียนมาสาย - OPTIMIZED VERSION
 * Google Apps Script - Web App API
 * 
 * 🚀 Performance Improvements:
 * - Cache นักเรียนใน CacheService (ลดการอ่าน Sheet)
 * - ดึงเฉพาะ range ที่จำเป็น
 * - ลด loop ซ้อน loop
 * - Pre-process headers
 */

// ตั้งค่าชื่อ Sheet
const SHEET_NAME = {
  STUDENTS: 'Students',
  LATE_RECORDS: 'LateRecords',
  REPORTS: 'Reports'
};

// Blacklist columns
const BLACKLIST_COLUMNS = ['fullname'];

// Cache settings
const CACHE_DURATION = 3600; // 1 hour (students data ไม่ค่อยเปลี่ยน)

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
        result = getStudentsOptimized(params);
        break;
      case 'late-records':
        result = getLateRecordsOptimized(params);
        break;
      case 'late-summary':
        result = getLateSummaryOptimized(params);
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
      case 'clear-cache':
        CacheService.getScriptCache().removeAll(['students_cache', 'students_headers']);
        result = { success: true, message: 'Cache cleared' };
        break;
      default:
        result = { error: 'Invalid endpoint' };
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
        // Clear cache เมื่อเพิ่มนักเรียนใหม่
        CacheService.getScriptCache().removeAll(['students_cache', 'students_headers']);
        break;
      default:
        result = { error: 'Invalid endpoint' };
    }
    
    return createResponse(result);
  } catch (error) {
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * 🚀 OPTIMIZED: GET /students - ดึงข้อมูลนักเรียน
 * ใช้ Cache และลด loop
 */
function getStudentsOptimized(params) {
  const cache = CacheService.getScriptCache();
  
  // พยายามดึงจาก cache ก่อน
  let students;
  let headers;
  
  const cachedStudents = cache.get('students_cache');
  const cachedHeaders = cache.get('students_headers');
  
  if (cachedStudents && cachedHeaders) {
    // ใช้ข้อมูลจาก cache
    students = JSON.parse(cachedStudents);
    headers = JSON.parse(cachedHeaders);
  } else {
    // ไม่มี cache -> ดึงจาก Sheet และ cache ไว้
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: true, count: 0, data: [] };
    }
    
    // ดึงเฉพาะ range ที่มีข้อมูล (ไม่ใช่ทั้ง sheet)
    const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    headers = data[0];
    
    // Pre-filter headers (ทำครั้งเดียว)
    const validHeaderIndices = [];
    const validHeaderNames = [];
    headers.forEach((header, index) => {
      const headerStr = String(header).trim();
      if (headerStr && !BLACKLIST_COLUMNS.includes(headerStr.toLowerCase())) {
        validHeaderIndices.push(index);
        validHeaderNames.push(header);
      }
    });
    
    // Build students array (เร็วขึ้นเพราะไม่ต้อง loop headers ทุกครั้ง)
    students = data.slice(1).map(row => {
      const student = {};
      validHeaderIndices.forEach((colIndex, i) => {
        student[validHeaderNames[i]] = row[colIndex];
      });
      return student;
    });
    
    // Cache ไว้ 1 ชั่วโมง
    try {
      cache.put('students_cache', JSON.stringify(students), CACHE_DURATION);
      cache.put('students_headers', JSON.stringify(headers), CACHE_DURATION);
    } catch (e) {
      // Cache เต็ม - ไม่เป็นไร ยังใช้งานได้
    }
  }
  
  // Filter ตาม parameters (ทำหลัง cache เพราะแต่ละคนอาจขอต่างกัน)
  let filteredStudents = students;
  
  if (params.class_room) {
    filteredStudents = filteredStudents.filter(s => s.class_room === params.class_room);
  }
  
  if (params.grade_level) {
    filteredStudents = filteredStudents.filter(s => s.grade_level == params.grade_level);
  }
  
  return {
    success: true,
    count: filteredStudents.length,
    data: filteredStudents,
    cached: !!cachedStudents // บอกว่ามาจาก cache หรือไม่
  };
}

/**
 * GET /student?id=xxx - ดึงข้อมูลนักเรียนคนเดียว
 */
function getStudentById(studentId) {
  // ใช้ cache จาก getStudentsOptimized
  const allStudents = getStudentsOptimized({});
  const student = allStudents.data.find(s => s.student_id == studentId);
  
  if (!student) {
    return { success: false, error: 'Student not found' };
  }
  
  return {
    success: true,
    data: student
  };
}

/**
 * 🚀 OPTIMIZED: GET /late-records - ดึงบันทึกการมาสาย
 */
function getLateRecordsOptimized(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return { success: true, count: 0, data: [] };
  }
  
  // ดึงเฉพาะ range ที่มีข้อมูล
  const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
  const headers = data[0];
  
  // Pre-filter headers
  const validHeaderIndices = [];
  const validHeaderNames = [];
  headers.forEach((header, index) => {
    const headerStr = String(header).trim();
    if (headerStr) {
      validHeaderIndices.push(index);
      validHeaderNames.push(header);
    }
  });
  
  // Build records array
  let records = data.slice(1).map(row => {
    const record = {};
    validHeaderIndices.forEach((colIndex, i) => {
      record[validHeaderNames[i]] = row[colIndex];
    });
    return record;
  });
  
  // Filter
  if (params.student_id) {
    records = records.filter(r => r.student_id == params.student_id);
  }
  
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
 * 🚀 OPTIMIZED: GET /late-summary - สรุปจำนวนครั้งที่มาสาย
 */
function getLateSummaryOptimized(params) {
  // ใช้ cache students
  const studentsResult = getStudentsOptimized(params);
  let students = studentsResult.data;
  
  // ดึง late records
  const lateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  const lastRow = lateSheet.getLastRow();
  
  if (lastRow <= 1) {
    // ไม่มี late records - return students with 0 late
    return {
      success: true,
      count: students.length,
      data: students.map(s => ({
        ...s,
        total_late: 0,
        late_dates: []
      }))
    };
  }
  
  const lateData = lateSheet.getRange(1, 1, lastRow, lateSheet.getLastColumn()).getValues();
  
  // สร้าง Map ของ late records แยกตาม student_id (เพื่อ lookup เร็ว)
  const lateByStudent = {};
  for (let i = 1; i < lateData.length; i++) {
    const studentId = lateData[i][1]; // student_id column
    const lateDate = lateData[i][2]; // late_date column
    
    if (!lateByStudent[studentId]) {
      lateByStudent[studentId] = [];
    }
    lateByStudent[studentId].push(lateDate);
  }
  
  // Build summary (ไม่ต้อง filter late records ซ้ำๆ)
  const summary = students.map(student => {
    const lateDates = lateByStudent[student.student_id] || [];
    return {
      ...student,
      total_late: lateDates.length,
      late_dates: lateDates
    };
  });
  
  // Sort by total_late descending
  summary.sort((a, b) => b.total_late - a.total_late);
  
  return {
    success: true,
    count: summary.length,
    data: summary,
    cached_students: studentsResult.cached
  };
}

/**
 * POST /late-record - บันทึกการมาสาย
 */
function addLateRecord(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  
  if (!data.student_id) {
    return { success: false, error: 'student_id is required' };
  }
  
  // ตรวจสอบว่านักเรียนมีอยู่จริง (ใช้ cache)
  const studentResult = getStudentById(data.student_id);
  if (!studentResult.success) {
    return { success: false, error: 'Student not found' };
  }
  
  const lastRow = sheet.getLastRow();
  const lateId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
  const lateDate = data.late_date || new Date().toISOString().split('T')[0];
  const lateTime = data.late_time || new Date().toTimeString().split(' ')[0];
  const reason = data.reason || '';
  
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
 */
function addStudent(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.STUDENTS);
  
  if (!data.student_code || !data.first_name || !data.last_name) {
    return { success: false, error: 'student_code, first_name, and last_name are required' };
  }
  
  const lastRow = sheet.getLastRow();
  const studentId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
  
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
 * DELETE /delete-late-record - ลบบันทึกการมาสาย
 */
function deleteLateRecord(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME.LATE_RECORDS);
  
  if (!params.late_id) {
    return { success: false, error: 'late_id is required' };
  }
  
  const lateId = parseInt(params.late_id);
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 1, lastRow, 1).getValues(); // ดึงเฉพาะ column แรก
  
  let rowToDelete = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == lateId) {
      rowToDelete = i + 1;
      break;
    }
  }
  
  if (rowToDelete === -1) {
    return { success: false, error: 'Late record not found' };
  }
  
  sheet.deleteRow(rowToDelete);
  
  return {
    success: true,
    message: 'Late record deleted successfully',
    late_id: lateId
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
 * Helper: แปลงวันที่เป็น String YYYY-MM-DD
 */
function formatDateToString(dateValue) {
  if (!dateValue) return '';
  
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (typeof dateValue === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
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
 * Test function
 */
function testOptimizedAPI() {
  console.time('getStudents');
  const students = getStudentsOptimized({});
  console.timeEnd('getStudents');
  Logger.log('Students:', students.count, 'Cached:', students.cached);
  
  console.time('getLateSummary');
  const summary = getLateSummaryOptimized({});
  console.timeEnd('getLateSummary');
  Logger.log('Summary:', summary.count);
}
