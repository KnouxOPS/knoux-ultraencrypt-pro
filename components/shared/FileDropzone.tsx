
import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions, FileWithPath } from 'react-dropzone'; // react-dropzone is not in importmap, assuming it would be added if used
import { FaFileUpload, FaFolderOpen } from 'react-icons/fa'; // FaFile removed as it was unused
import { useAppContext } from '../../contexts/AppContext';

interface FileDropzoneProps {
  onFilesSelected: (files: FileWithPath[]) => void;
  onFolderSelected?: (folderPath: string) => void; // For folder selection
  accept?: DropzoneOptions['accept'];
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
  selectMode?: 'files' | 'folder'; // To distinguish between file and folder selection
  labelKey: string; // Translation key for the label
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  onFolderSelected,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024 * 1024, // 5GB default
  multiple = false,
  selectMode = 'files',
  labelKey,
}) => {
  const { theme, translate, selectFile: selectSingleFileViaElectron, selectFiles: selectMultipleFilesViaElectron, selectDirectory: selectDirectoryViaElectron } = useAppContext();
  const [dragOver, setDragOver] = useState(false);

  const handleElectronFileSelect = async () => {
    if (selectMode === 'folder' && onFolderSelected && selectDirectoryViaElectron) {
      const directoryPath = await selectDirectoryViaElectron();
      if (directoryPath) {
        onFolderSelected(directoryPath);
      }
    } else if (multiple && selectMultipleFilesViaElectron) {
      const filePaths = await selectMultipleFilesViaElectron();
      if (filePaths && filePaths.length > 0) {
        const files: FileWithPath[] = filePaths.map(path => {
          const fileName = path.split(/[\\/]/).pop() || 'unknown_file';
          const file = new File([], fileName, { type: 'application/octet-stream' }); // Provide a default MIME type
          return Object.defineProperty(file, 'path', {
            value: path,
            writable: false,
            enumerable: true,
            configurable: true,
          }) as FileWithPath;
        });
        onFilesSelected(files);
      }
    } else if (selectSingleFileViaElectron) {
      const filePath = await selectSingleFileViaElectron();
      if (filePath) {
        const fileName = filePath.split(/[\\/]/).pop() || 'unknown_file';
        const file = new File([], fileName, { type: 'application/octet-stream' }); // Provide a default MIME type
        const fileWithPath = Object.defineProperty(file, 'path', {
          value: filePath,
          writable: false,
          enumerable: true,
          configurable: true,
        }) as FileWithPath;
        onFilesSelected([fileWithPath]);
      }
    } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        if (selectMode === 'folder') {
            // @ts-ignore 
            input.webkitdirectory = true;
        }
        if (accept) {
           const acceptString = Object.entries(accept).map(([mimeType, extensions]) => 
            extensions && extensions.length > 0 ? extensions.join(',') : mimeType
          ).join(',');
          input.accept = acceptString;
        }
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                 if (selectMode === 'folder' && onFolderSelected && target.files.length > 0) {
                     onFolderSelected(target.files[0].webkitRelativePath.split('/')[0] || "Selected Folder");
                 } else {
                    onFilesSelected(Array.from(target.files) as FileWithPath[]);
                 }
            }
        };
        input.click();
    }
  };

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setDragOver(false);
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ // 'open' was unused
    onDrop,
    accept,
    maxFiles: selectMode === 'folder' ? undefined : maxFiles,
    maxSize,
    multiple: selectMode === 'folder' ? true : multiple,
    noClick: true, 
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const baseClasses = `p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out flex flex-col items-center justify-center text-center h-40`;
  const themeClasses = theme === 'dark' 
    ? 'border-gray-600 hover:border-knoux-dark-primary bg-knoux-dark-bg/30 hover:bg-knoux-dark-surface/50 text-gray-400'
    : 'border-gray-300 hover:border-knoux-light-primary bg-gray-50/50 hover:bg-gray-100/70 text-gray-500';
  const activeClasses = theme === 'dark' ? 'border-knoux-dark-primary bg-knoux-dark-surface/60' : 'border-knoux-light-primary bg-gray-100/80';

  return (
    <div 
      {...getRootProps()} 
      className={`${baseClasses} ${dragOver || isDragActive ? activeClasses : themeClasses}`}
      onClick={handleElectronFileSelect}
      role="button"
      tabIndex={0}
      aria-label={translate(labelKey)}
    >
      <input {...getInputProps()} />
      {selectMode === 'folder' ? 
        <FaFolderOpen className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`} />
        :
        <FaFileUpload className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`} />
      }
      <p className="font-semibold">{translate(labelKey)}</p>
      <p className="text-xs">{translate('dragDropOrClick')}</p>
      {maxSize && <p className="text-xs mt-1">{translate('maxFileSize')}: {Math.round(maxSize / (1024*1024))}MB</p>}
    </div>
  );
};

export default FileDropzone;
