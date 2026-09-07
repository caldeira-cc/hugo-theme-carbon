/**
 * Carbon Design System v11 — XML Data Engine
 * Interactive client-side search, sort, and pagination for XML tables.
 */

export function initXmlDataTables() {
  document.querySelectorAll('.carbon-xml-container[data-xml-table]').forEach(container => {
    if (container._xmlInitialized) return;
    container._xmlInitialized = true;

    const searchInput = container.querySelector('.carbon-xml-search');
    const table = container.querySelector('.carbon-xml-datatable');
    const counter = container.querySelector('.carbon-xml-counter');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const totalRows = rows.length;

    // 1. Live Search
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target.value || '').toLowerCase().trim();
        let visibleCount = 0;

        rows.forEach(row => {
          const text = (row.textContent || '').toLowerCase();
          const matches = query === '' || text.includes(query);
          row.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });

        if (counter) {
          counter.textContent = query === '' 
            ? `Showing ${totalRows} records` 
            : `Showing ${visibleCount} of ${totalRows} records`;
        }
      });
    }

    // 2. Column Sorting
    const headers = Array.from(table.querySelectorAll('thead th'));
    headers.forEach((th, colIdx) => {
      th.style.cursor = 'pointer';
      th.setAttribute('title', 'Click to sort');
      th.setAttribute('tabindex', '0');

      let sortAsc = true;
      const sortTable = () => {
        const currentRows = Array.from(tbody.querySelectorAll('tr'));
        currentRows.sort((a, b) => {
          const aCol = a.children[colIdx] ? a.children[colIdx].textContent.trim() : '';
          const bCol = b.children[colIdx] ? b.children[colIdx].textContent.trim() : '';

          const aNum = parseFloat(aCol.replace(/[^0-9.-]+/g, ''));
          const bNum = parseFloat(bCol.replace(/[^0-9.-]+/g, ''));

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortAsc ? aNum - bNum : bNum - aNum;
          }
          return sortAsc ? aCol.localeCompare(bCol) : bCol.localeCompare(aCol);
        });

        sortAsc = !sortAsc;
        currentRows.forEach(r => tbody.appendChild(r));
      };

      th.addEventListener('click', sortTable);
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sortTable();
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initXmlDataTables);
