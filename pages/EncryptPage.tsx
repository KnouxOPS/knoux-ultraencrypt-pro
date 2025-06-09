
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaFileAlt, FaFolder, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { EncryptionAlgorithm } from '../types';
import type { FileWithPath } from 'react-dropzone';
import { AVAILABLE_ALGORITHMS } from '../constants';
// import FileDropzone from '../components/shared/FileDropzone'; // Assuming FileDropzone is created

// Helper to get file path for Electron (conceptual)
const getElectronFilePath = (file: File): string | undefined => {
  const withPath = file as FileWithPath;
  return withPath.path || withPath.webkitRelativePath;
};


const EncryptPage: React.FC = () => {
  const { theme, translate, addLogEntry, selectFile, selectDirectory, language } = useAppContext();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [algorithm, setAlgorithm] = useState<EncryptionAlgorithm>(AVAILABLE_ALGORITHMS[0].value);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processMessage, setProcessMessage] = useState('');
  const [shredOriginal, setShredOriginal] = useState(false);

  const handleFileSelect = async () => {
    const filePath = await selectFile(); 
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown_file';
      const fileLikeObject = new File([], fileName);
      Object.defineProperty(fileLikeObject, 'path', { value: filePath, writable: false });
      setSelectedFiles([fileLikeObject]);
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
    if (selectedFiles.length === 0) {
      setProcessMessage(translate('selectFile'));
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
    if (password !== confirmPassword) {
      setProcessMessage(translate('passwordsDoNotMatch'));
      setProcessStatus('error');
      return false;
    }
    return true;
  };

  const handleEncrypt = async () => {
    if (!validateInputs() || isProcessing) return;

    if (!window.electronAPI?.encryptFile) {
      console.error("Electron API for encryption is not available.");
      setProcessMessage(translate('electronApiUnavailable'));
      setProcessStatus('error');
      addLogEntry({
        operation: 'error_generic',
        details: 'Attempted encryption, but Electron API (encryptFile) was not found.',
        status: 'failure',
      });
      return;
    }

    setIsProcessing(true);
    setProcessStatus('idle');
    setProcessMessage(translate('encryptionInProgress'));

    const fileToEncrypt = selectedFiles[0]; 
    const originalPath = getElectronFilePath(fileToEncrypt) || fileToEncrypt.name;

    try {
      const result = await window.electronAPI.encryptFile(
        originalPath, 
        selectedOutputFolder!, 
        password, 
        algorithm,
        shredOriginal
      );

      if (result.success && result.encryptedFilePath) {
        setProcessStatus('success');
        setProcessMessage(translate('encryptionSuccess') + ` Output: ${result.encryptedFilePath}`);
        addLogEntry({
          operation: 'encrypt',
          details: `Encrypted "${fileToEncrypt.name}" to "${result.encryptedFilePath}" using ${algorithm}. IV: ${result.iv}, Salt: ${result.salt}, AuthTag: ${result.authTag}`,
          status: 'success',
          targetFile: originalPath,
          algorithmUsed: algorithm,
        });
        if (shredOriginal && result.success) {
           addLogEntry({operation:'shred', details: `Original file ${originalPath} shredded successfully by backend.`, status:'success', targetFile: originalPath});
        }
      } else {
        throw new Error(result.error || translate('encryptionFailed'));
      }
    } catch (error: unknown) {
      console.error("Encryption error:", error);
      const message = error instanceof Error ? error.message : translate('encryptionFailed');
      setProcessStatus('error');
      setProcessMessage(message);
      addLogEntry({
        operation: 'encrypt',
        details: `Failed to encrypt "${fileToEncrypt.name}". Error: ${message}`,
        status: 'failure',
        targetFile: originalPath,
        algorithmUsed: algorithm,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const selectedAlgorithmInfo = AVAILABLE_ALGORITHMS.find(a => a.value === algorithm);
  const isRTL = language === 'ar';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 md:p-6 space-y-6"
    >
      {/* Hero Section */}
      <div className={`relative p-6 md:p-8 rounded-xl
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/70 backdrop-blur-sm' : 'bg-knoux-light-surface/80 backdrop-blur-sm'}
                       border ${theme === 'dark' ? 'border-knoux-dark-primary/50' : 'border-knoux-light-primary/50'}
                       shadow-[var(--knoux-glow-primary-deep)]
                       overflow-hidden mb-8 text-center md:text-left ${isRTL ? 'md:text-right' : 'md:text-left'}`}
      >
        <div className={`absolute -top-1/2 -left-1/4 w-full h-full rounded-full opacity-20 -z-10
                        ${theme === 'dark' ? 'bg-gradient-to-br from-knoux-dark-primary via-knoux-dark-secondary to-transparent' : 'bg-gradient-to-br from-knoux-light-primary via-knoux-light-secondary to-transparent'}`}>
        </div>
        <div className="relative z-10">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center md:justify-start ${isRTL ? 'md:justify-end' : 'md:justify-start'}
                          ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FaShieldAlt className={`text-knoux-dark-primary dark:text-knoux-light-primary text-4xl md:text-5xl ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {translate('encryptPageTitle')}
          </h1>
          <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {translate('encryptPageSubtitle')}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className={`p-6 md:p-8 rounded-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-sm border-knoux-dark-primary/40 shadow-[var(--knoux-glow-secondary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-sm border-knoux-light-primary/40 shadow-xl'} `}
      >
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* File Selection */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('selectFile')}</label>
            <StyledButton 
              onClick={handleFileSelect} 
              variant="secondary" 
              iconLeft={<FaFileAlt />} 
              className={`w-full justify-start text-left truncate ${isRTL ? 'rtl:justify-end rtl:text-right' : ''}`}
            >
              {selectedFiles.length > 0 ? selectedFiles[0].name : translate('selectFile')}
            </StyledButton>
            {selectedFiles.length > 0 && <p className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{translate('originalFile')}: {getElectronFilePath(selectedFiles[0])}</p>}
          </div>

          {/* Output Folder Selection */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('selectOutputFolder')}</label>
            <StyledButton 
              onClick={handleOutputFolderSelect} 
              variant="secondary" 
              iconLeft={<FaFolder />} 
              className={`w-full justify-start text-left truncate ${isRTL ? 'rtl:justify-end rtl:text-right' : ''}`}
            >
              {selectedOutputFolder || translate('selectOutputFolder')}
            </StyledButton>
            {selectedOutputFolder && <p className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{translate('outputFolder')}: {selectedOutputFolder}</p>}
          </div>
        </div>


        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={translate('enterPassword')}
                className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                            ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 
                                                'bg-white text-gray-700 border-gray-300'} 
                            ${isRTL ? 'rtl:pr-10 ltr:pl-3' : 'ltr:pr-10 rtl:pl-3'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 px-3 flex items-center text-gray-500 hover:text-knoux-dark-primary dark:hover:text-knoux-light-primary ${isRTL ? 'left-0' : 'right-0'}`}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('confirmPassword')}</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={translate('confirmPassword')}
              className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                          ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 
                                              'bg-white text-gray-700 border-gray-300'} 
                          ${(password && confirmPassword && password !== confirmPassword) ? (theme === 'dark' ? '!border-red-500 focus:!shadow-[0_0_8px_var(--knoux-neon-danger)]' : '!border-red-500 focus:!shadow-[0_0_8px_var(--knoux-neon-danger)]') : ''}`}
            />
          </div>
        </div>
        
        {/* Algorithm Selection */}
        <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('encryptionAlgorithm')}</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as EncryptionAlgorithm)}
            className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                        ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 
                                            'bg-white text-gray-700 border-gray-300'}`}
          >
            {AVAILABLE_ALGORITHMS.map((opt) => (
              <option key={opt.value} value={opt.value} className={`${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200' : 'bg-white text-gray-800'}`}>{translate(opt.labelKey)}</option>
            ))}
          </select>
          {selectedAlgorithmInfo?.isPostQuantum && (
             <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{translate('postQuantumWarning')}</p>
          )}
        </div>

        {/* Shred Original Option */}
        <div className="mb-8">
            <label className={`flex items-center space-x-3 rtl:space-x-reverse cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <input 
                    type="checkbox" 
                    checked={shredOriginal} 
                    onChange={(e) => setShredOriginal(e.target.checked)}
                    className={`form-checkbox h-5 w-5 rounded transition-colors duration-200
                                ${theme === 'dark' ? 'text-knoux-dark-primary bg-knoux-dark-bg border-knoux-dark-primary/70 focus:ring-knoux-dark-primary focus:ring-offset-knoux-dark-surface' 
                                                  : 'text-knoux-light-primary bg-gray-100 border-gray-400 focus:ring-knoux-light-primary focus:ring-offset-knoux-light-surface'}`}
                />
                <span className="text-sm">{translate('shredOriginalFile')}</span>
            </label>
        </div>


        {/* Action Button & Status */}
        <div className="flex flex-col items-center">
          <StyledButton 
            onClick={handleEncrypt} 
            size="lg" 
            variant="primary"
            isLoading={isProcessing} 
            disabled={isProcessing}
            className="w-full md:w-1/2 lg:w-1/3 py-3.5 text-base"
            iconLeft={<FaLock />}
          >
            {isProcessing ? translate('encryptionInProgress') : translate('encryptFile')}
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
      <div className={`mt-8 p-4 rounded-lg text-xs
                       ${theme === 'dark' ? 'bg-knoux-dark-bg/50 text-gray-400 border border-[var(--knoux-neon-warning)]/20 shadow-[0_0_10px_var(--knoux-neon-warning)]' 
                                        : 'bg-yellow-50/70 text-gray-600 border border-yellow-400/30 shadow-lg'}
                        ${isRTL ? 'text-right' : 'text-left'}`}>
        <strong className={`${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-500'}`}>{translate('important')}:</strong> {translate('encryptionDisclaimer')}
        <br/>
        <strong className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'} mt-1 block`}>{translate('metadataInfo')}:</strong> {translate('metadataExplanation')}
      </div>
    </motion.div>
  );
};

export default EncryptPage;