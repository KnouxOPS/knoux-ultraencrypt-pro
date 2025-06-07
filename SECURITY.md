# Security Policy for KNOUX UltraEncrypt Pro

## Our Commitment to Security

KNOUX UltraEncrypt Pro is designed with security as a paramount concern. Our goal is to provide users with a robust tool to protect their sensitive data locally. We are committed to transparency and continuous improvement in the security of our application.

**Note:** This application operates entirely locally. Your files and passwords (during active use for encryption/decryption) are processed on your device and are not transmitted to any external servers by KNOUX UltraEncrypt Pro.

## Supported Versions

We aim to provide security updates for the latest major version of KNOUX UltraEncrypt Pro. Users are encouraged to keep their application updated.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

**(TODO: Update this table as versions are released.)**

## Reporting a Vulnerability

We take all security vulnerabilities seriously. If you believe you have found a security vulnerability in KNOUX UltraEncrypt Pro, please report it to us responsibly.

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us directly at: **`security@knoux7.com`** (TODO: Verify or set up this dedicated email).

Please include the following details in your report:
*   A clear description of the vulnerability.
*   The version of KNOUX UltraEncrypt Pro affected.
*   Steps to reproduce the vulnerability, including any relevant code snippets, screenshots, or proof-of-concept.
*   The potential impact of the vulnerability.
*   Any suggested mitigation or fix, if you have one.

We will acknowledge your report within 48-72 hours and will work with you to understand and address the issue. We appreciate your efforts in helping us keep KNOUX UltraEncrypt Pro secure. We may offer recognition for valid and responsibly disclosed vulnerabilities once resolved.

## Security Architecture Overview

**(TODO: This section needs to be filled in by the backend development team once the architecture is finalized. It should cover key aspects like:)**

*   **Electron Security:**
    *   Context Isolation (`contextIsolation: true`)
    *   Sandbox (`sandbox: true` for renderer processes where possible)
    *   IPC (Inter-Process Communication) security measures.
    *   Permission handling.
*   **Cryptography:**
    *   Algorithms used (AES-256-GCM, ChaCha20-Poly1305).
    *   Key Derivation Functions (KDFs) used (e.g., Argon2, PBKDF2) and their parameters.
    *   Management of IVs, salts, and authentication tags.
    *   Secure random number generation.
*   **Data Storage:**
    *   How application settings are stored (if any sensitive data is involved).
    *   How vault metadata is stored and protected.
    *   Encryption of data at rest (for application's own sensitive data, not user files which are explicitly encrypted by user).
*   **File System Interaction:**
    *   Secure handling of file paths and operations.
    *   Protection against path traversal and other file system attacks.
*   **Secure Shredding:**
    *   Methodology for overwriting file data.

## Threat Model

**(TODO: Develop a comprehensive threat model. Consider threats such as:)**

*   **Malware on the user's system:**
    *   Attempting to steal passwords from memory during input.
    *   Accessing unencrypted files or inappropriately cached data.
    *   Tampering with the application's code or configuration.
*   **Physical access to the user's device:**
    *   Attempting to recover data from application files or disk.
*   **Weak user passwords:**
    *   Brute-force attacks against encrypted files if weak passwords are used.
*   **Implementation bugs in cryptographic functions.**
*   **Vulnerabilities in dependencies (Electron, Node.js, libraries).**
*   **Side-channel attacks (e.g., timing attacks, cache attacks) - typically more advanced.**
*   **Attacks against the update mechanism (if auto-updates are implemented).**

For each threat, consider the likelihood, impact, and existing/planned mitigations.

## Security Best Practices for Users

*   **Use Strong, Unique Passwords:** For encrypting your files, always use strong, unique passwords that you do not use for other services. Consider using the built-in Key Generator.
*   **Keep Your System Secure:** Ensure your operating system and antivirus software are up to date.
*   **Download from Official Sources:** Only download KNOUX UltraEncrypt Pro from official and trusted sources.
*   **Be Cautious with Shredding:** Understand that shredded files are permanently irrecoverable.
*   **Backup Important Data:** While KNOUX UltraEncrypt Pro helps secure your data, it is not a backup solution. Always maintain separate backups of important unencrypted and encrypted data.
*   **Store Passwords Securely:** Do not write down your encryption passwords in easily accessible places. Consider using a reputable password manager. **Losing your password means losing access to your encrypted data permanently.**

## Dependencies

**(TODO: List key dependencies and any security considerations related to them. For example:)**
*   Electron: (Link to Electron's security documentation)
*   Node.js: (Used by Electron, benefits from Node.js security updates)
*   `node:crypto`: Standard Node.js crypto module.
*   (Any other crypto libraries, UI libraries if they have specific security notes)

---

We are dedicated to making KNOUX UltraEncrypt Pro a trustworthy tool for your data security needs.
