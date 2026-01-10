# Frontend Design - ระบบเช็คนักเรียนมาสาย

## 📱 โครงสร้างหน้าจอ (Screen Structure)

### **1. หน้า Login** (`login.html`)

#### Layout
```
┌─────────────────────────────────────┐
│                                     │
│         🏫                          │
│   ระบบเช็คนักเรียนมาสาย              │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ 🔑 รหัสผ่าน                 │  │
│   │ [________________]          │  │
│   │                             │  │
│   │      [🔓 เข้าสู่ระบบ]      │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

#### Features
- Simple PIN authentication
- จำ session ใน localStorage
- Auto-redirect ถ้า login แล้ว

---

### **2. หน้าหลัก Dashboard** (`dashboard.html`)

#### Layout - Option A: Grid Icons
```
┌─────────────────────────────────────────────┐
│  🏫 ระบบเช็คนักเรียนมาสาย                   │
│  👤 ครูผู้สอน              [🚪 Logout]     │
├─────────────────────────────────────────────┤
│                                             │
│  🎯 เลือกห้องเรียน                          │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 4/1  │ │ 4/2  │ │ 4/3  │ │ 4/4  │      │
│  │ 25 คน│ │ 28 คน│ │ 26 คน│ │ 27 คน│      │
│  │ 🔴 5 │ │ 🔴 3 │ │ 🔴 7 │ │ 🔴 2 │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ 4/5  │ │ 4/6  │ │ 4/7  │               │
│  │ 29 คน│ │ 24 คน│ │ 30 คน│               │
│  │ 🔴 4 │ │ 🔴 6 │ │ 🔴 1 │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ 📊 ดูสถิติและ Ranking ทั้งหมด        │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

#### Layout - Option B: List View
```
┌─────────────────────────────────────────────┐
│  🏫 ระบบเช็คนักเรียนมาสาย                   │
│  👤 ครูผู้สอน              [🚪 Logout]     │
├─────────────────────────────────────────────┤
│                                             │
│  📚 รายการห้องเรียน                         │
│  [📊 ดูสถิติทั้งหมด]                        │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ ห้อง 4/1 (25 คน) - สายวันนี้ 5 คน    │ →│
│  │ มาสายสะสม: 45 ครั้ง                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ ห้อง 4/2 (28 คน) - สายวันนี้ 3 คน    │ →│
│  │ มาสายสะสม: 32 ครั้ง                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ ห้อง 4/3 (26 คน) - สายวันนี้ 7 คน    │ →│
│  │ มาสายสะสม: 58 ครั้ง                  │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

#### Features
- แสดงจำนวนนักเรียนต่อห้อง
- Badge แสดงจำนวนที่มาสายวันนี้ (สีแดง)
- คลิกห้องไปหน้าเช็คชื่อ
- ปุ่มดูสถิติรวม

---

### **3. หน้าเช็คชื่อ Classroom** (`check-late.html`)

#### Layout
```
┌──────────────────────────────────────────────────┐
│ ⬅️ Back  🏠 Home          ห้อง: [4/2 ▼]         │
├──────────────────────────────────────────────────┤
│ 📅 วันที่: 10 มกราคม 2568  ⏰ เวลา 08:30        │
│                                                  │
│ ✅ นักเรียนที่บันทึกมาสายวันนี้ (3 คน)          │
│ ┌────────────────────────────────────────────┐  │
│ │ ⚠️ 13015 กรณ์ศุพัชร์ กาทอง    08:25  [แก้ไข]│  │
│ │    เหตุผล: รถติด                           │  │
│ │                                            │  │
│ │ ⚠️ 13018 ณัฐพล ผู้มีศิล       08:30  [แก้ไข]│  │
│ │    เหตุผล: ตื่นสาย                         │  │
│ │                                            │  │
│ │ ⚠️ 13021 ธนัช ไหมละออง        08:20  [แก้ไข]│  │
│ │    เหตุผล: -                               │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ 📝 บันทึกการมาสาย (เลือกได้หลายคน)              │
│ [🔍 ค้นหานักเรียน...]                           │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │☐ 13015 นายกรณ์ศุพัชร์ กาทอง                │  │
│ │☐ 13018 นายณัฐพล ผู้มีศิล                   │  │
│ │☐ 13021 นายธนัช ไหมละออง                    │  │
│ │☑ 13059 นายชัยวัฒน์ วารีบ่อ                 │  │
│ │   ├ เวลา: [08:30]  📋 คัดลอกเวลาให้ทุกคน   │  │
│ │   └ เหตุผล: [รถติด ▼]                      │  │
│ │             • รถติด                         │  │
│ │             • ตื่นสาย                       │  │
│ │             • ธุระส่วนตัว                   │  │
│ │             • ป่วย                          │  │
│ │             • อื่นๆ (พิมพ์เอง)              │  │
│ │☐ 13062 นายสมชาย ใจดี                       │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ 📌 เลือกแล้ว: 1 คน                              │
│                                                  │
│         [💾 บันทึกทั้งหมด] [🗑️ ล้างการเลือก]   │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Features
- **แสดงรายการที่บันทึกแล้ววันนี้** (ด้านบน - สีเหลือง/ส้ม)
- **Checkbox** เลือกหลายคนได้
- **เวลา** - Auto-fill เวลาปัจจุบัน, แก้ไขได้
- **คัดลอกเวลา** - ตั้งเวลาเดียวกันให้ทุกคนที่เลือก
- **Combo box เหตุผล** - มี preset + พิมพ์เองได้
- **ค้นหา** - กรองตามรหัส/ชื่อ/นามสกุล
- **Back** - กลับหน้าก่อนหน้า
- **Home** - กลับ Dashboard
- **Switch Class** - เปลี่ยนห้องโดยไม่ต้องกลับหน้าหลัก
- **Auto-save draft** - บันทึกชั่วคราวใน localStorage
- **แก้ไขรายการเก่า** - คลิกที่รายการบนสุดเพื่อแก้ไข

