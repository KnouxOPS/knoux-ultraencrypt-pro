export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  English = 'en',
  Arabic = 'ar',
}

export enum EncryptionAlgorithm {
  AES256_GCM = 'aes-256-gcm', 
  AES512_GCM = 'aes-512-gcm', // Node's crypto often uses 256 for GCM; this might map to AES-256 or require custom handling if 512 is strict.
  ChaCha20_Poly1305 = 'chacha20-poly1305',
  NTRU = 'ntru', 
  Kyber = 'kyber', 
}

export interface AlgorithmOption {
  value: EncryptionAlgorithm;
  labelKey: string; 
  isPostQuantum?: boolean;
}

export interface BaseFileInfo {
  id: string;
  name:string;
  path: string; 
  size: number; 
  type: string; 
  error?: string;
  progress?: number; 
}

export interface EncryptFileResult extends EncryptFileInfo {
  encryptedPath: string;
  iv?: string; // Initialization Vector (hex)
  salt?: string; // Salt used for KDF (hex)
  authTag?: string; // Authentication Tag for AEAD modes like GCM (hex)
}

export interface EncryptFileInfo extends BaseFileInfo {
  status: 'pending' | 'encrypting' | 'encrypted' | 'failed';
  encryptedPath?: string; 
  iv?: string;
  salt?: string;
  authTag?: string;
}

export interface DecryptFileInfo extends BaseFileInfo {
  status: 'pending' | 'decrypting' | 'decrypted' | 'failed';
  decryptedPath?: string; 
}

export interface VaultItem {
  id: string;
  name: string; 
  path: string; 
  createdAt: number;
  encryptedFileCount: number; 
  totalSizeEncrypted: number; 
  // TODO (Backend): Consider adding lastAccessed, description, etc.
}

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  operation: 'encrypt' | 'decrypt' | 'shred' | 'key_generate' | 'vault_create' | 'vault_delete' | 'vault_list_contents' | 'settings_change' | 'app_start' | 'error_generic' | 'login' | 'logout';
  details: string; 
  status: 'success' | 'failure' | 'info' | 'warning';
  targetFile?: string;
  targetVault?: string;
  algorithmUsed?: EncryptionAlgorithm;
  errorDetails?: string;
  username?: string;
}

export interface UserProfile { 
  name: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  // Add other user-specific fields if needed
}

export interface AppTranslations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export interface VaultFile {
  name: string; // Original name or encrypted name within vault
  path: string; // Full path to the encrypted file within the vault
  originalSize?: number; // Size of the original unencrypted file
  encryptedAt?: number; // Timestamp of encryption
  type?: string; // Original mime type or extension if known/stored
  // TODO (Backend): Consider adding metadata like IV, salt, algo used if stored per-file in vault manifest
}

export interface PasswordGenerationOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface AIPasswordStrengthResult {
    score: 0 | 1 | 2 | 3 | 4; // NIST score: 0 (too guessable) to 4 (very unguessable)
    feedback?: {
        warning?: string;
        suggestions?: string[];
    };
    guesses_log10?: number; // For advanced metrics
}


