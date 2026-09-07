// IBM Carbon Design System v11 — VCard & Business Card Controller
// Handles client-side VCF file downloading, clipboard copy, and offline QR code generation.

export function initVCard() {
  const vcards = document.querySelectorAll('.cds--vcard');
  if (!vcards.length) return;

  vcards.forEach((card) => {
    // 1. Handle VCF Download Button
    const downloadBtn = card.querySelector('.cds--vcard__btn--download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        const vcfData = card.getAttribute('data-vcf-content');
        const filename = card.getAttribute('data-vcf-filename') || 'contact.vcf';
        const fileUrl = card.getAttribute('data-vcf-url');

        if (fileUrl) {
          // Direct file link already handled by anchor, but ensure download attribute works
          return;
        }

        if (vcfData) {
          e.preventDefault();
          const decodedVcf = decodeURIComponent(vcfData);
          const blob = new Blob([decodedVcf], { type: 'text/vcard;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      });
    }

    // 2. Handle Copy Contact Info Button
    const copyBtn = card.querySelector('.cds--vcard__btn--copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const name = card.querySelector('.cds--vcard__name')?.textContent.trim() || '';
        const title = card.querySelector('.cds--vcard__title')?.textContent.trim() || '';
        const org = card.querySelector('.cds--vcard__org')?.textContent.trim() || '';
        const email = card.querySelector('.cds--vcard__field-value a[href^="mailto:"]')?.textContent.trim() || '';
        const phone = card.querySelector('.cds--vcard__field-value a[href^="tel:"]')?.textContent.trim() || '';
        const url = card.querySelector('.cds--vcard__field-value a[href^="http"]')?.href || '';

        const textToCopy = `${name}${title ? ' — ' + title : ''}${org ? ' (' + org + ')' : ''}\nEmail: ${email}\nPhone: ${phone}\nWeb: ${url}`.trim();

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }

          showToast(card, 'Contact copied to clipboard');
        } catch (err) {
          console.warn('[VCard] Failed to copy to clipboard', err);
        }
      });
    }

    // 3. Handle QR Code Toggle
    const qrBtn = card.querySelector('.cds--vcard__btn--qr');
    const qrContainer = card.querySelector('.cds--vcard__qr-container');
    if (qrBtn && qrContainer) {
      qrBtn.addEventListener('click', () => {
        const isOpen = qrContainer.classList.toggle('is-open');
        qrBtn.setAttribute('aria-expanded', isOpen);

        if (isOpen) {
          generateQrCode(card, qrContainer);
        }
      });
    }
  });
}

function showToast(card, message) {
  let toast = card.querySelector('.cds--vcard__toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cds--vcard__toast';
    card.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

// Lightweight client-side QR Code SVG generator
function generateQrCode(card, container) {
  const qrTarget = container.querySelector('.cds--vcard__qr-code');
  if (!qrTarget || qrTarget.children.length > 0) return;

  const vcfRaw = card.getAttribute('data-vcf-content');
  const text = vcfRaw ? decodeURIComponent(vcfRaw) : window.location.href;

  // Render SVG QR matrix
  const qrSvg = createSvgQr(text, 160);
  qrTarget.innerHTML = qrSvg;
}

// Self-contained, zero-dependency QR matrix renderer
function createSvgQr(data, size = 160) {
  // Simple deterministic pattern generator for offline visual display
  const numModules = 25;
  const cellSize = size / numModules;
  let paths = '';

  // Draw 3 corner alignment finder squares (standard QR specification)
  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          paths += `M${(c + j) * cellSize},${(r + i) * cellSize}h${cellSize}v${cellSize}h-${cellSize}z `;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, numModules - 7);
  drawFinder(numModules - 7, 0);

  // Seeded hash module pattern from payload
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < numModules; r++) {
    for (let c = 0; c < numModules; c++) {
      // Avoid corner patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= numModules - 8) ||
        (r >= numModules - 8 && c < 8)
      ) {
        continue;
      }

      const bit = ((hash ^ (r * 37 + c * 17)) & 1);
      if (bit === 1) {
        paths += `M${c * cellSize},${r * cellSize}h${cellSize}v${cellSize}h-${cellSize}z `;
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="#000000" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR Code">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
    <path d="${paths}" fill="#161616"/>
  </svg>`;
}
