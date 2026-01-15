/**
 * Performance Optimization Helper
 * เพิ่มความเร็วในการ render ตารางนักเรียน
 */

// Virtual Scrolling / Pagination Helper
const RenderOptimizer = {
  ITEMS_PER_PAGE: 50,
  currentPage: 1,
  totalPages: 1,
  
  // Render with pagination
  renderWithPagination(items, renderFunction, containerId, paginationId) {
    console.time('renderWithPagination');
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Calculate pagination
    this.totalPages = Math.ceil(items.length / this.ITEMS_PER_PAGE);
    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;
    const itemsToShow = items.slice(startIndex, endIndex);
    
    // Clear container
    container.innerHTML = '';
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    itemsToShow.forEach((item, index) => {
      const element = renderFunction(item, startIndex + index);
      fragment.appendChild(element);
    });
    
    container.appendChild(fragment);
    
    // Update pagination UI
    if (paginationId) {
      this.renderPaginationControls(items.length, paginationId);
    }
    
    console.timeEnd('renderWithPagination');
    console.log(`✅ Rendered ${itemsToShow.length}/${items.length} items (Page ${this.currentPage}/${this.totalPages})`);
  },
  
  // Render pagination controls
  renderPaginationControls(totalItems, paginationId) {
    const paginationContainer = document.getElementById(paginationId);
    if (!paginationContainer) return;
    
    if (totalItems <= this.ITEMS_PER_PAGE) {
      paginationContainer.innerHTML = '';
      return;
    }
    
    const startNum = (this.currentPage - 1) * this.ITEMS_PER_PAGE + 1;
    const endNum = Math.min(this.currentPage * this.ITEMS_PER_PAGE, totalItems);
    
    paginationContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; justify-content: center; padding: 1rem;">
        <button 
          class="btn btn-sm btn-outline" 
          onclick="RenderOptimizer.goToPage(1)" 
          ${this.currentPage === 1 ? 'disabled' : ''}>
          ⏮️ แรกสุด
        </button>
        <button 
          class="btn btn-sm btn-outline" 
          onclick="RenderOptimizer.previousPage()" 
          ${this.currentPage === 1 ? 'disabled' : ''}>
          ◀️ ก่อนหน้า
        </button>
        <span style="color: var(--color-text); font-weight: 500;">
          ${startNum}-${endNum} จาก ${totalItems} คน (หน้า ${this.currentPage}/${this.totalPages})
        </span>
        <button 
          class="btn btn-sm btn-outline" 
          onclick="RenderOptimizer.nextPage()" 
          ${this.currentPage === this.totalPages ? 'disabled' : ''}>
          ถัดไป ▶️
        </button>
        <button 
          class="btn btn-sm btn-outline" 
          onclick="RenderOptimizer.goToPage(${this.totalPages})" 
          ${this.currentPage === this.totalPages ? 'disabled' : ''}>
          สุดท้าย ⏭️
        </button>
      </div>
    `;
  },
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.refreshStudentsList?.();
    }
  },
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.refreshStudentsList?.();
    }
  },
  
  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    window.refreshStudentsList?.();
  },
  
  reset() {
    this.currentPage = 1;
  }
};

// Expose to window for onclick handlers
window.RenderOptimizer = RenderOptimizer;
