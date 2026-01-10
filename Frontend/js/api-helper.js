// API Helper - copied from root and updated
const API_URL = CONFIG.API_URL;

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

  // POST: บันทึกการมาสาย
  async addLateRecord(data) {
    try {
      const response = await fetch(`${API_URL}?path=late-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding late record:', error);
      return { success: false, error: error.message };
    }
  },

  // POST: เพิ่มนักเรียนใหม่
  async addStudent(data) {
    try {
      const response = await fetch(`${API_URL}?path=student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, error: error.message };
    }
  }
};
