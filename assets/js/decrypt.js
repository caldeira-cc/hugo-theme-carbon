/**
 * Client-Side Web Crypto AES-256-GCM / PBKDF2 Decryption Engine
 * Decrypts build-time encrypted HTML using native window.crypto.subtle primitives.
 */

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function decryptPayload(payload, password) {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  const saltBuffer = base64ToArrayBuffer(payload.salt);
  const ivBuffer = base64ToArrayBuffer(payload.iv);
  const tagBuffer = base64ToArrayBuffer(payload.tag);
  const ciphertextBuffer = base64ToArrayBuffer(payload.ciphertext);

  // Combine ciphertext and auth tag for Web Crypto AES-GCM format
  const combinedBuffer = new Uint8Array(ciphertextBuffer.byteLength + tagBuffer.byteLength);
  combinedBuffer.set(new Uint8Array(ciphertextBuffer), 0);
  combinedBuffer.set(new Uint8Array(tagBuffer), ciphertextBuffer.byteLength);

  // Import password as PBKDF2 base key
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive 256-bit AES-GCM decryption key
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: payload.iterations || 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt ciphertext with AES-GCM
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
      tagLength: 128
    },
    aesKey,
    combinedBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

export function initDecryption() {
  const form = document.getElementById('decrypt-form');
  const passwordInput = document.getElementById('decrypt-password');
  const errorBox = document.getElementById('decrypt-error');
  const guard = document.getElementById('encrypted-guard');
  const container = document.getElementById('encrypted-content');

  if (!form || !container) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.classList.remove('carbon-encrypted-guard__error--visible');

    const password = passwordInput ? passwordInput.value.trim() : '';
    if (!password) return;

    const rawPayload = container.getAttribute('data-payload');
    if (!rawPayload) {
      if (errorBox) {
        errorBox.querySelector('span').textContent = 'Error: Encrypted payload missing.';
        errorBox.classList.add('carbon-encrypted-guard__error--visible');
      }
      return;
    }

    try {
      const payload = JSON.parse(rawPayload);
      const decryptedHTML = await decryptPayload(payload, password);

      // Successfully decrypted
      container.innerHTML = decryptedHTML;
      container.style.display = 'block';
      container.classList.add('carbon-encrypted-content--unlocked', 'carbon-prose');

      if (guard) guard.style.display = 'none';

      // Dispatch event for downstream widgets/tables to hydrate
      window.dispatchEvent(new CustomEvent('carbon:content-decrypted', { detail: { container } }));
    } catch (err) {
      console.error('Decryption failed:', err);
      if (errorBox) {
        errorBox.querySelector('span').textContent = 'Incorrect password or authentication tag mismatch.';
        errorBox.classList.add('carbon-encrypted-guard__error--visible');
      }
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.select();
      }
    }
  });
}
