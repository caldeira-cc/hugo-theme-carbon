---
title: "Client-Side Encrypted Secrets Container"
description: "How to protect sensitive documentation and confidential notes using browser-native PBKDF2 key derivation and AES-256-GCM encryption."
date: 2026-08-24T12:00:00Z
author: "César Caldeira"
categories: ["Security", "Encryption"]
tags: ["Cryptography", "AES-GCM", "Security"]
version: "v11.2.0"
password: "carbon-secret-token"
---

This document demonstrates the **Client-Side Encrypted Secrets** module of the Hugo-Carbon engine.

```
┌────────────────────────────────────────────────────────┐
│             AES-256-GCM Encrypted Payload              │
│                 (Decryption Key: carbon-secret-token)  │
├────────────────────────────────────────────────────────┤
│ Password Entry -> PBKDF2 (100,000 iterations, SHA-256) │
│                -> AES-GCM In-Memory Decryption         │
└────────────────────────────────────────────────────────┘
```

The content of this document is encrypted at build time into an AES-256-GCM ciphertext payload with a unique salt and initialization vector (IV). It is decrypted strictly inside client memory upon password entry (`carbon-secret-token`).

### Confidential Technical Architecture Notes
1. **Zero Plaintext Leakage**: The static HTML contains only base64 ciphertext; plaintext is never written to public HTML or server logs.
2. **Web Crypto API**: Decryption executes via standard browser `window.crypto.subtle` APIs with zero external cryptographic dependencies.
3. **Session Memory**: Decrypted content remains in client memory for the session duration and clears immediately upon page navigation.
