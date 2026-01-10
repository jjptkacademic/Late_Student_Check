# Frontend - ระบบเช็คนักเรียนมาสาย

Frontend สำหรับระบบเช็คนักเรียนมาสาย ใช้ Vanilla JavaScript (HTML, CSS, JS) ไม่ต้องติดตั้ง dependencies

## 📁 โครงสร้างไฟล์

```
Frontend/
├── index.html              # หน้า Login
├── dashboard.html          # หน้าหลักเลือกห้อง
├── check-late.html         # หน้าเช็คชื่อมาสาย
├── stats.html              # หน้าสถิติและ Ranking
│
├── css/
│   ├── variables.css       # CSS Variables (Design System)
│   ├── reset.css           # CSS Reset
│   ├── base.css            # Base Styles
│   ├── components.css      # Reusable Components
│   ├── login.css           # Login Page Styles
│   ├── dashboard.css       # Dashboard Styles
│   ├── check-late.css      # Check Late Page Styles
│   ├── stats.css           # Stats Page Styles
│   └── responsive.css      # Responsive Styles
│
├── js/
│   ├── config.js           # Configuration
│   ├── utils.js            # Utility Functions
│   ├── storage.js          # LocalStorage Helper
│   ├── auth.js             # Authentication
│   ├── api-helper.js       # API Wrapper
│   ├── components.js       # UI Components
│   ├── dashboard.js        # Dashboard Logic
│   ├── check-late.js       # Check Late Logic
│   └── stats.js            # Stats Logic
│
└── assets/
    └── icons/              # Icons (if needed)
```

## 🚀 การติดตั้งและใช้งาน

### 1. ตั้งค่ารหัสผ่าน
แก้ไขไฟล์ `js/config.js`:
```javascript
const CONFIG = {
  AUTH_PIN: '1234', // เปลี่ยนรหัสผ่านตรงนี้
  // ...
};
```

### 2. ตั้งค่า API URL (ทำแล้ว)
```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
  // ...
};
```

### 3. เปิดใช้งาน
- **Local:** เปิด `index.html` ด้วย browser (แนะนำใช้ Live Server)
- **Deploy:** อัปโหลดไปยัง GitHub Pages, Netlify, Vercel, etc.

## 🔐 การ Login

รหัสผ่านเริ่มต้น: `1234`

## 📝 การใช้งาน

### 1. หน้า Login (index.html)
- ใส่รหัสผ่าน
- กดเข้าสู่ระบบ

### 2. Dashboard (dashboard.html)
- เลือกห้องเรียนที่ต้องการเช็คชื่อ
- หรือดูสถิติทั้งหมด

### 3. เช็คชื่อมาสาย (check-late.html)
- ดูรายชื่อนักเรียนที่บันทึกมาสายวันนี้แล้ว
- เลือกนักเรียนที่มาสาย (Checkbox)
- กดบันทึก → ระบุเวลาและเหตุผล
- ยืนยันการบันทึก

**Features:**
- ค้นหานักเรียน (รหัส, ชื่อ, นามสกุล)
- เลือกหลายคนพร้อมกัน
- เปลี่ยนห้องได้โดยไม่ต้องกลับหน้าหลัก
- แสดงรายชื่อที่บันทึกไปแล้ววันนี้

### 4. สถิติและ Ranking (stats.html)
- กรองตามห้อง
- กรองตามช่วงเวลา (วันนี้/สัปดาห์/เดือน/ปี)
- ดู TOP 10 มาสายบ่อยสุด
- คลิกดูรายละเอียดประวัติการมาสาย
- Export Excel (CSV)
- Print รายงาน

## 🎨 Design System

### สีหลัก
- **Primary:** `#3b82f6` (Blue)
- **Secondary:** `#8b5cf6` (Purple)
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Orange)
- **Danger:** `#ef4444` (Red)
- **Late:** `#fbbf24` (Yellow)

### Responsive Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1279px
- **Large Desktop:** >= 1280px

## 🛠️ การพัฒนา

### Live Server (แนะนำ)
```bash
# ติดตั้ง Live Server extension ใน VS Code
# คลิกขวาที่ index.html → Open with Live Server
```

### Local File
```bash
# เปิดไฟล์โดยตรง
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux
```

## 📦 Deploy

### GitHub Pages
1. Push โค้ดขึ้น GitHub Repository
2. Settings → Pages
3. Source: main branch / Frontend folder
4. Save

### Netlify
1. Drag & drop folder Frontend
2. หรือ Connect to Git repository

### Vercel
```bash
vercel --prod
```

## 🔧 การปรับแต่ง

### เปลี่ยนสี
แก้ไข `css/variables.css`:
```css
:root {
  --color-primary: #YOUR_COLOR;
  /* ... */
}
```

### เพิ่มเหตุผลการมาสาย
แก้ไข `check-late.html`:
```html
<option value="YOUR_REASON">YOUR_REASON</option>
```

### เปลี่ยน Session Timeout
แก้ไข `js/config.js`:
```javascript
SESSION_TIMEOUT: 3600000, // milliseconds (1 hour)
```

## 🐛 Troubleshooting

### ปัญหา: Login ไม่ได้
- ตรวจสอบรหัสผ่านใน `js/config.js`
- เคลียร์ LocalStorage: `F12` → Application → Local Storage → Clear

### ปัญหา: ไม่มีข้อมูล
- ตรวจสอบ API URL ใน `js/config.js`
- เปิด Console (F12) ดู Error
- ตรวจสอบ Google Apps Script ว่า Deploy แล้ว

### ปัญหา: CORS Error
- ตรวจสอบว่า Deploy Apps Script แล้ว
- ตรวจสอบ URL ว่าถูกต้อง

## 📱 Browser Support

- ✅ Chrome (แนะนำ)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (ไม่รองรับ)

## 🔒 Security

- รหัสผ่านเก็บใน code (สำหรับการใช้งานภายในเท่านั้น)
- Session timeout 1 ชั่วโมง
- ไม่มีการเก็บข้อมูลส่วนตัวใน LocalStorage

## 📄 License

สร้างโดย GitHub Copilot  
© 2568 ระบบเช็คนักเรียนมาสาย

---

**หมายเหตุ:** นี่คือระบบสำหรับใช้งานภายในโรงเรียน ไม่แนะนำให้ใช้งานบนอินเทอร์เน็ตสาธารณะโดยไม่มีระบบรักษาความปลอดภัยเพิ่มเติม
