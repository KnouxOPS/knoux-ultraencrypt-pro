import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrashAlt, FaExclamationTriangle, FaFile, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import type { FileWithPath } from 'react-dropzone';

// Helper to get file path for Electron (conceptual)
const getElectronFilePath = (file: File): string | undefined => {
  const withPath = file as FileWithPath;
  return withPath.path || withPath.webkitRelativePath;
};

const SecureShredderPage: React.FC = () => {
  const { theme, translate, addLogEntry, selectFile } = useAppContext();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [passes, setPasses] = useState(3); // Default shred passes
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processMessage, setProcessMessage] = useState('');
  const [confirmShredCheck, setConfirmShredCheck] = useState(false); // Using a checkbox for confirmation


  const handleFileSelect = async () => {
    const filePath = await selectFile();
    if (filePath) {
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown_file';
      const fileLikeObject = new File([], fileName);
      Object.defineProperty(fileLikeObject, 'path', { value: filePath, writable: false });
      setSelectedFile(fileLikeObject);
      setProcessStatus('idle');
      setConfirmShredCheck(false); // Reset confirmation checkbox
    }
  };

  const handleShredFile = async () => {
    if (!selectedFile || isProcessing || !confirmShredCheck) {
        if (!confirmShredCheck && selectedFile) {
             alert(translate('shredConfirmProceed')); // Alert if checkbox not checked
        }
        return;
    }
    
    if (!window.electronAPI?.shredFile) {
      console.error("Electron API for shredding is not available.");
      setProcessMessage(translate('electronApiUnavailable'));
      setProcessStatus('error');
      addLogEntry({
        operation: 'error_generic',
        details: 'Attempted shredding, but Electron API (shredFile) was not found.',
        status: 'failure',
      });
      return;
    }


    setIsProcessing(true);
    setProcessStatus('idle');
    setProcessMessage(translate('shreddingInProgress'));
    
    const filePathToShred = getElectronFilePath(selectedFile) || selectedFile.name;

    try {
      // TODO (Backend): Implement window.electronAPI.shredFile(filePathToShred, passes) in Electron main process.
      // This is a critical operation and needs careful backend implementation.
      // It should securely overwrite the file content multiple times.
      const result = await window.electronAPI.shredFile(filePathToShred, passes);

      if (result.success) {
        setProcessStatus('success');
        setProcessMessage(translate('shredSuccess'));
        addLogEntry({
          operation: 'shred',
          details: `Securely shredded file "${selectedFile.name}" with ${passes} passes.`,
          status: 'success',
          targetFile: filePathToShred,
        });
        setSelectedFile(null); 
        setConfirmShredCheck(false);
      } else {
        throw new Error(result.error || translate('shredFailed'));
      }
    } catch (error: unknown) {
      console.error("Shredding error:", error);
      const message = error instanceof Error ? error.message : translate('shredFailed');
      setProcessStatus('error');
      setProcessMessage(message);
      addLogEntry({
        operation: 'shred',
        details: `Failed to shred file "${selectedFile.name}". Error: ${message}`,
        status: 'failure',
        targetFile: filePathToShred,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6 max-w-xl mx-auto"
    >
      <div className={`p-6 rounded-xl shadow-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface' : 'bg-knoux-light-surface'} 
                       border ${theme === 'dark' ? 'border-knoux-dark-primary/30' : 'border-knoux-light-primary/30'}`}>
        <h1 className={`text-3xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <FaTrashAlt className="mr-3 text-red-500" />
          {translate('secureShredder')}
        </h1>
        <div className={`p-4 rounded-md mb-6 text-sm flex items-start
                        ${theme === 'dark' ? 'bg-red-900/30 text-red-300 border border-red-700/50' : 'bg-red-100/70 text-red-700 border border-red-300/50'}`}>
          <FaExclamationTriangle className="w-8 h-8 mr-3 mt-1 flex-shrink-0 text-red-500" />
          <p>{translate('shredWarning')}</p>
        </div>

        {/* File Selection */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('selectFileToShred')}</label>
          <StyledButton onClick={handleFileSelect} variant="secondary" iconLeft={<FaFile />}>
            {selectedFile ? selectedFile.name : translate('selectFile')}
          </StyledButton>
          {selectedFile && <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('selectedFile')}: {getElectronFilePath(selectedFile)}</p>}
        </div>

        {/* Shred Passes */}
        {selectedFile && (
          <div className="mb-6">
            <label htmlFor="shredPasses" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('shredPasses')}</label>
            <input
              id="shredPasses"
              type="number"
              min="1"
              max="10" // More passes offer diminishing returns and take longer
              value={passes}
              onChange={(e) => setPasses(parseInt(e.target.value))}
              className={`w-full p-2 rounded-md border 
                          ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50 focus:border-knoux-dark-primary' : 'bg-white text-gray-700 border-gray-300 focus:border-knoux-light-primary'} 
                          focus:outline-none focus:ring-2 focus:ring-knoux-dark-primary dark:focus:ring-knoux-light-primary transition-colors`}
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {translate('shredPassesInfo')}
            </p>
          </div>
        )}
        
        {/* Confirmation Checkbox */}
        {selectedFile && (
            <div className="mb-6">
                <label className={`flex items-center space-x-2 cursor-pointer ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    <input 
                        type="checkbox" 
                        checked={confirmShredCheck} 
                        onChange={(e) => setConfirmShredCheck(e.target.checked)}
                        className={`form-checkbox h-5 w-5 rounded transition-colors duration-200
                                ${theme === 'dark' ? 'text-red-500 bg-knoux-dark-bg border-red-600/70 focus:ring-red-500 focus:ring-offset-knoux-dark-surface' 
                                                  : 'text-red-600 bg-gray-100 border-red-400 focus:ring-red-600 focus:ring-offset-knoux-light-surface'}`}
                    />
                    <span className="text-sm font-medium">{translate('confirmShredAction')}</span>
                </label>
            </div>
        )}


        {/* Action Button & Status */}
        <div className="flex flex-col items-center">
          <StyledButton 
            onClick={handleShredFile} 
            variant="danger"
            size="lg" 
            isLoading={isProcessing} 
            disabled={!selectedFile || isProcessing || !confirmShredCheck}
            className="w-full md:w-auto"
          >
            {isProcessing ? translate('shreddingInProgress') : translate('shredFileButton')}
          </StyledButton>

          {processMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm w-full text-center
                            ${processStatus === 'success' ? 'bg-green-500/20 text-green-500 dark:text-green-400' : ''}
                            ${processStatus === 'error' ? 'bg-red-500/20 text-red-500 dark:text-red-400' : ''}
                            ${processStatus === 'idle' && isProcessing ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/20 text-blue-600') : ''}
                          `}>
                <span className="flex items-center justify-center">
                    {isProcessing && <FaSpinner className="animate-spin mr-2"/>}
                    {processStatus === 'success' && <FaCheckCircle className="mr-2"/>}
                    {processStatus === 'error' && <FaTimesCircle className="mr-2"/>}
                    {processMessage}
                </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SecureShredderPage;
