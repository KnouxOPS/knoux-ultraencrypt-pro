
import React, { useState, useEffect } from 'react';
import { FaLock, FaShieldAlt, FaCog, FaPalette, FaLanguage, FaHdd, FaQuestionCircle, FaDownload, FaUpload, FaKey, FaTrashAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { Theme, Language, EncryptionAlgorithm } from '../types';
import { AVAILABLE_ALGORITHMS, AUTHOR_SIGNATURE } from '../constants';

interface SettingItemProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, children }) => {
  const { theme } = useAppContext(); // Removed unused 'translate'
  return (
    <div className={`p-4 rounded-lg shadow
                     ${theme === 'dark' ? 'bg-knoux-dark-bg border border-knoux-dark-primary/30' : 'bg-white border border-gray-200'}
                     `}>
      <div className="flex items-start space-x-3 mb-2">
        {React.cloneElement(icon, { className: `w-5 h-5 flex-shrink-0 mt-1 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}` })}
        <h3 className={`font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
      </div>
      {description && <p className={`text-sm mb-3 ml-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>}
      <div className="ml-8">
        {children}
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { theme, setTheme, language, setLanguage, translate, addLogEntry, getAppVersion } = useAppContext();
  
  // App-specific settings state (would typically be persisted)
  const [appLockEnabled, setAppLockEnabled] = useState(false); // TODO: Implement app lock
  const [autoLockMinutes, setAutoLockMinutes] = useState(0); // 0 for never
  const [defaultAlgorithm, setDefaultAlgorithm] = useState<EncryptionAlgorithm>(EncryptionAlgorithm.AES256_GCM);
  const [defaultShredPasses, setDefaultShredPasses] = useState(3);
  const [deleteOriginalAfterEncrypt, setDeleteOriginalAfterEncrypt] = useState(false);
  const [deleteEncryptedAfterDecrypt, setDeleteEncryptedAfterDecrypt] = useState(false);
  const [appVersion, setAppVersion] = useState("Loading...");

  useEffect(() => {
    // Load persisted settings
    const storedSettings = localStorage.getItem('knoux-ultraencrypt-appsettings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setAppLockEnabled(parsed.appLockEnabled || false);
      setAutoLockMinutes(parsed.autoLockMinutes || 0);
      setDefaultAlgorithm(parsed.defaultAlgorithm || EncryptionAlgorithm.AES256_GCM);
      setDefaultShredPasses(parsed.defaultShredPasses || 3);
      setDeleteOriginalAfterEncrypt(parsed.deleteOriginalAfterEncrypt || false);
      setDeleteEncryptedAfterDecrypt(parsed.deleteEncryptedAfterDecrypt || false);
    }
    getAppVersion().then(setAppVersion).catch(() => setAppVersion("Error loading version."));
  }, [getAppVersion]);

  const saveSettings = () => {
    const settingsToSave = {
      appLockEnabled, autoLockMinutes, defaultAlgorithm, defaultShredPasses,
      deleteOriginalAfterEncrypt, deleteEncryptedAfterDecrypt
    };
    localStorage.setItem('knoux-ultraencrypt-appsettings', JSON.stringify(settingsToSave));
    addLogEntry({
      operation: 'settings_change',
      details: 'Application settings updated.',
      status: 'success'
    });
    // Consider a more user-friendly notification system than alert
    alert(translate('settings') + ' ' + translate('saved') + '!'); // Using 'saved' key, ensure it exists
  };

  const handleExportSettings = () => {
    const settingsToSave = {
      theme, language, appLockEnabled, autoLockMinutes, defaultAlgorithm, defaultShredPasses,
      deleteOriginalAfterEncrypt, deleteEncryptedAfterDecrypt
    };
    const blob = new Blob([JSON.stringify(settingsToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knoux-ultraencrypt-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLogEntry({ operation: 'settings_change', details: 'Settings exported.', status: 'info' });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          if (importedSettings.theme) setTheme(importedSettings.theme);
          if (importedSettings.language) setLanguage(importedSettings.language);
          setAppLockEnabled(importedSettings.appLockEnabled || false);
          setAutoLockMinutes(importedSettings.autoLockMinutes || 0);
          setDefaultAlgorithm(importedSettings.defaultAlgorithm || EncryptionAlgorithm.AES256_GCM);
          setDefaultShredPasses(importedSettings.defaultShredPasses || 3);
          setDeleteOriginalAfterEncrypt(importedSettings.deleteOriginalAfterEncrypt || false);
          setDeleteEncryptedAfterDecrypt(importedSettings.deleteEncryptedAfterDecrypt || false);
          // Use a translation key like 'settingsImportSuccess'
          alert(translate('settings') + ' ' + translate('imported') + ' ' + translate('successfully') + '!'); // Ensure 'imported' and 'successfully' keys exist
          addLogEntry({ operation: 'settings_change', details: 'Settings imported.', status: 'info' });
        } catch (err) {
          console.error("Error importing settings:", err);
          alert(translate('error') + ': ' + translate('settingsImportFailed')); // Use 'settingsImportFailed' key
        }
      };
      reader.readAsText(file);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {translate('settings')}
        </h1>
        <StyledButton onClick={saveSettings} variant="primary" size="md">
          {translate('save')} {translate('settings')}
        </StyledButton>
      </div>

      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('general')}
        </h2>
        <SettingItem icon={<FaPalette />} title={translate('theme')}>
          <div className="flex space-x-2">
            <StyledButton onClick={() => setTheme(Theme.Light)} variant={theme === Theme.Light ? 'primary' : 'ghost'} size="sm">{translate('lightTheme')}</StyledButton>
            <StyledButton onClick={() => setTheme(Theme.Dark)} variant={theme === Theme.Dark ? 'primary' : 'ghost'} size="sm">{translate('darkTheme')}</StyledButton>
          </div>
        </SettingItem>
        <SettingItem icon={<FaLanguage />} title={translate('language')}>
           <div className="flex space-x-2">
            <StyledButton onClick={() => setLanguage(Language.English)} variant={language === Language.English ? 'primary' : 'ghost'} size="sm">{translate('english')}</StyledButton>
            <StyledButton onClick={() => setLanguage(Language.Arabic)} variant={language === Language.Arabic ? 'primary' : 'ghost'} size="sm">{translate('arabic')}</StyledButton>
          </div>
        </SettingItem>
      </section>

      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('securityPrivacy')}
        </h2>
        <SettingItem icon={<FaLock />} title={translate('appLock')} description={translate('enableAppLock')}>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={appLockEnabled} onChange={(e) => setAppLockEnabled(e.target.checked)} className="form-checkbox h-5 w-5 text-knoux-dark-primary rounded focus:ring-knoux-dark-primary"/>
              <span>{appLockEnabled ? translate('enabled') : translate('disabled')} (TODO: Implement)</span> {/* Using translate keys */}
            </label>
        </SettingItem>
         <SettingItem icon={<FaKey />} title={translate('defaultAlgorithm')}>
          <select 
            value={defaultAlgorithm} 
            onChange={(e) => setDefaultAlgorithm(e.target.value as EncryptionAlgorithm)}
            className={`p-2 rounded-md border ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50 focus:border-knoux-dark-primary focus:ring-knoux-dark-primary' : 'bg-white text-gray-700 border-gray-300 focus:border-knoux-light-primary focus:ring-knoux-light-primary'}`}
          >
            {AVAILABLE_ALGORITHMS.map(algo => (
              <option key={algo.value} value={algo.value}>{translate(algo.labelKey)}</option>
            ))}
          </select>
        </SettingItem>
      </section>

      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('operations')} {/* Assuming 'operations' is a valid translation key */}
        </h2>
        <SettingItem icon={<FaTrashAlt />} title={translate('defaultShredPasses')}>
          <input 
            type="number" 
            min="1" max="10" 
            value={defaultShredPasses} 
            onChange={(e) => setDefaultShredPasses(parseInt(e.target.value))}
            className={`w-20 p-2 rounded-md border ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50 focus:border-knoux-dark-primary focus:ring-knoux-dark-primary' : 'bg-white text-gray-700 border-gray-300 focus:border-knoux-light-primary focus:ring-knoux-light-primary'}`}
          />
        </SettingItem>
        <SettingItem icon={<FaShieldAlt />} title={translate('deleteOriginalAfterEncryption')}>
             <label className="flex items-center space-x-2">
              <input type="checkbox" checked={deleteOriginalAfterEncrypt} onChange={(e) => setDeleteOriginalAfterEncrypt(e.target.checked)} className="form-checkbox h-5 w-5 text-knoux-dark-primary rounded focus:ring-knoux-dark-primary"/>
              <span>{deleteOriginalAfterEncrypt ? translate('enabled') : translate('disabled')}</span>
            </label>
        </SettingItem>
         <SettingItem icon={<FaShieldAlt />} title={translate('deleteEncryptedAfterDecryption')}>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={deleteEncryptedAfterDecrypt} onChange={(e) => setDeleteEncryptedAfterDecrypt(e.target.checked)} className="form-checkbox h-5 w-5 text-knoux-dark-primary rounded focus:ring-knoux-dark-primary"/>
              <span>{deleteEncryptedAfterDecrypt ? translate('enabled') : translate('disabled')}</span>
            </label>
        </SettingItem>
      </section>

      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('importExportSettings')}
        </h2>
        <SettingItem icon={<FaUpload />} title={translate('importSettings')}>
          <input type="file" accept=".json" onChange={handleImportSettings} className={`text-sm ${theme === 'dark' ? 'text-gray-300 file:bg-knoux-dark-primary/50 file:text-white' : 'text-gray-700 file:bg-knoux-light-primary/50 file:text-black'} file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold`}/>
        </SettingItem>
        <SettingItem icon={<FaDownload />} title={translate('exportSettings')}>
          <StyledButton onClick={handleExportSettings} size="sm">{translate('exportSettings')}</StyledButton>
        </SettingItem>
      </section>
      
      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('privacyPolicy')}
        </h2>
         <div className={`p-4 rounded-lg shadow
                     ${theme === 'dark' ? 'bg-knoux-dark-bg border border-knoux-dark-primary/30' : 'bg-white border border-gray-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {translate('privacyStatementUltraEncrypt')}
            </p>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
          {translate('about')} {/* Assuming 'about' is a valid translation key */}
        </h2>
         <div className={`p-4 rounded-lg shadow
                     ${theme === 'dark' ? 'bg-knoux-dark-bg border border-knoux-dark-primary/30' : 'bg-white border border-gray-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {translate('appName')} - {translate('version')}: {appVersion} {/* Assuming 'version' is a valid translation key */}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {translate('developedBy')} {AUTHOR_SIGNATURE}. {/* Assuming 'developedBy' is a valid translation key */}
            </p>
        </div>
      </section>
    </motion.div>
  );
};

export default SettingsPage;