---

### **4. หน้าสถิติ/Ranking** (`stats.html`)

#### Layout
```
┌──────────────────────────────────────────────────┐
│ ⬅️ Back  🏠 Home                                 │
├──────────────────────────────────────────────────┤
│ 📊 สถิติการมาสาย                                 │
│                                                  │
│ ห้อง: [ทั้งหมด ▼]  ช่วง: [เดือนนี้ ▼] [🔄]     │
│                                                  │
│ ┌─────────────────┬─────────────────────────┐   │
│ │ 📈 สรุปภาพรวม   │ 🏆 TOP 10 มาสายบ่อยสุด  │   │
│ ├─────────────────┼─────────────────────────┤   │
│ │ ทั้งหมด: 125 ครั้ง│ 🥇 1. กรณ์ศุพัชร์ (4/2)│   │ <- คลิกดูรายละเอียด
│ │ นักเรียน: 45 คน │    12 ครั้ง  [รายละเอียด]│   │
│ │ เฉลี่ย: 2.7 ครั้ง│                         │   │
│ │                 │ 🥈 2. ณัฐพล (4/2)       │   │
│ │ ห้องสายสุด:     │    10 ครั้ง  [รายละเอียด]│   │
│ │ 4/3 (58 ครั้ง)  │                         │   │
│ │                 │ 🥉 3. ธนัช (4/2)        │   │
│ │                 │    8 ครั้ง   [รายละเอียด]│   │
│ └─────────────────┴─────────────────────────┘   │
│                                                  │
│ 📊 กราฟสรุปตามห้อง                               │
│ ┌────────────────────────────────────────────┐  │
│ │ 4/1  ████████████░░░░░░░░ 45               │  │
│ │ 4/2  ██████░░░░░░░░░░░░░░ 32               │  │
│ │ 4/3  ██████████████████░░ 58               │  │
│ │ 4/4  ████░░░░░░░░░░░░░░░░ 21               │  │
│ │ 4/5  ████████░░░░░░░░░░░░ 38               │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ 📅 กราฟแนวโน้มรายสัปดาห์                         │
│ ┌────────────────────────────────────────────┐  │
│ │ 60│              ●                         │  │
│ │ 50│         ●         ●                    │  │
│ │ 40│    ●                   ●               │  │
│ │ 30│                             ●          │  │
│ │ 20│                                   ●    │  │
│ │   └────────────────────────────────────   │  │
│ │    จ  อ  พ  พฤ ศ  ส  อา                 │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│            [📄 Export Excel] [🖨️ Print]         │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Features
- **กรองข้อมูล**
  - เลือกห้อง (ทั้งหมด / แยกห้อง)
  - เลือกช่วงเวลา (วันนี้ / สัปดาห์นี้ / เดือนนี้ / ปีนี้ / กำหนดเอง)
- **สรุปภาพรวม**
  - จำนวนครั้งทั้งหมด
  - จำนวนนักเรียนที่มาสาย
  - ค่าเฉลี่ย
  - ห้องที่มาสายมากสุด
- **Ranking TOP 10**
  - เรียงจากมากไปน้อย
  - แสดงห้อง, จำนวนครั้ง
  - คลิกดูรายละเอียด
- **กราฟ**
  - Bar chart แยกตามห้อง
  - Line chart แนวโน้มรายวัน/สัปดาห์
- **Export/Print**
  - ส่งออก Excel
  - พิมพ์รายงาน

---

### **5. Modal รายละเอียดการมาสาย** (Popup)

#### Layout
```
┌──────────────────────────────────────────┐
│ รายละเอียดการมาสาย               ✖️     │
├──────────────────────────────────────────┤
│                                          │
│ 👤 นักเรียน: กรณ์ศุพัชร์ กาทอง           │
│ 🏫 ห้อง: 4/2                             │
│ 🔢 รหัส: 13015                           │
│ 📊 มาสายทั้งหมด: 12 ครั้ง                │
│                                          │
│ 📅 ประวัติการมาสาย:                      │
│ ┌────────────────────────────────────┐  │
│ │ 📅 10 ม.ค. 68  ⏰ 08:25  💬 รถติด   │  │
│ │ 📅 07 ม.ค. 68  ⏰ 08:30  💬 ตื่นสาย │  │
│ │ 📅 05 ม.ค. 68  ⏰ 08:20  💬 -       │  │
│ │ 📅 03 ม.ค. 68  ⏰ 08:35  💬 รถติด   │  │
│ │ 📅 28 ธ.ค. 67  ⏰ 08:15  💬 ธุระ    │  │
│ │ ... แสดงเพิ่มเติม                   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ 📈 กราฟความถี่การมาสาย (สัปดาห์)         │
│ ┌────────────────────────────────────┐  │
│ │ จ  ██ 2                            │  │
│ │ อ  -  0                            │  │
│ │ พ  ████ 3                          │  │
│ │ พฤ █ 1                             │  │
│ │ ศ  ██ 2                            │  │
│ │ ส  -  0                            │  │
│ │ อา -  0                            │  │
│ └────────────────────────────────────┘  │
│                                          │
│                [ปิด]                     │
│                                          │
└──────────────────────────────────────────┘
```

#### Features
- แสดงข้อมูลนักเรียน
- ประวัติการมาสายย้อนหลัง
- กราฟวิเคราะห์วันที่มาสายบ่อย
- Scroll ดูประวัติเพิ่มเติม

---

## 🎨 UX/UI Features

### **1. Responsive Design**
- ใช้งานได้บน Desktop, Tablet, Mobile
- Mobile-first approach
- Touch-friendly buttons

### **2. Loading & Feedback**
- Loading spinner ขณะโหลดข้อมูล
- Success notification เมื่อบันทึกสำเร็จ
- Error message ถ้ามีปัญหา
- Confirmation dialog ก่อนลบ/แก้ไข

### **3. Accessibility**
- Keyboard navigation
- High contrast mode
- Font size adjustable
- Screen reader support

### **4. Performance**
- Cache ข้อมูลนักเรียนใน localStorage
- Lazy load รายการยาวๆ
- Debounce สำหรับ search
- Offline mode (บันทึก draft ก่อน sync)

### **5. Smart Features**
- **Auto-complete** - พิมพ์ชื่อค้นหา
- **Bulk actions** - เลือกหลายคนพร้อมกัน
- **Quick time** - ปุ่มเวลาด่วน (ตอนนี้, 08:00, 08:30)
- **History** - ดูประวัติการบันทึกล่าสุด
- **Undo** - ยกเลิกการบันทึกล่าสุด (5 นาที)
- **Dark mode** - โหมดมืด

---

## 📂 File Structure

```
/frontend
├── index.html              # Login page
├── dashboard.html          # หน้าหลักเลือกห้อง
├── check-late.html         # เช็คชื่อมาสาย
├── stats.html              # สถิติและ Ranking
│
├── /css
│   ├── variables.css       # CSS Variables (colors, fonts)
│   ├── reset.css           # CSS Reset
│   ├── base.css            # Base styles
│   ├── components.css      # Reusable components
│   ├── login.css           # Login page styles
│   ├── dashboard.css       # Dashboard styles
│   ├── check-late.css      # Check late styles
│   ├── stats.css           # Stats page styles
│   └── responsive.css      # Responsive breakpoints
│
├── /js
│   ├── config.js           # Configuration (API URL, etc.)
│   ├── api-helper.js       # API wrapper functions
│   ├── auth.js             # Authentication logic
│   ├── utils.js            # Utility functions
│   ├── storage.js          # LocalStorage helpers
│   ├── dashboard.js        # Dashboard logic
│   ├── check-late.js       # Check late logic
│   ├── stats.js            # Stats page logic
│   └── components.js       # Reusable UI components
│
└── /assets
    ├── /icons              # SVG icons
    ├── /images             # Images
    └── /fonts              # Custom fonts (optional)
