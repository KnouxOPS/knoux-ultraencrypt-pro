// electron/main.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
// import crypto from 'crypto'; // Node.js Crypto module for backend operations
// TODO (Backend): Import actual crypto libraries and utility functions as needed.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use path.join for platform-agnostic paths
      contextIsolation: true, // Protect against prototype pollution
      nodeIntegration: false, // Keep Node.js integration off in renderer
      sandbox: true, // Recommended for renderer processes
    },
  });

  // Load the index.html of the app.
  // In development, you might load from a dev server e.g., http://localhost:3000
  // For production, load the built index.html file.
  if (process.env.NODE_ENV === 'development') {
    // mainWindow.loadURL('http://localhost:xxxx'); // Replace xxxx with your React dev server port
    // For local file serving during dev if not using a dev server for React:
     mainWindow.loadFile(path.join(__dirname, '../../index.html')); // Adjust path as necessary
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../index.html')); // Adjust path to your built React app's index.html
  }

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if ((process as NodeJS.Process).platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// --- TODO (Backend): IPC Handlers Implementation ---
// Implement handlers for all methods defined in the ElectronApi interface (types.ts)
// These handlers will contain the actual backend logic (cryptography, file system access, etc.)

// Example structure for an IPC handler:
// ipcMain.handle('encrypt-file', async (event, originalFilePath, outputDirectoryPath, passwordKey, algorithm, shredOriginal) => {
//   try {
//     console.log(`Main Process: Received encrypt-file request for ${originalFilePath}`);
//     // TODO (Backend):
//     // 1. Validate inputs.
//     // 2. Derive encryption key from passwordKey (e.g., using Argon2 or PBKDF2).
//     // 3. Generate IV/Salt.
//     // 4. Perform encryption using 'node:crypto' or other libs based on 'algorithm'.
//     //    const encryptedData = cryptoService.encrypt(fs.readFileSync(originalFilePath), derivedKey, iv, algorithm);
//     // 5. Construct encrypted file path in outputDirectoryPath.
//     //    const encryptedFilePath = path.join(outputDirectoryPath, `encrypted-${path.basename(originalFilePath)}`);
//     // 6. Write encryptedData to encryptedFilePath. Include IV/Salt/AuthTag as per chosen method.
//     //    fs.writeFileSync(encryptedFilePath, Buffer.concat([iv, salt, authTag, encryptedContent])); // Example
//     // 7. If shredOriginal is true, securely delete the original file.
//     //    if (shredOriginal) { /* await fileSystemService.shred(originalFilePath); */ }
//     // 8. Return result.
//     // return { success: true, encryptedFilePath, iv: iv.toString('hex'), salt: salt.toString('hex'), authTag: authTag.toString('hex') };
//     return { success: false, error: "Encryption logic not yet implemented in main.ts" }; // Placeholder
//   } catch (error: any) {
//     console.error('Encryption Error in Main Process:', error);
//     return { success: false, error: error.message || 'Unknown encryption error' };
//   }
// });

// System Dialogs
ipcMain.handle('select-file', async (_unusedEvent, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: options?.title,
    filters: options?.filters,
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-files', async (_unusedEvent, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: options?.title,
    filters: options?.filters,
  });
  return result.filePaths || null;
});

ipcMain.handle('select-directory', async (_unusedEvent, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: options?.title,
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-error-message', (event, title, content) => {
    if (mainWindow) dialog.showErrorBox(title, content);
});
ipcMain.handle('show-success-message', (event, title, content) => {
    if(mainWindow) dialog.showMessageBox(mainWindow, {type: 'info', title: title, message: content });
});


// --- TODO (Backend): Implement these IPC Handlers ---

// Cryptographic Operations
ipcMain.handle('encrypt-file', async () => {
  console.warn('IPC: encrypt-file called, but backend logic is a TODO.');
  // const [originalFilePath, outputDirectoryPath, passwordKey, algorithm, shredOriginal] = args;
  // Actual implementation needed here
  return { success: false, error: 'encryptFile not implemented in backend' };
});

ipcMain.handle('decrypt-file', async () => {
  console.warn('IPC: decrypt-file called, but backend logic is a TODO.');
  // const [encryptedFilePath, outputDirectoryPath, passwordKey, algorithm, iv, salt, authTag, shredEncrypted] = args;
  return { success: false, error: 'decryptFile not implemented in backend' };
});

ipcMain.handle('shred-file', async () => {
  console.warn('IPC: shred-file called, but backend logic is a TODO.');
  // Actual implementation needed here using fs to overwrite and delete
  return { success: false, error: 'shredFile not implemented in backend' };
});

ipcMain.handle('generate-password', async () => {
  console.warn('IPC: generate-password called, but backend logic is a TODO using node:crypto.');
  // Actual implementation needed here using crypto.randomBytes
  // Example (very basic, improve with options):
  // const length = options.length || 16;
  // const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  // let retVal = "";
  // for (let i = 0, n = charset.length; i < length; ++i) {
  //   retVal += charset.charAt(Math.floor(Math.random() * n));
  // }
  // return retVal;
  return "BackendGeneratedP@sswOrd123!"; // Placeholder
});

// Vault Management
ipcMain.handle('create-vault-directory', async () => {
  console.warn('IPC: create-vault-directory called, but backend logic is a TODO.');
  // 1. Create directory at vaultDirectoryPath/vaultName
  // 2. Create a metadata file (e.g., vault.knxmeta) inside it.
  // Example: fs.mkdirSync(path.join(vaultDirectoryPath, vaultName), { recursive: true });
  // const newVaultItem = { id: 'backend-uuid', name: vaultName, path: path.join(vaultDirectoryPath, vaultName), createdAt: Date.now(), encryptedFileCount: 0, totalSizeEncrypted: 0 };
  // fs.writeFileSync(path.join(newVaultItem.path, 'vault.knxmeta'), JSON.stringify({ vaultId: newVaultItem.id, name: newVaultItem.name /* ...other metadata */ }));
  // return { success: true, newVaultItem };
  return { success: false, error: 'createVaultDirectory not implemented' };
});

ipcMain.handle('delete-vault-directory', async () => {
  console.warn('IPC: delete-vault-directory called, but backend logic is a TODO.');
  // Securely delete the directory and its contents.
  // fs.rmSync(vaultDirectoryPath, { recursive: true, force: true });
  return { success: false, error: 'deleteVaultDirectory not implemented' };
});

ipcMain.handle('list-vault-contents', async () => {
  console.warn('IPC: list-vault-contents called, but backend logic is a TODO.');
  // Read metadata file or scan vault directory for encrypted files.
  // const files = [ { name: 'encrypted_doc.knxenc', path: path.join(vaultDirectoryPath, 'encrypted_doc.knxenc'), originalSize: 102400 }];
  // return { success: true, files };
  return { success: false, error: 'listVaultContents not implemented', files: [] };
});

ipcMain.handle('load-all-vaults-metadata', async () => {
  console.warn('IPC: load-all-vaults-metadata called, but backend logic is a TODO.');
  // Scan predefined locations or user-configured paths for vault.knxmeta files.
  // const vaults = [ { id: 'backend-uuid', name: 'My Documents Vault', path: '/path/to/My Documents Vault', createdAt: Date.now(), encryptedFileCount: 5, totalSizeEncrypted: 500000 }];
  // return { success: true, vaults };
  return { success: false, error: 'loadAllVaultsMetadata not implemented', vaults: [] };
});


// TODO (Backend): Add IPC handlers for other ElectronApi methods like:
// - addFileToVault
// - decryptFileFromVault
// - removeFileFromVault
// - checkPasswordStrengthAI (if implemented)
// - saveAppSettings / loadAppSettings (if backend manages settings)

console.log("Electron Main Process: Initialized and ready.");
console.log("App Path:", app.getAppPath());
console.log("User Data Path:", app.getPath('userData'));
console.log("Dirname in main.ts:", __dirname);
console.log("Preload script path:", path.join(__dirname, 'preload.js'));