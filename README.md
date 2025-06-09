# KNOUX UltraEncrypt Pro 🛡️🔐 (v11 Frontend)

**Current Status: Advanced Frontend User Interface for an Electron-Based Local Encryption Utility. Critical backend implementation in Electron's main process is required for full functionality.**

**KNOUX UltraEncrypt Pro** is designed as a world-class, desktop application focused on providing robust, local-first file encryption, decryption, and data protection. It features a premium user experience, strong security principles, and comprehensive functionality to empower users to safeguard their sensitive data directly on their devices. This application, once fully implemented, will operate **entirely locally**, with no reliance on external APIs or cloud services for its core cryptographic functions.

**Developed by: Eng. Sadek elgazar** ([support@knoux7.com](mailto:support@knoux7.com), WhatsApp: 0503281920, Abu Dhabi, UAE)

---

## 🚀 Project Goal & Vision

The ultimate goal is to deliver a secure, reliable, and user-friendly desktop application that provides end-to-end local encryption capabilities. This repository contains the **frontend UI** and **templates for the Electron backend structure**. The actual backend logic, running in the Electron main process, is essential for realizing this vision.

---

## ✨ Core Features (Frontend UI Implemented, Backend Logic Required)

KNOUX UltraEncrypt Pro's frontend supports a suite of powerful tools for data security:

### 1. Advanced Encryption & Decryption
*   **UI for Algorithm Selection:** AES-256-GCM, ChaCha20-Poly1305. UI placeholders for Post-Quantum (NTRU, Kyber).
    *   **Backend TODO (in `electron/main.ts`):** Implement these algorithms using Node.js `crypto` module. For PQC, research and integrate suitable libraries or WASM modules.
*   **UI for File & Folder Operations:** Encrypt and decrypt individual files.
    *   **Backend TODO (in `electron/main.ts`):** Implement robust file/folder processing, handling large files, and potential recursive operations for folders.
*   **UI for Password Input:**
    *   **Backend TODO (in `electron/main.ts`):** Implement strong Key Derivation Functions (KDFs) like Argon2 or PBKDF2 from user passwords.
*   **UI for Metadata Display (Conceptual):**
    *   **Backend TODO (in `electron/main.ts`):** Securely generate, manage, and store/retrieve IVs, salts, and authentication tags. Decide on storage strategy (e.g., prepended to file, sidecar file).
*   **UI for Progress Indication:**
    *   **Backend TODO (in `electron/main.ts`):** Provide progress updates to the frontend via IPC for long operations.

### 2. Vault Management (Protected Folders)
*   **UI for Creating & Managing Vaults:**
    *   **Backend TODO (in `electron/main.ts`):** Implement directory creation, deletion, and metadata management for vaults (e.g., a `.knouxvault` index file within the vault to track encrypted files, original names, manifest, etc., without exposing sensitive data).
*   **UI for Vault Dashboard/Listing:** Display name, path, conceptual file count/size.
    *   **Backend TODO (in `electron/main.ts`):** Provide APIs to list vault contents and gather statistics.

### 3. Comprehensive Activity Log (Frontend Implemented, Backend Interaction Needed for some logs)
*   **UI for Displaying Logs:** Lists operations, timestamps, status, details.
    *   **Backend TODO (in `electron/main.ts`):** Ensure critical backend operations also log their status to be relayed or directly added to the log via IPC if appropriate.

### 4. Smart Key Generator
*   **UI for Generating Strong Passwords:** Customizable length and character sets.
*   **UI for Password Strength Indicator:** Basic strength indication implemented.
    *   **Backend TODO (Optional AI Feature in `electron/main.ts`):** Implement an advanced password strength checker (e.g., using zxcvbn or a simple ML model) via an `electronAPI` call.
*   **UI for Copying Keys:**
    *   **Frontend Note:** Password generation via `window.electronAPI.generatePassword` relies on backend for cryptographically secure random number generation. A fallback is provided for UI testing if API is unavailable.