```

---

## 🔐 Authentication Flow

### Simple PIN Authentication

```javascript
// config.js
const AUTH_CONFIG = {
  PIN: '1234',  // หรือ fetch จาก API
  SESSION_TIMEOUT: 3600000 // 1 hour
};

// auth.js
function login(pin) {
  if (pin === AUTH_CONFIG.PIN) {
    localStorage.setItem('auth', JSON.stringify({
      loggedIn: true,
      timestamp: Date.now()
    }));
    return true;
  }
  return false;
}

function isAuthenticated() {
  const auth = JSON.parse(localStorage.getItem('auth'));
  if (!auth || !auth.loggedIn) return false;
  
  // Check timeout
  if (Date.now() - auth.timestamp > AUTH_CONFIG.SESSION_TIMEOUT) {
    logout();
    return false;
  }
  
  return true;
}

function logout() {
  localStorage.removeItem('auth');
  window.location.href = 'index.html';
}
```

---

## 🎯 User Flow

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌─────────────┐
│  Dashboard  │◄─────────────┐
└──┬──────┬───┘              │
   │      │                  │
   │      └─► [Stats] ───────┤
   │                         │
   ▼                         │
┌──────────────┐             │
│ Check Late   │             │
│ (Classroom)  │             │
└──────┬───────┘             │
       │                     │
       ├─► [Save] ──────────►│
       │                     │
       ├─► [Switch Class] ───┤
       │                     │
       └─► [View Details] ───┘
           (Modal)
```