// Electron API exposed via preload script
// This interface is the contract between Frontend (React) and Backend (Electron Main Process)
export interface ElectronApi {
  // Generic IPC (less used if specific methods are defined)
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (...args: any[]) => void) => (() => void) | undefined;
  
  // System Dialogs & Info
  selectFile: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
  selectFiles: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string[] | null>;
  selectDirectory: (options?: { title?: string }) => Promise<string | null>;
  getAppVersion: () => Promise<string>;
  showErrorMessage: (title: string, content: string) => void;
  showSuccessMessage: (title: string, content: string) => void;

  // Cryptographic Operations
  encryptFile: (
    originalFilePath: string, 
    outputDirectoryPath: string, // Directory to save in, backend generates filename
    passwordKey: string, 
    algorithm: EncryptionAlgorithm,
    shredOriginal?: boolean // Optional: request shredding of original after successful encryption
  ) => Promise<{ success: boolean; error?: string; encryptedFilePath?: string; iv?: string; salt?: string; authTag?: string }>;
  
  decryptFile: (
    encryptedFilePath: string, 
    outputDirectoryPath: string, // Directory to save in, backend derives original filename if possible
    passwordKey: string, 
    algorithm: EncryptionAlgorithm, // Algorithm might be auto-detected by backend from file metadata
    iv?: string, // Optional, if not embedded
    salt?: string, // Optional, if not embedded
    authTag?: string, // Optional, if not embedded
    shredEncrypted?: boolean // Optional: request shredding of encrypted file after successful decryption
  ) => Promise<{ success: boolean; error?: string; decryptedFilePath?: string }>;
  
  shredFile: (filePath: string, passes?: number) => Promise<{ success: boolean; error?: string }>;
  
  generatePassword: (options: PasswordGenerationOptions) => Promise<string>; // Uses crypto.randomBytes
  checkPasswordStrengthAI?: (password: string) => Promise<AIPasswordStrengthResult>; // Conceptual AI feature

  // Vault Management
  createVaultDirectory: (vaultDirectoryPath: string, vaultName: string) => Promise<{ success: boolean; error?: string; newVaultItem?: VaultItem }>;
  deleteVaultDirectory: (vaultDirectoryPath: string) => Promise<{ success: boolean; error?: string }>; // Deletes directory and its metadata
  listVaultContents: (vaultDirectoryPath: string) => Promise<{ success: boolean; files: VaultFile[]; error?: string; }>;
  loadAllVaultsMetadata: () => Promise<{ success: boolean; vaults: VaultItem[]; error?: string; }>; // Scans for vault metadata files
  
  // Operations within a Vault (Conceptual - these would involve encryption/decryption)
  addFileToVault: (vaultDirectoryPath: string, sourceFilePath: string, passwordKey: string, algorithm: EncryptionAlgorithm) => Promise<{ success: boolean; error?: string; addedFile?: VaultFile }>;
  decryptFileFromVault: (vaultDirectoryPath: string, encryptedFileNameInVault: string, outputDirectoryPath: string, passwordKey: string) => Promise<{ success: boolean; error?: string; decryptedFilePath?: string }>;
  removeFileFromVault: (vaultDirectoryPath: string, encryptedFileNameInVault: string, shred?: boolean) => Promise<{ success: boolean; error?: string }>;

  // Application Settings (if backend needs to manage them)
  saveAppSettings?: (settings: any) => Promise<{ success: boolean; error?: string }>;
  loadAppSettings?: () => Promise<{ success: boolean; settings?: any; error?: string }>;
}


declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

export interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string, ...args: (string | number)[]) => string;
  
  // Old UserProfile - consider replacing with CurrentUser if login is primary
  userProfile: UserProfile; // This might become deprecated or used for app settings preferences not user identity
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Auth State
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  activityLog: ActivityLogEntry[];
  addLogEntry: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  clearActivityLog: () => void;

  vaults: VaultItem[];
  addVault: (vaultName: string, vaultPath: string) => Promise<VaultItem | null>;
  deleteVault: (vaultId: string) => Promise<void>; 
  listVaultContents: (vaultPath: string) => Promise<VaultFile[] | null>;

  currentEncryptionJobs: EncryptFileInfo[];
  setCurrentEncryptionJobs: React.Dispatch<React.SetStateAction<EncryptFileInfo[]>>;
  currentDecryptionJobs: DecryptFileInfo[];
  setCurrentDecryptionJobs: React.Dispatch<React.SetStateAction<DecryptFileInfo[]>>;

  selectFile: (options?: Parameters<ElectronApi['selectFile']>[0]) => Promise<string | null>;
  selectFiles: (options?: Parameters<ElectronApi['selectFiles']>[0]) => Promise<string[] | null>;
  selectDirectory: (options?: Parameters<ElectronApi['selectDirectory']>[0]) => Promise<string | null>;
  generatePassword: (options: PasswordGenerationOptions) => Promise<string>;
  getAppVersion: () => Promise<string>;
}