### 5. Secure File Shredder
*   **UI for File Selection & Shred Passes:**
    *   **Backend TODO (in `electron/main.ts`):** Implement irreversible file deletion by overwriting content multiple times using Node.js `fs` module. Handle errors and provide feedback.
*   **UI for Warnings & Confirmation:**

### 6. User-Centric UI/UX (Frontend Implemented)
*   Intuitive Tabs, Dual Language Support (EN/AR), Theming (Dark/Light), Responsive Design.

### 7. Local-First & Privacy-Focused (Architectural Goal)
*   **Frontend Design:** All interactions requiring cryptographic operations or file system access are designed to go through `window.electronAPI`.
    *   **Backend Imperative:** The Electron main process **must** be the sole executor of these sensitive tasks. No cryptography or direct FS access from the React renderer.

---
## 🛑 CRITICAL: Backend Implementation Required (Electron Main Process)

This project currently provides the **USER INTERFACE (FRONTEND)** and **structural templates for Electron (`electron/main.ts`, `electron/preload.ts`, `package.json`)**. For the application to function as intended, a **BACKEND** running in the Electron main process must be developed. This backend will handle all security-critical operations.

**The contract between the Frontend (React) and the Backend (Electron Main Process) is defined by the `ElectronApi` interface in `types.ts`. The `electron/preload.ts` script exposes this API to the frontend securely.**

### Key Backend Modules/Services to Implement within `electron/main.ts` (or imported services):

1.  **Cryptography Service (`electron/services/cryptoService.ts` - to be created by backend dev):**
    *   **`encryptFile` Logic:**
        *   Derive encryption key from password (use strong KDF like Argon2).
        *   Generate unique IV/salt per encryption. Perform encryption (AES-256-GCM, ChaCha20-Poly1305). Store/prepend IV, salt, auth tag.
    *   **`decryptFile` Logic:**
        *   Derive decryption key. Extract/use IV, salt, auth tag. Perform decryption and verify.
    *   **`generatePassword` Logic:**
        *   Implement cryptographically secure random password generation.
    *   **(PQC TODO):** Integration of Post-Quantum Cryptography libraries.

2.  **File System Service (`electron/services/fileSystemService.ts` - to be created by backend dev):**
    *   **`shredFile` Logic:** Secure file shredding (multiple overwrites).
    *   Handle file read/write operations for encryption/decryption.
    *   Implement the backend for dialogs (`selectFile`, `selectFiles`, `selectDirectory`) using Electron's `dialog` module (templates provided in `electron/main.ts`).

3.  **Vault Management Service (`electron/services/vaultService.ts` - to be created by backend dev):**
    *   **`createVaultDirectory` Logic:** Create directory, initialize vault metadata file.
    *   **`deleteVaultDirectory` Logic:** Securely delete vault directory.
    *   **`listVaultContents` Logic:** Read vault metadata.
    *   **`loadAllVaultsMetadata` Logic:** Scan for vault metadata files.
    *   Logic for adding/removing files to/from vaults (involves cryptoService).

4.  **IPC Handling (in `electron/main.ts`):**
    *   Implement IPC listeners (`ipcMain.handle`) for all channels defined in `ElectronApi`.
    *   Delegate calls to appropriate backend services. (Templates provided in `electron/main.ts`).

5.  **Configuration & Settings Management (Backend - if needed):**
    *   Securely store/retrieve application settings.

---

## 🛠️ Tech Stack

*   **Frontend (Provided):**
    *   UI Library: React 19+
    *   Language: TypeScript
    *   Styling: Tailwind CSS
    *   Animation: Framer Motion
    *   Icons: React Icons
    *   State Management: React Context API
*   **Desktop Framework (Templates Provided, Backend Logic Required):** Electron
    *   **Backend Logic (Required):** Node.js (within Electron main process - `electron/main.ts`)
    *   **Cryptography (Backend - Node.js):** `node:crypto` module. External libraries for PQC.
    *   **File System Access (Backend - Node.js):** `node:fs` module.

---

## 🚀 Getting Started (Development)

