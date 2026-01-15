// API Configuration
const API_URL = 'https://script.google.com/macros/s/AKfycbyCg4YURWkZj01-wUI8psbwlNVGSHD4qW1NGEuDOgUF-meMsvbprCRsqxqvwv2X7OfLrg/exec';

console.log('🔧 API Helper loaded - Version 2.0 with clearCache');

// API Helper Functions
const API = {
  // GET: ดึงรายชื่อนักเรียนทั้งหมด
  async getStudents(filters = {}, forceRefresh = false) {
    const params = new URLSearchParams({ path: 'students', ...filters });
    // เพิ่ม timestamp เพื่อ bypass cache (ถ้า forceRefresh = true)
    if (forceRefresh) {
      params.append('_t', Date.now());
    }
    const response = await fetch(`${API_URL}?${params}`);
    return response.json();
  },

  // GET: ดึงข้อมูลนักเรียนคนเดียว
  async getStudent(studentId, forceRefresh = false) {
    const params = new URLSearchParams({ path: 'student', id: studentId });
    if (forceRefresh) {
      params.append('_t', Date.now());
    }
    const response = await fetch(`${API_URL}?${params}`);
    return response.json();
  },

  // GET: ดึงบันทึกการมาสาย
  async getLateRecords(filters = {}, forceRefresh = false) {
    const params = new URLSearchParams({ path: 'late-records', ...filters });
    if (forceRefresh) {
      params.append('_t', Date.now());
    }
    const response = await fetch(`${API_URL}?${params}`);
    return response.json();
  },

  // GET: รายงานสรุปจำนวนครั้งที่มาสาย
  async getLateSummary(filters = {}, forceRefresh = false) {
    const params = new URLSearchParams({ path: 'late-summary', ...filters });
    if (forceRefresh) {
      params.append('_t', Date.now());
    }
    const response = await fetch(`${API_URL}?${params}`);
    return response.json();
  },

  // POST: บันทึกการมาสาย
  async addLateRecord(data) {
    const response = await fetch(`${API_URL}?path=late-record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // POST: เพิ่มนักเรียนใหม่
  async addStudent(data) {
    const response = await fetch(`${API_URL}?path=student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 🔄 CLEAR CACHE: เรียกใช้เมื่อกดปุ่ม Refresh
  async clearCache() {
    console.log('🔄 Calling clearCache API...');
    const url = `${API_URL}?path=clear-cache`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('✅ clearCache result:', result);
    return result;
  }
};

// ตัวอย่างการใช้งาน
async function examples() {
  try {
    // ดึงนักเรียนทั้งหมด
    const allStudents = await API.getStudents();
    console.log('All Students:', allStudents);

    // ดึงนักเรียนห้อง 4/2
    const class42 = await API.getStudents({ class_room: '4/2' });
    console.log('Class 4/2:', class42);

    // ดึงข้อมูลนักเรียนคนเดียว
    const student = await API.getStudent(1);
    console.log('Student #1:', student);

    // บันทึกการมาสาย
    const lateRecord = await API.addLateRecord({
      student_id: 1,
      reason: 'รถติด'
    });
    console.log('Late Record:', lateRecord);

    // ดึงรายงานสรุป
    const summary = await API.getLateSummary({ class_room: '4/2' });
    console.log('Late Summary:', summary);

  } catch (error) {
    console.error('API Error:', error);
  }
}
