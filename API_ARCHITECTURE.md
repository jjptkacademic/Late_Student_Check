# API Architecture Diagram

## 1. ภาพรวมระบบ (System Overview)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                     (HTML/JavaScript)                           │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │  หน้าบันทึก  │  │  หน้ารายงาน   │  │  จัดการนักเรียน  │       │
│  │  การมาสาย   │  │  สรุปสถิติ    │  │                 │       │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘       │
│         │                │                    │                │
│         └────────────────┴────────────────────┘                │
│                          │                                     │
│                   ┌──────▼──────┐                              │
│                   │ api-helper.js│                              │
│                   │  (API Client) │                              │
│                   └──────┬──────┘                              │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                    HTTP Request
                  (GET/POST/DELETE)
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│               GOOGLE APPS SCRIPT (Backend)                      │
│                      Code.gs                                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              HTTP ENTRY POINTS                        │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │      │
│  │  │ doGet()  │  │ doPost() │  │doOptions()│           │      │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │      │
│  └───────┼─────────────┼─────────────┼──────────────────┘      │
│          │             │             │                         │
│  ┌───────▼─────────────▼─────────────▼──────────────────┐      │
│  │              ROUTER (path parameter)                 │      │
│  │                                                      │      │
│  │  switch(path) {                                      │      │
│  │    case 'students':     → getStudents()             │      │
│  │    case 'student':      → getStudentById()          │      │
│  │    case 'late-records': → getLateRecords()          │      │
│  │    case 'late-summary': → getLateSummary()          │      │
│  │    case 'late-record':  → addLateRecord()           │      │
│  │    case 'student':      → addStudent()              │      │
│  │  }                                                   │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                      │
│  ┌──────────────────────▼───────────────────────────────┐      │
│  │           BUSINESS LOGIC LAYER                       │      │
│  │                                                      │      │
│  │  • Data validation                                   │      │
│  │  • Filtering & sorting                               │      │
│  │  • Auto-increment IDs                                │      │
│  │  • Blacklist filtering                               │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                      │
│                   SpreadsheetApp API                           │
│                         │                                      │
└─────────────────────────┼──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│                   GOOGLE SHEETS (Database)                      │
│                                                                 │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐      │
│  │   Students   │  │  LateRecords    │  │   Reports    │      │
│  ├──────────────┤  ├─────────────────┤  ├──────────────┤      │
│  │ student_id   │  │ late_id         │  │ (Generated)  │      │
│  │ student_code │  │ student_id (FK) │  │              │      │
│  │ first_name   │  │ late_date       │  │              │      │
│  │ last_name    │  │ late_time       │  │              │      │
│  │ class_room   │  │ reason          │  │              │      │
│  │ grade_level  │  │                 │  │              │      │
│  └──────────────┘  └─────────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. API Request Flow (ขั้นตอนการทำงาน)

### 2.1 GET Request - ดึงข้อมูลนักเรียน

```
CLIENT                    GOOGLE APPS SCRIPT               GOOGLE SHEETS
  │                              │                              │
  │  GET /students?class_room=4/2│                              │
  ├─────────────────────────────►│                              │
  │                              │                              │
  │                              │  1. doGet(e) receives        │
  │                              │     e.parameter = {          │
  │                              │       path: 'students',      │
  │                              │       class_room: '4/2'      │
  │                              │     }                        │
  │                              │                              │
  │                              │  2. Route to getStudents()   │
  │                              │                              │
  │                              │  SpreadsheetApp.getSheet()   │
  │                              ├─────────────────────────────►│
  │                              │                              │
  │                              │◄─────────────────────────────┤
  │                              │  Return all rows             │
  │                              │                              │
  │                              │  3. Filter by class_room     │
  │                              │     students.filter(...)     │
  │                              │                              │
  │                              │  4. Remove blacklist columns │
  │                              │                              │
  │                              │  5. Format JSON response     │
  │                              │     {                        │
  │◄─────────────────────────────┤       success: true,         │
  │  Response JSON               │       count: 25,             │
  │                              │       data: [...]            │
  │                              │     }                        │
  │                              │                              │
```

---

### 2.2 POST Request - บันทึกการมาสาย

```
CLIENT                    GOOGLE APPS SCRIPT               GOOGLE SHEETS
  │                              │                              │
  │  POST /late-record           │                              │
  │  Body: {                     │                              │
  │    student_id: 1,            │                              │
  │    reason: "รถติด"           │                              │
  │  }                           │                              │
  ├─────────────────────────────►│                              │
  │                              │                              │
  │                              │  1. doPost(e) receives       │
  │                              │     path: 'late-record'      │
  │                              │     postData: {...}          │
  │                              │                              │
  │                              │  2. Parse JSON body          │
  │                              │                              │
  │                              │  3. Route to addLateRecord() │
  │                              │                              │
  │                              │  4. Validate student exists  │
  │                              │  getSheetByName('Students')  │
  │                              ├─────────────────────────────►│
  │                              │◄─────────────────────────────┤
  │                              │  Check student_id exists     │
  │                              │                              │
  │                              │  5. Generate new late_id     │
  │                              │     (auto-increment)         │
  │                              │                              │
  │                              │  6. Set default values       │
  │                              │     late_date = today        │
  │                              │     late_time = now          │
  │                              │                              │
  │                              │  sheet.appendRow([...])      │
  │                              ├─────────────────────────────►│
  │                              │                              │
  │◄─────────────────────────────┤  7. Return success           │
  │  {                           │     {                        │
  │    success: true,            │       success: true,         │
  │    message: "...",           │       data: {...}            │
  │    data: {...}               │     }                        │
  │  }                           │                              │
```

