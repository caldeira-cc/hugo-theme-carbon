#!/usr/bin/env python3

"""
Zero-Dependency Build-Time AES-256-GCM Encryption Pipeline
Encrypts password-protected HTML sections using PBKDF2-SHA256 (100,000 iterations)
and AES-256-GCM with 128-bit authentication tags.
100% self-contained pure Python 3 — zero external pip or node dependencies.
"""

import os
import re
import json
import base64
import hashlib
import secrets
import struct

# --- Pure Python AES-256 & GCM Engine ---

SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36]

def _xtime(a):
    return (((a << 1) ^ 0x1B) & 0xFF) if (a & 0x80) else (a << 1)

def _aes_key_expansion(key):
    # 256-bit key -> 60 32-bit words (15 round keys)
    w = [0] * 60
    for i in range(8):
        w[i] = struct.unpack('>I', key[4*i:4*i+4])[0]
    for i in range(8, 60):
        temp = w[i - 1]
        if i % 8 == 0:
            # RotWord + SubWord + Rcon
            temp = ((temp << 8) & 0xFFFFFFFF) | (temp >> 24)
            temp = (SBOX[(temp >> 24) & 0xFF] << 24) | (SBOX[(temp >> 16) & 0xFF] << 16) | \
                   (SBOX[(temp >> 8) & 0xFF] << 8) | SBOX[temp & 0xFF]
            temp ^= (RCON[i // 8] << 24)
        elif i % 8 == 4:
            temp = (SBOX[(temp >> 24) & 0xFF] << 24) | (SBOX[(temp >> 16) & 0xFF] << 16) | \
                   (SBOX[(temp >> 8) & 0xFF] << 8) | SBOX[temp & 0xFF]
        w[i] = w[i - 8] ^ temp
    return w

def _aes_encrypt_block(block, round_keys):
    state = list(block)
    # AddRoundKey 0
    for i in range(4):
        rk = round_keys[i]
        state[4*i] ^= (rk >> 24) & 0xFF
        state[4*i+1] ^= (rk >> 16) & 0xFF
        state[4*i+2] ^= (rk >> 8) & 0xFF
        state[4*i+3] ^= rk & 0xFF

    for r in range(1, 14):
        # SubBytes
        state = [SBOX[b] for b in state]
        # ShiftRows
        state = [
            state[0], state[5], state[10], state[15],
            state[4], state[9], state[14], state[3],
            state[8], state[13], state[2], state[7],
            state[12], state[1], state[6], state[11]
        ]
        # MixColumns
        new_state = [0] * 16
        for c in range(4):
            s0, s1, s2, s3 = state[4*c], state[4*c+1], state[4*c+2], state[4*c+3]
            new_state[4*c] = _xtime(s0) ^ (_xtime(s1) ^ s1) ^ s2 ^ s3
            new_state[4*c+1] = s0 ^ _xtime(s1) ^ (_xtime(s2) ^ s2) ^ s3
            new_state[4*c+2] = s0 ^ s1 ^ _xtime(s2) ^ (_xtime(s3) ^ s3)
            new_state[4*c+3] = (_xtime(s0) ^ s0) ^ s1 ^ s2 ^ _xtime(s3)
        state = new_state
        # AddRoundKey
        for i in range(4):
            rk = round_keys[4*r + i]
            state[4*i] ^= (rk >> 24) & 0xFF
            state[4*i+1] ^= (rk >> 16) & 0xFF
            state[4*i+2] ^= (rk >> 8) & 0xFF
            state[4*i+3] ^= rk & 0xFF

    # Round 14 (Final)
    state = [SBOX[b] for b in state]
    state = [
        state[0], state[5], state[10], state[15],
        state[4], state[9], state[14], state[3],
        state[8], state[13], state[2], state[7],
        state[12], state[1], state[6], state[11]
    ]
    for i in range(4):
        rk = round_keys[4*14 + i]
        state[4*i] ^= (rk >> 24) & 0xFF
        state[4*i+1] ^= (rk >> 16) & 0xFF
        state[4*i+2] ^= (rk >> 8) & 0xFF
        state[4*i+3] ^= rk & 0xFF

    return bytes(state)

# GF(2^128) Multiplier for GHASH
def _gf_mult(x, y):
    R = 0xE1000000000000000000000000000000
    z = 0
    v = y
    for i in range(128):
        if (x >> (127 - i)) & 1:
            z ^= v
        if v & 1:
            v = (v >> 1) ^ (R << 64 if R > 0xFFFFFFFFFFFFFFFF else R)
            v ^= 0xE1000000000000000000000000000000
        else:
            v >>= 1
    return z & ((1 << 128) - 1)

def _ghash(h_int, data, aad=b''):
    # Padding
    padded_aad = aad + b'\x00' * ((16 - (len(aad) % 16)) % 16)
    padded_data = data + b'\x00' * ((16 - (len(data) % 16)) % 16)
    len_block = struct.pack('>QQ', len(aad) * 8, len(data) * 8)

    full = padded_aad + padded_data + len_block
    y = 0
    for i in range(0, len(full), 16):
        block_int = int.from_bytes(full[i:i+16], 'big')
        y ^= block_int
        # Multiply in GF(2^128)
        # Standard GCM polynomial multiplication
        z = 0
        v = h_int
        for bit in range(128):
            if (y >> (127 - bit)) & 1:
                z ^= v
            if v & 1:
                v = (v >> 1) ^ (0xE1 << 120)
            else:
                v >>= 1
        y = z
    return y.to_bytes(16, 'big')

def encrypt_aes_256_gcm(plaintext_bytes, key_bytes, iv_bytes, aad=b''):
    round_keys = _aes_key_expansion(key_bytes)
    # Generate H = AES_K(0^128)
    h_bytes = _aes_encrypt_block(b'\x00' * 16, round_keys)
    h_int = int.from_bytes(h_bytes, 'big')

    # Initial counter J0: for 96-bit (12-byte) IV, J0 = IV || 0^31 || 1
    j0 = iv_bytes + struct.pack('>I', 1)
    
    # Encrypt ciphertext via CTR
    ciphertext = bytearray()
    ctr = int.from_bytes(j0, 'big')

    for i in range(0, len(plaintext_bytes), 16):
        ctr = (ctr + 1) & ((1 << 128) - 1)
        ctr_bytes = ctr.to_bytes(16, 'big')
        keystream = _aes_encrypt_block(ctr_bytes, round_keys)
        chunk = plaintext_bytes[i:i+16]
        for b, k in zip(chunk, keystream):
            ciphertext.append(b ^ k)

    # Compute GHASH and Auth Tag
    s = _ghash(h_int, bytes(ciphertext), aad)
    tag_mask = _aes_encrypt_block(j0, round_keys)
    tag = bytes(a ^ b for a, b in zip(s, tag_mask))

    return bytes(ciphertext), tag

# --- Site Encryption Processing Pipeline ---

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
THEME_DIR = os.path.dirname(SCRIPT_DIR)
ROOT_DIR = os.path.dirname(THEME_DIR)
BASE_DIR = THEME_DIR
PUBLIC_DIR = os.path.join(THEME_DIR, 'exampleSite', 'public')
CONTENT_DIR = os.path.join(THEME_DIR, 'exampleSite', 'content')

def get_all_files(directory, ext='.html'):
    results = []
    if not os.path.exists(directory):
        return results
    for root, _, files in os.walk(directory):
        for f in files:
            if f.endswith(ext):
                results.append(os.path.join(root, f))
    return results

def extract_passwords(target_dir=None):
    password_map = {}
    candidate_dirs = [
        os.path.join(THEME_DIR, 'exampleSite', 'content'),
        os.path.join(ROOT_DIR, 'content'),
    ]
    if target_dir:
        sibling_content = os.path.join(os.path.dirname(target_dir), 'content')
        if os.path.exists(sibling_content) and sibling_content not in candidate_dirs:
            candidate_dirs.insert(0, sibling_content)

    for c_dir in candidate_dirs:
        if not os.path.exists(c_dir):
            continue
        md_files = get_all_files(c_dir, '.md')
        for md_path in md_files:
            with open(md_path, 'r', encoding='utf-8') as f:
                raw = f.read()

            fm_match = re.match(r'^---\r?\n([\s\S]*?)\r?\n---', raw)
            if fm_match:
                fm = fm_match.group(1)
                pw_match = re.search(r'password:\s*["\']?([^"\'\r\n]+)["\']?', fm)
                if pw_match:
                    password = pw_match.group(1).strip()
                    rel = os.path.splitext(os.path.relpath(md_path, c_dir))[0].lower()
                    password_map[rel] = password
                    base_name = os.path.splitext(os.path.basename(md_path))[0].lower()
                    password_map[base_name] = password

    return password_map

def process_encrypted_pages(target_dir=None):
    if not target_dir:
        import sys
        if len(sys.argv) > 1:
            if sys.argv[1] == '--dir' and len(sys.argv) > 2:
                target_dir = os.path.abspath(sys.argv[2])
            else:
                target_dir = os.path.abspath(sys.argv[1])
        else:
            target_dir = PUBLIC_DIR

    print(f"🔒 Running Build-Time AES-256-GCM Encryption Processor on {target_dir}...")
    passwords = extract_passwords(target_dir)
    html_files = get_all_files(target_dir, '.html')
    encrypted_count = 0

    pattern = re.compile(r'<div id=["\']?encrypted-content["\']?[^>]*>([\s\S]*?)</div>')

    for html_path in html_files:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()

        match = pattern.search(content)
        if match:
            rel_path = os.path.relpath(html_path, target_dir).replace('/index.html', '').replace('.html', '').lower()
            dir_name = os.path.basename(os.path.dirname(html_path)).lower()
            password = passwords.get(rel_path) or passwords.get(dir_name) or (list(passwords.values())[0] if passwords else None)

            if not password:
                print(f"⚠️ Warning: No password found for {html_path}. Skipping.")
                continue

            inner_html = match.group(1)
            salt = secrets.token_bytes(16)
            iv = secrets.token_bytes(12)
            iterations = 100000

            key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, 32)
            ciphertext, tag = encrypt_aes_256_gcm(inner_html.encode('utf-8'), key, iv)

            payload = {
                'ciphertext': base64.b64encode(ciphertext).decode('ascii'),
                'iv': base64.b64encode(iv).decode('ascii'),
                'salt': base64.b64encode(salt).decode('ascii'),
                'tag': base64.b64encode(tag).decode('ascii'),
                'iterations': iterations
            }

            json_payload = json.dumps(payload)
            secure_container = f'<div id="encrypted-content" class="carbon-encrypted-content" data-encrypted="true" data-payload=\'{json_payload}\'></div>'
            content = pattern.sub(secure_container, content, count=1)

            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"✅ Encrypted: {os.path.relpath(html_path, target_dir)}")
            encrypted_count += 1

    print(f"🔒 Encryption complete. Total encrypted documents: {encrypted_count}")

if __name__ == '__main__':
    process_encrypted_pages()
