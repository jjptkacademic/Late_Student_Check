# ระบบเช็คนักเรียนมาสาย - Backend API

Google Apps Script Backend สำหรับระบบเช็คนักเรียนมาสาย

## 🚀 วิธี Deploy

### 1. เตรียม Google Sheet
1. สร้าง Google Sheet ชื่อ: `ระบบเช็คนักเรียนมาสาย`
2. สร้าง 3 Tabs:
   - **Students** - Headers: `student_id | student_code | first_name | last_name | class_room | grade_level`
   - **LateRecords** - Headers: `late_id | student_id | late_date | late_time | reason`
   - **Reports** - (ไว้สำหรับรายงาน)

### 2. Setup Apps Script
1. เปิด Google Sheet → **Extensions** → **Apps Script**
2. ลบโค้ดเดิมทั้งหมด
3. Copy โค้ดจากไฟล์ `Code.gs` ทั้งหมด → Paste
4. **Save** (Ctrl+S) → ตั้งชื่อโปรเจค: `Late Student API`

### 3. Deploy เป็น Web App
1. คลิก **Deploy** → **New deployment**
2. เลือก **Web app**
3. ตั้งค่า:
   - **Description**: `Late Student API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (หรือ `Anyone with Google account` ถ้าต้องการจำกัดการเข้าถึง)
4. คลิก **Deploy**
5. **Copy Web App URL** → จะได้ URL คล้ายๆ:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## 📡 API Endpoints

### Base URL
```
https://script.google.com/macros/s/AKfycbxlOLEiNlqv8WPrEzPm455-He-F-Dbzvg2trLaj90KIvN48VAXHr03fJHwdllF2_9x0Ew/exec
```

---

## GET Endpoints

### 1. ดึงรายชื่อนักเรียนทั้งหมด
```
GET ?path=students
```

**Query Parameters (Optional):**
- `class_room` - กรองตามห้องเรียน
- `grade_level` - กรองตามระดับชั้น

**ตัวอย่าง:**
```
GET ?path=students&class_room=4/2
GET ?path=students&grade_level=4
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "student_id": 1,
      "student_code": "13015",
      "first_name": "กรณ์ศุพัชร์",
      "last_name": "กาทอง",
      "class_room": "4/2",
      "grade_level": 4
    }
  ]
}
```

---

### 2. ดึงข้อมูลนักเรียนคนเดียว
```
GET ?path=student&id=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_id": 1,
    "student_code": "13015",
    "first_name": "กรณ์ศุพัชร์",
    "last_name": "กาทอง",
    "class_room": "4/2",
    "grade_level": 4
  }
}
```

---

### 3. ดึงบันทึกการมาสาย
```
GET ?path=late-records
```

**Query Parameters (Optional):**
- `student_id` - กรองตามนักเรียน
- `date_from` - กรองตั้งแต่วันที่ (YYYY-MM-DD)
- `date_to` - กรองถึงวันที่ (YYYY-MM-DD)

**ตัวอย่าง:**
```
GET ?path=late-records&student_id=1
GET ?path=late-records&date_from=2026-01-01&date_to=2026-01-31
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "late_id": 1,
      "student_id": 1,
      "late_date": "2026-01-10",
      "late_time": "08:30:00",
      "reason": "รถติด"
    }
  ]
}
```

---

### 4. รายงานสรุปจำนวนครั้งที่มาสาย
```
GET ?path=late-summary
```

**Query Parameters (Optional):**
- `class_room` - กรองตามห้องเรียน
- `grade_level` - กรองตามระดับชั้น

**ตัวอย่าง:**
```
GET ?path=late-summary&class_room=4/2
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "student_id": 1,
      "student_code": "13015",
      "first_name": "กรณ์ศุพัชร์",
      "last_name": "กาทอง",
      "class_room": "4/2",
      "grade_level": 4,
      "total_late": 5,
      "late_dates": ["2026-01-05", "2026-01-07", "2026-01-10"]
    }
  ]
}
```

---

## POST Endpoints

### 1. บันทึกการมาสาย
```
POST ?path=late-record
Content-Type: application/json

{
  "student_id": 1,
  "late_date": "2026-01-10",
  "late_time": "08:30:00",
  "reason": "รถติด"
}
```

**Required Fields:**
- `student_id` - รหัสนักเรียน

**Optional Fields:**
- `late_date` - วันที่มาสาย (default: วันนี้)
- `late_time` - เวลาที่มาสาย (default: เวลาปัจจุบัน)
- `reason` - เหตุผล

**Response:**
```json
{
  "success": true,
  "message": "Late record added successfully",
  "data": {
    "late_id": 1,
    "student_id": 1,
    "late_date": "2026-01-10",
    "late_time": "08:30:00",
    "reason": "รถติด"
  }
}
```

---

### 2. เพิ่มนักเรียนใหม่
```
POST ?path=student
Content-Type: application/json

{
  "student_code": "13099",
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "class_room": "4/2",
  "grade_level": 4
}
```

**Required Fields:**
- `student_code` - รหัสนักเรียน
- `first_name` - ชื่อ
- `last_name` - นามสกุล

**Optional Fields:**
- `class_room` - ห้องเรียน
- `grade_level` - ระดับชั้น

**Response:**
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": {
    "student_id": 5,
    "student_code": "13099",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "class_room": "4/2",
    "grade_level": 4
  }
}
```

---

## 🧪 ทดสอบ API

### ใช้ Browser (GET only)
```
https://script.google.com/macros/s/AKfycbxlOLEiNlqv8WPrEzPm455-He-F-Dbzvg2trLaj90KIvN48VAXHr03fJHwdllF2_9x0Ew/exec?path=students
```

### ใช้ JavaScript Fetch
```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycbxlOLEiNlqv8WPrEzPm455-He-F-Dbzvg2trLaj90KIvN48VAXHr03fJHwdllF2_9x0Ew/exec';

// GET Example
fetch(API_URL + '?path=students&class_room=4/2')
  .then(res => res.json())
  .then(data => console.log(data));

// POST Example
fetch(API_URL + '?path=late-record', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    student_id: 1,
    reason: 'รถติด'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📝 หมายเหตุ

1. **CORS**: Apps Script รองรับ CORS อัตโนมัติ เรียกใช้จาก Frontend ได้เลย
2. **Rate Limit**: Google Apps Script มี quota limit (6 นาที/คน/วัน)
3. **Performance**: ข้อมูลเยอะมากอาจช้า ควรใช้ cache หรือ pagination
4. **Security**: ถ้าต้องการเพิ่มความปลอดภัย แนะนำใช้ API Key หรือ OAuth

---

## 🔄 Update API

1. แก้ไขโค้ดใน Apps Script
2. **Save**
3. **Deploy** → **Manage deployments**
4. คลิกไอคอน ✏️ (Edit) → เลือก **New version**
5. **Deploy**

URL เดิมจะใช้ได้เหมือนเดิม (ไม่ต้องเปลี่ยน Frontend)

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา
