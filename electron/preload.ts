// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronApi, PasswordGenerationOptions, EncryptionAlgorithm, AIPasswordStrengthResult, VaultFile, VaultItem } from '../types'; // Adjust path if your types.ts is elsewhere

const KEEPALIVE_CHANNEL = 'ipc-keepalive';
let keepaliveInterval: NodeJS.Timeout | null = null;

const exposedApi: ElectronApi = {
  // Generic IPC (less used if specific methods are defined)
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener);
    // Return an unlistener function
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  // System Dialogs & Info
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectFiles: (options) => ipcRenderer.invoke('select-files', options),
  selectDirectory: (options) => ipcRenderer.invoke('select-directory', options),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showErrorMessage: (title, content) => ipcRenderer.invoke('show-error-message', title, content),
  showSuccessMessage: (title, content) => ipcRenderer.invoke('show-success-message', title, content),
  
  // Cryptographic Operations
  encryptFile: (originalFilePath, outputDirectoryPath, passwordKey, algorithm, shredOriginal) => 
    ipcRenderer.invoke('encrypt-file', originalFilePath, outputDirectoryPath, passwordKey, algorithm, shredOriginal),
  
  decryptFile: (encryptedFilePath, outputDirectoryPath, passwordKey, algorithm, iv, salt, authTag, shredEncrypted) => 
    ipcRenderer.invoke('decrypt-file', encryptedFilePath, outputDirectoryPath, passwordKey, algorithm, iv, salt, authTag, shredEncrypted),
  
  shredFile: (filePath, passes) => ipcRenderer.invoke('shred-file', filePath, passes),
  
  generatePassword: (options: PasswordGenerationOptions) => ipcRenderer.invoke('generate-password', options),
  
  // Optional AI feature - check if backend implements it
  checkPasswordStrengthAI: async (password: string): Promise<AIPasswordStrengthResult> => {
    // Backend should handle this. If 'check-password-strength-ai' IPC isn't registered, this will error.
    try {
        const result = await ipcRenderer.invoke('check-password-strength-ai', password);
        return result || { score: 0, feedback: { warning: "AI check unavailable" } }; // Fallback if backend returns null/undefined
    } catch (e) {
        console.warn("checkPasswordStrengthAI IPC call failed. Is it implemented in main.ts?", e);
        return { score: 0, feedback: { warning: "AI strength check feature not available or encountered an error." } };
    }
  },

  // Vault Management
  createVaultDirectory: (vaultDirectoryPath: string, vaultName: string): Promise<{ success: boolean; error?: string; newVaultItem?: VaultItem }> =>
    ipcRenderer.invoke('create-vault-directory', vaultDirectoryPath, vaultName),
  
  deleteVaultDirectory: (vaultDirectoryPath: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('delete-vault-directory', vaultDirectoryPath),

  listVaultContents: (vaultDirectoryPath: string): Promise<{ success: boolean; files: VaultFile[]; error?: string; }> =>
    ipcRenderer.invoke('list-vault-contents', vaultDirectoryPath),

  loadAllVaultsMetadata: (): Promise<{ success: boolean; vaults: VaultItem[]; error?: string; }> =>
    ipcRenderer.invoke('load-all-vaults-metadata'),
  
  // Operations within a Vault (Conceptual - these would involve encryption/decryption)
  addFileToVault: (vaultDirectoryPath: string, sourceFilePath: string, passwordKey: string, algorithm: EncryptionAlgorithm): Promise<{ success: boolean; error?: string; addedFile?: VaultFile }> =>
    ipcRenderer.invoke('add-file-to-vault', vaultDirectoryPath, sourceFilePath, passwordKey, algorithm),

  decryptFileFromVault: (vaultDirectoryPath: string, encryptedFileNameInVault: string, outputDirectoryPath: string, passwordKey: string): Promise<{ success: boolean; error?: string; decryptedFilePath?: string }> =>
    ipcRenderer.invoke('decrypt-file-from-vault', vaultDirectoryPath, encryptedFileNameInVault, outputDirectoryPath, passwordKey),
  
  removeFileFromVault: (vaultDirectoryPath: string, encryptedFileNameInVault: string, shred?: boolean): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('remove-file-from-vault', vaultDirectoryPath, encryptedFileNameInVault, shred),

  // Application Settings (if backend needs to manage them)
  saveAppSettings: (settings: any): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('save-app-settings', settings),
  
  loadAppSettings: (): Promise<{ success: boolean; settings?: any; error?: string }> =>
    ipcRenderer.invoke('load-app-settings'),
};

try {
  contextBridge.exposeInMainWorld('electronAPI', exposedApi);
  console.log('Electron Preload: electronAPI exposed successfully.');

  // Keepalive mechanism: Send a ping to main process every 30 seconds
  // This can help keep the IPC channel "warm" or detect if main process becomes unresponsive
  // (though Electron's built-in IPC is generally robust).
  // Only start if not already running (e.g. if preload script is somehow executed multiple times for same context)
  if (!keepaliveInterval) {
    keepaliveInterval = setInterval(() => {
      ipcRenderer.send(KEEPALIVE_CHANNEL, { timestamp: Date.now() });
    }, 30000); 
    console.log('Electron Preload: IPC Keepalive started.');
  }

} catch (error) {
  console.error('Electron Preload Error: Failed to expose electronAPI or start keepalive.', error);
}

// Example of listening to an event from main process:
// ipcRenderer.on('main-process-event', (event, ...args) => {
//   console.log('Received event from main process:', channel, args);
//   // You could dispatch a custom window event here for React components to listen to
//   // window.dispatchEvent(new CustomEvent('main-event-name', { detail: args }));
// });

// Cleanup keepalive on window unload (though renderer context destruction usually handles this)
window.addEventListener('unload', () => {
  if (keepaliveInterval) {
    clearInterval(keepaliveInterval);
    keepaliveInterval = null;
    console.log('Electron Preload: IPC Keepalive stopped.');
  }
});
