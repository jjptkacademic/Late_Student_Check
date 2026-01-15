// API Helper - copied from root and updated
const API_URL = CONFIG.API_URL;

console.log('🔧 API Helper loaded - Version 2.1 with clearCache');

const API = {
  // GET: ดึงรายชื่อนักเรียนทั้งหมด
  async getStudents(filters = {}) {
    try {
      const params = new URLSearchParams({ path: 'students', ...filters });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, error: error.message };
    }
  },

  // GET: ดึงข้อมูลนักเรียนคนเดียว
  async getStudent(studentId) {
    try {
      const params = new URLSearchParams({ path: 'student', id: studentId });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching student:', error);
      return { success: false, error: error.message };
    }
  },

  // GET: ดึงบันทึกการมาสาย
  async getLateRecords(filters = {}) {
    try {
      const params = new URLSearchParams({ path: 'late-records', ...filters });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching late records:', error);
      return { success: false, error: error.message };
    }
  },

  // GET: รายงานสรุปจำนวนครั้งที่มาสาย
  async getLateSummary(filters = {}) {
    try {
      const params = new URLSearchParams({ path: 'late-summary', ...filters });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching late summary:', error);
      return { success: false, error: error.message };
    }
  },

  // DELETE: ลบบันทึกการมาสาย
  async deleteLateRecord(lateId) {
    try {
      const params = new URLSearchParams({
        path: 'delete-late-record',
        late_id: lateId
      });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting late record:', error);
      return { success: false, error: error.message };
    }
  },

  // POST: บันทึกการมาสาย
  async addLateRecord(data) {
    try {
      // ใช้ GET แทน POST เพื่อหลีกเลี่ยง CORS
      const params = new URLSearchParams({
        path: 'add-late-record',
        student_id: data.student_id,
        late_date: data.late_date || '',
        late_time: data.late_time || '',
        reason: data.reason || ''
      });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding late record:', error);
      return { success: false, error: error.message };
    }
  },

  // POST: เพิ่มนักเรียนใหม่
  async addStudent(data) {
    try {
      // ใช้ GET แทน POST เพื่อหลีกเลี่ยง CORS
      const params = new URLSearchParams({
        path: 'add-student',
        student_code: data.student_code,
        first_name: data.first_name,
        last_name: data.last_name,
        class_room: data.class_room || '',
        grade_level: data.grade_level || ''
      });
      const response = await fetch(`${API_URL}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔄 CLEAR CACHE: ล้าง cache บน server
  async clearCache() {
    try {
      console.log('🔄 Calling clearCache API...');
      const url = `${API_URL}?path=clear-cache`;
      console.log('📡 URL:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('✅ clearCache result:', result);
      return result;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { success: false, error: error.message };
    }
  }
};