---

## 3. API Endpoints Map (แผนที่ API)

```
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                          │
└─────────────────────────────────────────────────────────────┘

GET Requests
├── /students
│   ├── Parameters: class_room, grade_level
│   ├── Returns: List of students
│   └── Example: ?path=students&class_room=4/2
│
├── /student
│   ├── Parameters: id (required)
│   ├── Returns: Single student object
│   └── Example: ?path=student&id=1
│
├── /late-records
│   ├── Parameters: student_id, date_from, date_to
│   ├── Returns: List of late records
│   └── Example: ?path=late-records&student_id=1
│
├── /late-summary
│   ├── Parameters: class_room, grade_level
│   ├── Returns: Summary with total_late count (sorted desc)
│   └── Example: ?path=late-summary&class_room=4/2
│
└── /delete-late-record
    ├── Parameters: late_id (required)
    ├── Returns: Success/error message
    └── Example: ?path=delete-late-record&late_id=5

POST Requests
├── /late-record
│   ├── Body: { student_id, late_date?, late_time?, reason? }
│   ├── Returns: Created record with generated late_id
│   └── Validates: student_id exists
│
└── /student
    ├── Body: { student_code, first_name, last_name, class_room?, grade_level? }
    ├── Returns: Created student with generated student_id
    └── Validates: Required fields present
```

---

## 4. Data Flow Example (ตัวอย่างการไหลของข้อมูล)

### บันทึกนักเรียนมาสาย - แบบเต็ม

```
┌──────────┐         ┌─────────────┐         ┌──────────────┐
│ Frontend │         │ api-helper  │         │ Code.gs      │
│  (Form)  │         │             │         │              │
└────┬─────┘         └──────┬──────┘         └──────┬───────┘
     │                      │                        │
     │  User clicks         │                        │
     │  "บันทึก"            │                        │
     │                      │                        │
     ├──────────────────────►                        │
     │ API.addLateRecord({  │                        │
     │   student_id: 5,     │                        │
     │   reason: "ตื่นสาย"  │                        │
     │ })                   │                        │
     │                      │                        │
     │                      ├────────────────────────►
     │                      │ POST /late-record      │
     │                      │ Content-Type: JSON     │
     │                      │ Body: {student_id: 5...}
     │                      │                        │
     │                      │         ┌──────────────┴────────┐
     │                      │         │ 1. doPost() receives  │
     │                      │         │ 2. Parse JSON         │
     │                      │         │ 3. Validate student   │
     │                      │         │ 4. Generate late_id   │
     │                      │         │ 5. appendRow()        │
     │                      │         │ 6. Return response    │
     │                      │         └──────────────┬────────┘
     │                      │◄────────────────────────┤
     │                      │ {                       │
     │                      │   success: true,        │
     │                      │   late_id: 42           │
     │◄──────────────────────   data: {...}           │
     │ Promise resolves     │ }                       │
     │                      │                         │
     ├───────────────┐      │                         │
     │ Show success  │      │                         │
     │ alert         │      │                         │
     └───────────────┘      │                         │
```

---

## 5. Security & Features (ความปลอดภัยและฟีเจอร์)

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CORS Support                                        │
│     └─► doOptions() handles preflight requests         │
│                                                         │
│  2. Data Validation                                     │
│     ├─► Required field checking                         │
│     ├─► Foreign key validation (student exists?)       │
│     └─► Data type validation                            │
│                                                         │
│  3. Blacklist Filtering                                 │
│     └─► Prevents sensitive columns from being exposed  │
│         (e.g., 'fullname' column)                       │
│                                                         │
│  4. Auto-increment IDs                                  │
│     ├─► Prevents ID collision                           │
│     └─► Uses sheet.getLastRow() for generation         │
│                                                         │
│  5. Error Handling                                      │
│     ├─► Try-catch blocks                                │
│     ├─► Structured error responses                      │
│     └─► HTTP status codes (200, 400, 500)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Frontend-Backend Integration

```
┌──────────────────────────────────────────────────────────┐
│              api-helper.js (Client Library)              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  const API = {                                           │
│                                                          │
│    getStudents(filters) ───────────┐                    │
│                                    │                    │
│    getStudent(id) ─────────────────┼──► URL Parameters  │
│                                    │                    │
│    getLateRecords(filters) ────────┤                    │
│                                    │                    │
│    getLateSummary(filters) ────────┘                    │
│                                                          │
│                                                          │
│    addLateRecord(data) ────────────┐                    │
│                                    ├──► POST Body (JSON) │
│    addStudent(data) ───────────────┘                    │
│                                                          │
│  }                                                       │
│                                                          │
│  All methods return: Promise<Response>                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
         │
         │ fetch()
         ▼
┌──────────────────────────────────────────────────────────┐
│     https://script.google.com/.../exec?path=xxx          │
└──────────────────────────────────────────────────────────┘
```

