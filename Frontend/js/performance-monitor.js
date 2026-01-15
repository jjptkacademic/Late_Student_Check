/**
 * Performance Monitor
 * แสดง timestamp และ stopwatch สำหรับวัดความเร็วของแต่ละหน้า
 */

const PerformanceMonitor = {
  timers: {},
  logs: [],

  // เช็คว่าเปิดใช้งานหรือไม่
  isEnabled() {
    return window.CONFIG?.ENABLE_PERFORMANCE_MONITOR === true;
  },

  // เริ่มจับเวลา
  start(label) {
    if (!this.isEnabled()) return;

    const timestamp = new Date().toISOString();
    this.timers[label] = {
      startTime: performance.now(),
      timestamp: timestamp
    };

    const log = `⏱️ [START] ${label} - ${new Date().toLocaleTimeString('th-TH')}.${Date.now() % 1000}`;
    console.log(log);
    this.logs.push(log);

    // แสดงบน UI ถ้ามี performance-monitor element
    this.updateUI();
  },
  
  // จบการจับเวลา
  end(label) {
    if (!this.isEnabled()) return;

    if (!this.timers[label]) {
      console.warn(`⚠️ Timer "${label}" not found`);
      return;
    }
    
    const endTime = performance.now();
    const duration = endTime - this.timers[label].startTime;
    const timestamp = new Date().toISOString();
    
    const log = `✅ [END] ${label} - ${duration.toFixed(2)}ms (${(duration/1000).toFixed(2)}s)`;
    console.log(log);
    this.logs.push(log);
    
    // แสดงบน UI
    this.updateUI();
    
    // ส่งคืนข้อมูล
    return {
      label,
      duration,
      durationSeconds: duration / 1000,
      startTimestamp: this.timers[label].timestamp,
      endTimestamp: timestamp
    };
  },
  
  // จับเวลา checkpoint
  checkpoint(label, description) {
    if (!this.isEnabled()) return;

    const timestamp = new Date().toISOString();
    const log = `📍 [CHECKPOINT] ${label} - ${description} - ${new Date().toLocaleTimeString('th-TH')}.${Date.now() % 1000}`;
    console.log(log);
    this.logs.push(log);
    this.updateUI();
  },
  
  // แสดง Performance Monitor UI
  createUI() {
    if (!this.isEnabled()) return;

    // ลบ UI เก่าออก (ถ้ามี)
    const existingUI = document.getElementById('performance-monitor-ui');
    if (existingUI) {
      existingUI.remove();
    }
    
    const monitorUI = document.createElement('div');
    monitorUI.id = 'performance-monitor-ui';
    monitorUI.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 10px;
      border-radius: 8px;
      max-width: 400px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      border: 1px solid #00ff00;
    `;
    
    monitorUI.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #00ff00; padding-bottom: 5px;">
        <strong style="color: #00ff00;">⚡ Performance Monitor</strong>
        <button id="perf-monitor-toggle" style="background: none; border: 1px solid #00ff00; color: #00ff00; cursor: pointer; padding: 2px 8px; border-radius: 4px; font-size: 10px;">
          Minimize
        </button>
      </div>
      <div id="performance-logs"></div>
    `;
    
    document.body.appendChild(monitorUI);
    
    // Toggle minimize/maximize
    let isMinimized = false;
    const logsDiv = document.getElementById('performance-logs');
    document.getElementById('perf-monitor-toggle').addEventListener('click', function() {
      isMinimized = !isMinimized;
      if (isMinimized) {
        logsDiv.style.display = 'none';
        this.textContent = 'Maximize';
        monitorUI.style.maxHeight = '50px';
      } else {
        logsDiv.style.display = 'block';
        this.textContent = 'Minimize';
        monitorUI.style.maxHeight = '300px';
      }
    });
    
    this.updateUI();
  },
  
  // อัพเดท UI
  updateUI() {
    if (!this.isEnabled()) return;

    const logsDiv = document.getElementById('performance-logs');
    if (!logsDiv) return;
    
    // แสดง log ล่าสุด 20 รายการ
    const recentLogs = this.logs.slice(-20);
    logsDiv.innerHTML = recentLogs.map(log => `<div style="margin: 2px 0;">${log}</div>`).join('');
    
    // Scroll to bottom
    logsDiv.scrollTop = logsDiv.scrollHeight;
  },
  
  // รีเซ็ต
  reset() {
    if (!this.isEnabled()) return;

    this.timers = {};
    this.logs = [];
    console.clear();
    console.log('🔄 Performance Monitor Reset');
    this.updateUI();
  },
  
  // ส่งออกรายงาน
  exportReport() {
    if (!this.isEnabled()) {
      console.log('⚠️ Performance Monitor is disabled. Enable it in config.js');
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      logs: this.logs,
      timers: this.timers
    };
    
    console.log('📊 Performance Report:', report);
    
    // Copy to clipboard
    const reportText = this.logs.join('\n');
    navigator.clipboard.writeText(reportText).then(() => {
      alert('✅ คัดลอกรายงานไปยัง Clipboard แล้ว!');
    }).catch(() => {
      alert('❌ ไม่สามารถคัดลอกได้');
    });
    
    return report;
  },
  
  // วัด async function
  async measure(label, asyncFunc) {
    if (!this.isEnabled()) {
      return await asyncFunc();
    }

    this.start(label);
    try {
      const result = await asyncFunc();
      this.end(label);
      return result;
    } catch (error) {
      this.checkpoint(label, `ERROR: ${error.message}`);
      this.end(label);
      throw error;
    }
  }
};

// สร้าง UI อัตโนมัติเมื่อโหลดหน้า
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.createUI();
  });
} else {
  PerformanceMonitor.createUI();
}

// Expose to window
window.PerformanceMonitor = PerformanceMonitor;
window.PM = PerformanceMonitor; // Shorthand

// Keyboard shortcut: Ctrl+Shift+P = Export Report
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    PerformanceMonitor.exportReport();
  }
});

if (window.CONFIG?.ENABLE_PERFORMANCE_MONITOR) {
  console.log('✅ Performance Monitor loaded! Use PM.start("label") and PM.end("label")');
  console.log('📋 Press Ctrl+Shift+P to export report');
} else {
  console.log('ℹ️ Performance Monitor is disabled. Set CONFIG.ENABLE_PERFORMANCE_MONITOR = true to enable');
}
