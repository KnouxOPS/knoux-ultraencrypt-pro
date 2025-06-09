
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUnlock, FaFileCode, FaFolderOpen, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { EncryptionAlgorithm } from '../types';
import type { FileWithPath } from 'react-dropzone';
import { AVAILABLE_ALGORITHMS } from '../constants';

// Helper to get file path for Electron (conceptual)
const getElectronFilePath = (file: File): string | undefined => {
  const withPath = file as FileWithPath;
  return withPath.path || withPath.webkitRelativePath;
};


const DecryptPage: React.FC = () => {
  const { theme, translate, addLogEntry, selectFile, selectDirectory, language } = useAppContext();
  
  const [selectedEncryptedFile, setSelectedEncryptedFile] = useState<File | null>(null);
  const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>(AVAILABLE_ALGORITHMS[0].value); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processMessage, setProcessMessage] = useState('');
  const [shredEncrypted, setShredEncrypted] = useState(false);

  const isRTL = language === 'ar';

  const handleFileSelect = async () => {
    const filePath = await selectFile({filters: [{name: 'Encrypted Files', extensions: ['knxenc', 'enc', 'aes']}]}); 
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown_file.knxenc';
      const fileLikeObject = new File([], fileName); 
      Object.defineProperty(fileLikeObject, 'path', { value: filePath, writable: false });
      setSelectedEncryptedFile(fileLikeObject);
      setProcessStatus('idle');
    }
  };

  const handleOutputFolderSelect = async () => {
    const folderPath = await selectDirectory();
    if (folderPath) {
      setSelectedOutputFolder(folderPath);
      setProcessStatus('idle');
    }
  };

  const validateInputs = (): boolean => {
    if (!selectedEncryptedFile) {
      setProcessMessage(translate('selectEncryptedFile')); 
      setProcessStatus('error');
      return false;
    }
    if (!selectedOutputFolder) {
      setProcessMessage(translate('selectOutputFolder'));
      setProcessStatus('error');
      return false;
    }
    if (!password) {
      setProcessMessage(translate('enterPassword'));
      setProcessStatus('error');
      return false;
    }
    return true;
  };

  const handleDecrypt = async () => {
    if (!validateInputs() || isProcessing) return;

    if (!window.electronAPI?.decryptFile) {
      console.error("Electron API for decryption is not available.");
      setProcessMessage(translate('electronApiUnavailable'));
      setProcessStatus('error');
      addLogEntry({
        operation: 'error_generic',
        details: 'Attempted decryption, but Electron API (decryptFile) was not found.',
        status: 'failure',
      });
      return;
    }

    setIsProcessing(true);
    setProcessStatus('idle');
    setProcessMessage(translate('decryptionInProgress'));
    
    const encryptedPath = getElectronFilePath(selectedEncryptedFile!) || selectedEncryptedFile!.name;

    try {
      const result = await window.electronAPI.decryptFile(
        encryptedPath, 
        selectedOutputFolder!, 
        password, 
        algorithm,
        undefined, 
        undefined, 
        undefined, 
        shredEncrypted
      );

      if (result.success && result.decryptedFilePath) {
        setProcessStatus('success');
        setProcessMessage(translate('decryptionSuccess') + ` Output: ${result.decryptedFilePath}`);
        addLogEntry({
          operation: 'decrypt',
          details: `Decrypted "${selectedEncryptedFile!.name}" to "${result.decryptedFilePath}" using ${algorithm}.`,
          status: 'success',
          targetFile: encryptedPath,
          algorithmUsed: algorithm,
        });
      } else {
        throw new Error(result.error || translate('decryptionFailed'));
      }
    } catch (error: unknown) {
      console.error("Decryption error:", error);
      const message = error instanceof Error ? error.message : translate('decryptionFailed');
      setProcessStatus('error');
      setProcessMessage(message);
      addLogEntry({
        operation: 'decrypt',
        details: `Failed to decrypt "${selectedEncryptedFile!.name}". Error: ${message}`,
        status: 'failure',
        targetFile: encryptedPath,
        algorithmUsed: algorithm,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const selectedAlgorithmInfo = AVAILABLE_ALGORITHMS.find(a => a.value === algorithm);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <div className={`p-6 rounded-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-sm border-knoux-dark-primary/40 shadow-[var(--knoux-glow-secondary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-sm border-knoux-light-primary/40 shadow-xl'} `}
      >
        <h1 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FaUnlock className={`text-knoux-dark-primary dark:text-knoux-light-primary ${isRTL ? 'ml-3' : 'mr-3'}`} />
          {translate('decryptFile')}
        </h1>

        {/* Encrypted File Selection */}
        <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('selectEncryptedFile')}</label>
          <StyledButton onClick={handleFileSelect} variant="secondary" iconLeft={<FaFileCode />} className={`w-full justify-start text-left truncate ${isRTL ? 'rtl:justify-end rtl:text-right' : ''}`}>
            {selectedEncryptedFile ? selectedEncryptedFile.name : translate('selectEncryptedFile')}
          </StyledButton>
          {selectedEncryptedFile && <p className="text-xs mt-1">{translate('encryptedFile')}: {getElectronFilePath(selectedEncryptedFile)}</p>}
        </div>

        {/* Output Folder Selection */}
        <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('selectOutputFolder')}</label>
          <StyledButton onClick={handleOutputFolderSelect} variant="secondary" iconLeft={<FaFolderOpen />} className={`w-full justify-start text-left truncate ${isRTL ? 'rtl:justify-end rtl:text-right' : ''}`}>
            {selectedOutputFolder || translate('selectOutputFolder')}
          </StyledButton>
          {selectedOutputFolder && <p className="text-xs mt-1">{translate('outputFolder')}: {selectedOutputFolder}</p>}
        </div>
        
        {/* Password Field */}
        <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translate('enterPassword')}
              className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                          ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'} 
                          ${isRTL ? 'rtl:pr-10 ltr:pl-3' : 'ltr:pr-10 rtl:pl-3'}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 px-3 flex items-center text-gray-500 ${isRTL ? 'left-0' : 'right-0'}`}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        
        {/* Algorithm Selection */}
        <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('encryptionAlgorithm')} <span className="text-xs">({translate('selectIfUnknown')})</span></label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as EncryptionAlgorithm)}
            className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                        ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {AVAILABLE_ALGORITHMS.map((opt) => (
              <option key={opt.value} value={opt.value}>{translate(opt.labelKey)}</option>
            ))}
          </select>
          {selectedAlgorithmInfo?.isPostQuantum && (
             <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{translate('postQuantumWarning')}</p>
          )}
           <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('metadataInputNote')}</p>
        </div>


         {/* Shred Encrypted Option */}
        <div className="mb-6">
            <label className={`flex items-center space-x-2 rtl:space-x-reverse cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <input 
                    type="checkbox" 
                    checked={shredEncrypted} 
                    onChange={(e) => setShredEncrypted(e.target.checked)}
                    className={`form-checkbox h-5 w-5 rounded
                                ${theme === 'dark' ? 'text-knoux-dark-primary bg-knoux-dark-bg border-knoux-dark-primary/70 focus:ring-knoux-dark-primary focus:ring-offset-knoux-dark-surface' 
                                                  : 'text-knoux-light-primary bg-gray-100 border-gray-400 focus:ring-knoux-light-primary focus:ring-offset-knoux-light-surface'}`}
                />
                <span>{translate('shredEncryptedFile')}</span>
            </label>
        </div>


        {/* Action Button & Status */}
        <div className="flex flex-col items-center">
          <StyledButton 
            onClick={handleDecrypt} 
            size="lg" 
            isLoading={isProcessing} 
            disabled={isProcessing}
            className="w-full md:w-auto"
            iconLeft={<FaUnlock />}
          >
            {isProcessing ? translate('decryptionInProgress') : translate('decryptFile')}
          </StyledButton>

           {processMessage && (
            <div className={`mt-6 p-3.5 rounded-md text-sm w-full text-center transition-all duration-300
                            border
                            ${processStatus === 'success' ? 'bg-green-500/10 text-green-400 dark:text-green-300 border-green-500/30 shadow-[0_0_10px_var(--knoux-neon-success)]' : ''}
                            ${processStatus === 'error' ? 'bg-red-500/10 text-red-400 dark:text-red-300 border-red-500/30 shadow-[0_0_10px_var(--knoux-neon-danger)]' : ''}
                            ${processStatus === 'idle' && isProcessing ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_10px_var(--knoux-neon-secondary)]' : 'bg-blue-500/10 text-blue-600 border-blue-500/30 shadow-[0_0_10px_var(--knoux-neon-secondary)]')  : ''}
                          `}>
                 <span className="flex items-center justify-center">
                    {isProcessing && <FaSpinner className="animate-spin mr-2 rtl:ml-2"/>}
                    {processStatus === 'success' && <FaCheckCircle className="mr-2 rtl:ml-2"/>}
                    {processStatus === 'error' && <FaTimesCircle className="mr-2 rtl:ml-2"/>}
                    {processMessage}
                </span>
            </div>
          )}
        </div>
      </div>
       <div className={`mt-4 p-4 rounded-lg text-xs
                       ${theme === 'dark' ? 'bg-knoux-dark-bg/50 text-gray-400 border border-[var(--knoux-neon-warning)]/20 shadow-[0_0_10px_var(--knoux-neon-warning)]' 
                                        : 'bg-yellow-50/70 text-gray-600 border border-yellow-400/30 shadow-lg'}
                        ${isRTL ? 'text-right' : 'text-left'}`}>
        <strong>{translate('important')}:</strong> {translate('decryptionDisclaimer')}
        <br/>
        <strong>{translate('metadataInfo')}:</strong> {translate('metadataReminderDecrypt')}
      </div>
    </motion.div>
  );
};

export default DecryptPage;