---

## 📊 Data Flow

### การบันทึกข้อมูล
```javascript
// 1. User เลือกนักเรียนที่มาสาย
selectedStudents = [
  { student_id: 1, time: '08:30', reason: 'รถติด' },
  { student_id: 2, time: '08:30', reason: 'ตื่นสาย' }
];

// 2. บันทึก draft ใน localStorage (auto-save)
localStorage.setItem('draft_late_records', JSON.stringify({
  date: '2026-01-10',
  class_room: '4/2',
  records: selectedStudents
}));

// 3. กดบันทึก -> ส่ง API
for (let student of selectedStudents) {
  await API.addLateRecord({
    student_id: student.student_id,
    late_date: '2026-01-10',
    late_time: student.time,
    reason: student.reason
  });
}

// 4. Clear draft
localStorage.removeItem('draft_late_records');

// 5. Refresh รายการวันนี้
await loadTodayRecords();
```

### การแสดงข้อมูล
```javascript
// Dashboard
const classrooms = await API.getStudents();
const grouped = groupByClassroom(classrooms);
const todayLate = await API.getLateRecords({ 
  date_from: today, 
  date_to: today 
});

// Check Late Page
const students = await API.getStudents({ class_room: '4/2' });
const todayRecords = await API.getLateRecords({
  date_from: today,
  date_to: today
});

// Stats Page
const summary = await API.getLateSummary({ class_room: '4/2' });
```