### Prerequisites
*   Node.js (LTS version, e.g., 18.x or 20.x)
*   npm or yarn

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running Tests
Execute unit tests with Jest and React Testing Library:
```bash
npm test
```

### Running the Application (Frontend + Electron Shell)
The provided `package.json` includes scripts to help run the Electron application.
1.  **Compile Electron TypeScript files:**
    ```bash
    npm run build:electron 
    # This compiles electron/main.ts and electron/preload.ts to JavaScript in the same directory.
    ```
2.  **Start Electron:**
    ```bash
    npm start
    # This command (defined in package.json) typically runs the compiled Electron app.
    # For development with hot-reloading of React UI, you might run your React dev server
    # (e.g., `npm run start:react`) and configure electron/main.ts to loadURL from it.
    # The current electron/main.ts template loads index.html directly.
    ```
**Note:** The Electron application will launch, and the UI will be functional. However, operations requiring backend logic (encryption, shredding, vault creation) will trigger `console.warn` messages in the Electron main process console and return placeholder/error responses until the `TODO (Backend)` sections in `electron/main.ts` are fully implemented.

### Building for Production
(Conceptual, requires `electron-builder` setup and completed backend)
```bash
npm run package
# or for specific platforms:
# npm run package:win
# npm run package:mac
# npm run package:linux
```

---

## 📁 Project Structure Overview

*   **`index.tsx`**: Entry point for the React application (renderer process).
*   **`App.tsx`**: Main React application component (routing, layout).
*   **`contexts/AppContext.tsx`**: Global state and proxies for `window.electronAPI`.
*   **`pages/`**: UI for each main feature.
*   **`components/`**: Reusable UI elements.
*   **`types.ts`**: TypeScript definitions, including `ElectronApi`.
*   **`constants.ts`**: Translations and app-wide constants.
*   **`electron/`**:
    *   **`main.ts`**: (Template Provided) Electron main process entry point. **Backend logic to be implemented here.**
    *   **`preload.ts`**: (Template Provided) Securely exposes `electronAPI` to the frontend.
    *   **`tsconfig.json`**: TypeScript configuration for Electron files.
*   **`package.json`**: (Template Provided) Project metadata, scripts, dependencies.
*   **`tsconfig.json`**: TypeScript configuration for the React frontend.
*   **`README.md`**: This file.
*   **`SECURITY.md`**: (Template Provided) Security policy and considerations. **Requires backend team input.**

---

## 🔒 Security Considerations for Backend Development

*   **Isolate Sensitive Operations:** All cryptography, key handling, and file system access MUST occur in the Electron main process (`electron/main.ts`), never in the renderer (React UI). Use Electron's `contextIsolation: true` and `sandbox: true` (templates are configured this way).
*   **Strong Key Derivation:** Use Argon2 (preferred) or PBKDF2.
*   **Secure Randomness:** Use `crypto.randomBytes()`.
*   **Authenticated Encryption (AEAD):** Use AES-GCM or ChaCha20-Poly1305.
*   Refer to `SECURITY.md` (template provided) for a more detailed threat model and guidance. **This document requires significant input from the backend development team.**

---

## 🧪 Testing Strategy (TODO for Full Application)
*   **Frontend Unit Tests:** Jest/RTL for React components.
*   **Backend Unit Tests:** Test crypto functions, file utilities in `electron/main.ts`.
*   **Integration Tests:** Test IPC communication.
*   **E2E Tests:** Playwright or Spectron.
*   **Security Testing:** SAST, DAST, penetration testing.

---

## 🌍 Path to Global-Class Product (Further Steps)

1.  **Complete Backend Implementation:** Implement all `TODO (Backend)` sections in `electron/main.ts` and related service files.
2.  **Rigorous Testing.**
3.  **Comprehensive Documentation:** Complete `SECURITY.md`, User Manual, Developer Docs.
4.  **Cross-Platform Installers & Code Signing.**
5.  **Auto-Updates & CI/CD Pipeline.**

---

**"KNOUX UltraEncrypt Pro: Your Data, Your Control, Secured Locally."**
