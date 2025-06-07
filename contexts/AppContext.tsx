
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Theme, Language, UserProfile, ActivityLogEntry, VaultItem, EncryptFileInfo, DecryptFileInfo, PasswordGenerationOptions, VaultFile, ElectronApi, CurrentUser, AppContextType } from '../types';
import { DEFAULT_THEME, DEFAULT_LANGUAGE, TRANSLATIONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('knoux-ultraencrypt-theme') as Theme;
    return storedTheme || DEFAULT_THEME as Theme;
  });
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('knoux-ultraencrypt-lang') as Language;
    return storedLang || DEFAULT_LANGUAGE;
  });
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('knoux-ultraencrypt-isAuthenticated');
    return storedAuth === 'true';
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const storedUser = localStorage.getItem('knoux-ultraencrypt-currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // UserProfile might be for app preferences rather than identity if full auth is used
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: "Valued User" }); 
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [vaults, setVaults] = useState<VaultItem[]>([]);
  const [electronApiAvailable, setElectronApiAvailable] = useState(false);

  const [currentEncryptionJobs, setCurrentEncryptionJobs] = useState<EncryptFileInfo[]>([]);
  const [currentDecryptionJobs, setCurrentDecryptionJobs] = useState<DecryptFileInfo[]>([]);


  useEffect(() => {
    localStorage.setItem('knoux-ultraencrypt-theme', theme);
    if (theme === Theme.Dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('knoux-ultraencrypt-lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.Arabic ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('knoux-ultraencrypt-isAuthenticated', 'true');
      localStorage.setItem('knoux-ultraencrypt-currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('knoux-ultraencrypt-isAuthenticated');
      localStorage.removeItem('knoux-ultraencrypt-currentUser');
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (window.electronAPI) {
      setElectronApiAvailable(true);
    }
  }, []);

   useEffect(() => {
    const loadAppData = async () => {
      if (window.electronAPI?.loadAllVaultsMetadata) {
        try {
          const result = await window.electronAPI.loadAllVaultsMetadata();
          if (result.success) {
            setVaults(result.vaults);
          } else {
            console.error("Failed to load vaults from backend:", result.error);
            const storedVaults = localStorage.getItem('knoux-ultraencrypt-vaults');
            if (storedVaults) setVaults(JSON.parse(storedVaults));
          }
        } catch (e) {
          console.error("Error calling loadAllVaultsMetadata:", e);
          const storedVaults = localStorage.getItem('knoux-ultraencrypt-vaults');
          if (storedVaults) setVaults(JSON.parse(storedVaults));
        }
      } else {
        const storedVaults = localStorage.getItem('knoux-ultraencrypt-vaults');
        if (storedVaults) {
          setVaults(JSON.parse(storedVaults));
        }
        if (!window.electronAPI) console.warn("window.electronAPI not available. Using localStorage for vaults.");
        else if(!window.electronAPI.loadAllVaultsMetadata) console.warn("window.electronAPI.loadAllVaultsMetadata not available. Using localStorage for vaults.");
      }

      const storedLogs = localStorage.getItem('knoux-ultraencrypt-logs');
      if (storedLogs) {
        setActivityLog(JSON.parse(storedLogs));
      }
    };
    loadAppData();
  }, []);

  useEffect(() => {
    localStorage.setItem('knoux-ultraencrypt-logs', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    if (!electronApiAvailable || !window.electronAPI?.loadAllVaultsMetadata) { 
      localStorage.setItem('knoux-ultraencrypt-vaults', JSON.stringify(vaults));
    }
  }, [vaults, electronApiAvailable]);


  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setLanguage = (newLang: Language) => setLanguageState(newLang);

  const translate = useCallback((key: string, ...args: (string | number)[]): string => {
    let translation = TRANSLATIONS[key]?.[language] || key;
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, String(arg));
      });
    }
    return translation;
  }, [language]);

  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profileUpdate }));
  };

  const addLogEntry = useCallback((entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    setActivityLog(prev => [newEntry, ...prev.slice(0, 199)]);
  }, []);

  const clearActivityLog = useCallback(() => {
    setActivityLog([]);
    addLogEntry({ operation: 'settings_change', details: 'Activity log cleared.', status: 'info' });
  }, [addLogEntry]);

  // Mock Login Function
  const login = async (username: string, password_param: string): Promise<boolean> => { // Renamed password to password_param
    console.log(`TODO (Backend): Implement actual authentication for user: ${username}`);
    // For UI demonstration:
    if (username.trim() !== '' && password_param.trim() !== '') {
      const demoUser: CurrentUser = { id: uuidv4(), username: username.trim() };
      if (username.trim() === 'demoUser' && password_param === 'demoPass') {
        setIsAuthenticated(true);
        setCurrentUser(demoUser);
        addLogEntry({ operation: 'login', details: `User '${username}' logged in successfully (Demo).`, status: 'success', username });
        return true;
      }
      // Generic success for any non-empty for broader demo
      setIsAuthenticated(true);
      setCurrentUser(demoUser);
      addLogEntry({ operation: 'login', details: `User '${username}' logged in successfully (Mock).`, status: 'success', username });
      return true;
    }
    addLogEntry({ operation: 'login', details: `Login attempt failed for user '${username}'.`, status: 'failure', username });
    return false;
  };

  const logout = () => {
    const loggedOutUser = currentUser?.username || 'Unknown';
    setIsAuthenticated(false);
    setCurrentUser(null);
    addLogEntry({ operation: 'logout', details: `User '${loggedOutUser}' logged out.`, status: 'info', username: loggedOutUser });
  };

  const addVault = async (vaultName: string, vaultPath: string): Promise<VaultItem | null> => {
    if (window.electronAPI?.createVaultDirectory) {
      try {
        const result = await window.electronAPI.createVaultDirectory(vaultPath, vaultName);
        if (result.success && result.newVaultItem) {
          setVaults(prev => [...prev, result.newVaultItem!]);
          addLogEntry({ operation: 'vault_create', details: `Vault "${result.newVaultItem.name}" created at ${result.newVaultItem.path}.`, status: 'success' });
          return result.newVaultItem;
        } else {
          console.error("Backend failed to create vault:", result.error);
          addLogEntry({ operation: 'vault_create', details: `Failed to create vault "${vaultName}". Error: ${result.error}`, status: 'failure' });
          return null;
        }
      } catch (e) {
        console.error("Error calling createVaultDirectory:", e);
        addLogEntry({ operation: 'vault_create', details: `Error creating vault "${vaultName}".`, status: 'failure' });
        return null;
      }
    } else {
      console.warn("AppContext: addVault using placeholder. Implement actual vault creation via Electron IPC (window.electronAPI.createVaultDirectory).");
      const newVault: VaultItem = {
        id: uuidv4(),
        name: vaultName,
        path: vaultPath,
        createdAt: Date.now(),
        encryptedFileCount: 0, 
        totalSizeEncrypted: 0
      };
      setVaults(prev => [...prev, newVault]);
      addLogEntry({ operation: 'vault_create', details: `Vault (local) "${newVault.name}" created at ${newVault.path}.`, status: 'success' });
      return newVault;
    }
  };

  const deleteVault = async (vaultId: string): Promise<void> => {
    const vaultToDelete = vaults.find(v => v.id === vaultId);
    if (!vaultToDelete) {
      console.error("Vault not found for deletion:", vaultId);
      return;
    }

    if (window.electronAPI?.deleteVaultDirectory) {
      try {
        const result = await window.electronAPI.deleteVaultDirectory(vaultToDelete.path);
        if (result.success) {
          setVaults(prev => prev.filter(v => v.id !== vaultId));
          addLogEntry({ operation: 'vault_delete', details: `Vault "${vaultToDelete.name}" deleted.`, status: 'success' });
        } else {
          console.error("Backend failed to delete vault:", result.error);
          addLogEntry({ operation: 'vault_delete', details: `Failed to delete vault "${vaultToDelete.name}". Error: ${result.error}`, status: 'failure' });
        }
      } catch (e) {
        console.error("Error calling deleteVaultDirectory:", e);
        addLogEntry({ operation: 'vault_delete', details: `Error deleting vault "${vaultToDelete.name}".`, status: 'failure' });
      }
    } else {
      console.warn("AppContext: deleteVault using placeholder. Implement actual vault deletion via Electron IPC (window.electronAPI.deleteVaultDirectory).");
      setVaults(prev => prev.filter(v => v.id !== vaultId));
      addLogEntry({ operation: 'vault_delete', details: `Vault (local) "${vaultToDelete.name}" deleted.`, status: 'success' });
    }
  };

  const listVaultContents = async (vaultPath: string): Promise<VaultFile[] | null> => {
    if (window.electronAPI?.listVaultContents) {
      try {
        const result = await window.electronAPI.listVaultContents(vaultPath);
        if (result.success) {
          return result.files;
        }
        console.error("Failed to list vault contents from backend:", result.error);
        return null;
      } catch (e) {
        console.error("Error calling listVaultContents:", e);
        return null;
      }
    }
    console.warn("window.electronAPI.listVaultContents not available.");
    alert("Listing vault contents is not available in this environment.");
    return null; 
  };
  
  const selectFile = useCallback(async (options?: Parameters<ElectronApi['selectFile']>[0]): Promise<string | null> => {
    if (window.electronAPI && window.electronAPI.selectFile) {
      return window.electronAPI.selectFile(options);
    }
    console.warn("window.electronAPI.selectFile not available.");
    alert("File selection is not available in this environment."); 
    return null;
  }, []);

  const selectFiles = useCallback(async (options?: Parameters<ElectronApi['selectFiles']>[0]): Promise<string[] | null> => {
    if (window.electronAPI && window.electronAPI.selectFiles) {
      return window.electronAPI.selectFiles(options);
    }
    console.warn("window.electronAPI.selectFiles not available.");
     alert("Multi-file selection is not available in this environment."); 
    return null;
  }, []);

  const selectDirectory = useCallback(async (options?: Parameters<ElectronApi['selectDirectory']>[0]): Promise<string | null> => {
    if (window.electronAPI && window.electronAPI.selectDirectory) {
      return window.electronAPI.selectDirectory(options);
    }
    console.warn("window.electronAPI.selectDirectory not available.");
    alert("Directory selection is not available in this environment."); 
    return null;
  }, []);
  
  const generatePassword = useCallback(async (options: PasswordGenerationOptions): Promise<string> => {
    if(window.electronAPI && window.electronAPI.generatePassword) {
        return window.electronAPI.generatePassword(options); 
    }
    console.warn("window.electronAPI.generatePassword not available. Using fallback.");
    let charset = "";
    if (options.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.includeNumbers) charset += "0123456789";
    if (options.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!charset) charset = "abcdefghijklmnopqrstuvwxyz"; 
    
    let password = "";
    for (let i = 0; i < options.length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }, []);

  const getAppVersion = useCallback(async (): Promise<string> => {
    if(window.electronAPI && window.electronAPI.getAppVersion) {
      return window.electronAPI.getAppVersion();
    }
    return "N/A (Web)";
  }, []);


  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      language, setLanguage, 
      translate, 
      userProfile, updateUserProfile,
      isAuthenticated, currentUser, login, logout, // Auth context values
      activityLog, addLogEntry, clearActivityLog,
      vaults, addVault, deleteVault, listVaultContents,
      currentEncryptionJobs, setCurrentEncryptionJobs,
      currentDecryptionJobs, setCurrentDecryptionJobs,
      selectFile, selectFiles, selectDirectory, generatePassword, getAppVersion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};