---

## 🎨 Color Scheme (แนะนำ)

```css
:root {
  /* Primary Colors */
  --color-primary: #3b82f6;      /* Blue */
  --color-secondary: #8b5cf6;    /* Purple */
  --color-success: #10b981;      /* Green */
  --color-warning: #f59e0b;      /* Orange */
  --color-danger: #ef4444;       /* Red */
  
  /* Neutral Colors */
  --color-bg: #f9fafb;           /* Light gray bg */
  --color-surface: #ffffff;      /* White */
  --color-text: #111827;         /* Dark text */
  --color-text-light: #6b7280;   /* Gray text */
  
  /* Status Colors */
  --color-late: #fbbf24;         /* Yellow - มาสาย */
  --color-present: #34d399;      /* Green - มาตรงเวลา */
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
/* Default: 320px - 767px (Mobile) */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Large Desktop */
@media (min-width: 1280px) {
  /* Large desktop styles */
}
```

---

## 🚀 Next Steps

1. ✅ ออกแบบ UI/UX เสร็จ
2. ⏳ เขียน HTML Structure
3. ⏳ เขียน CSS Styling
4. ⏳ เขียน JavaScript Logic
5. ⏳ Integration กับ Backend API
6. ⏳ Testing
7. ⏳ Deploy to GitHub Pages

---

## 📝 Notes

- ใช้ **Vanilla JavaScript** (ไม่ต้องใช้ Framework)
- ใช้ **CSS Grid/Flexbox** สำหรับ Layout
- เน้น **Performance** และ **Accessibility**
- รองรับ **Offline Mode** ด้วย LocalStorage
- **Progressive Enhancement** - ใช้งานได้แม้ JS ปิด (บางส่วน)

---

## 🎁 Bonus Features (Phase 2)

1. **QR Code Scan** - สแกนบัตรนักเรียนเพื่อบันทึกมาสาย
2. **Face Recognition** - ใช้กล้องจดจำใบหน้า
3. **Line Notify** - แจ้งเตือนผู้ปกครอง
4. **Dashboard Analytics** - ข้อมูลเชิงลึกมากขึ้น
5. **Multi-language** - รองรับหลายภาษา
6. **Role-based Access** - แยกสิทธิ์ครู/ผู้บริหาร
7. **API Rate Limiting** - ป้องกัน Abuse
8. **Data Backup** - สำรองข้อมูลอัตโนมัติ

---

**สร้างโดย:** GitHub Copilot  
**วันที่:** 10 มกราคม 2568  
**สถานะ:** ✅ Design Complete - Ready for Development
