
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArchive, FaPlus, FaFolderOpen, FaTrash, FaList, FaFileMedicalAlt, FaSearch } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import Modal from '../components/shared/Modal'; // Assuming Modal component exists
import { VaultItem, VaultFile } from '../types';

const VaultManagementPage: React.FC = () => {
  const { theme, translate, vaults, addVault, deleteVault, selectDirectory, addLogEntry, listVaultContents, language } = useAppContext();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultPath, setNewVaultPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVaultForView, setSelectedVaultForView] = useState<VaultItem | null>(null);
  const [currentVaultFiles, setCurrentVaultFiles] = useState<VaultFile[]>([]);
  const [isLoadingVaultFiles, setIsLoadingVaultFiles] = useState(false);

  const isRTL = language === 'ar';

  const handleCreateVault = async () => {
    if (!newVaultName.trim() || !newVaultPath.trim()) {
      alert(translate('vaultNameAndPathRequired')); 
      return;
    }
    const createdVault = await addVault(newVaultName, newVaultPath);

    if (createdVault) {
      setNewVaultName('');
      setNewVaultPath('');
      setIsCreateModalOpen(false);
    }
  };

  const handleSelectVaultLocation = async () => {
    const directoryPath = await selectDirectory();
    if (directoryPath) {
      setNewVaultPath(directoryPath);
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    if (window.confirm(translate('confirmDeleteVault'))) { 
      await deleteVault(vaultId);
    }
  };

  const handleViewVaultContents = async (vault: VaultItem) => {
    setSelectedVaultForView(vault);
    setIsViewModalOpen(true);
    setIsLoadingVaultFiles(true);
    setCurrentVaultFiles([]); 

    const files = await listVaultContents(vault.path);
    if (files) {
      setCurrentVaultFiles(files);
       addLogEntry({
        operation: 'vault_list_contents',
        details: `Listed contents for vault "${vault.name}". Found ${files.length} items.`,
        status: 'success',
        targetVault: vault.name
      });
    } else {
      setCurrentVaultFiles([]); 
      alert(translate('couldNotLoadVaultContents', vault.name));
       addLogEntry({
        operation: 'vault_list_contents',
        details: `Failed to list contents for vault "${vault.name}".`,
        status: 'failure',
        targetVault: vault.name
      });
    }
    setIsLoadingVaultFiles(false);
  };

  const handleAddFileToVault = async (vault: VaultItem) => {
    if (!window.electronAPI?.addFileToVault || !window.electronAPI?.selectFile) {
      alert(translate('electronApiUnavailable'));
      return;
    }
    const sourceFilePath = await window.electronAPI.selectFile();
    if (!sourceFilePath) return;

    const passwordKey = prompt(`Enter password to encrypt file into vault "${vault.name}":`);
    if (!passwordKey) return;

    alert(`TODO (Backend): Implement window.electronAPI.addFileToVault.\nAdding "${sourceFilePath}" to vault "${vault.name}" at path "${vault.path}". Requires encryption with password.`);
  };


  const filteredVaults = vaults.filter(vault => 
    vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vault.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FaArchive className={`text-knoux-dark-primary dark:text-knoux-light-primary ${isRTL ? 'ml-3' : 'mr-3'}`} />
          {translate('vaults')}
        </h1>
        <StyledButton onClick={() => setIsCreateModalOpen(true)} iconLeft={<FaPlus />}>
          {translate('createVault')}
        </StyledButton>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-sm border-knoux-dark-primary/40 shadow-[var(--knoux-glow-secondary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-sm border-knoux-light-primary/40 shadow-xl'}`}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={translate('searchVaults')} 
            className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                        ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'} 
                        ${isRTL ? 'rtl:pr-10 ltr:pl-10' : 'ltr:pl-10 rtl:pr-10'}`}
          />
          <FaSearch className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'right-3' : 'left-3'}`} />
        </div>
      </div>

      {/* Vaults List */}
      {filteredVaults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults.map(vault => (
            <motion.div
              key={vault.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-5 rounded-xl shadow-lg hover:shadow-[var(--knoux-glow-primary-deep)] transition-shadow duration-300
                          ${theme === 'dark' ? 'bg-knoux-dark-surface/70 backdrop-blur-sm border border-knoux-dark-primary/40' : 'bg-knoux-light-surface/80 backdrop-blur-sm border border-knoux-light-primary/40'}
                          ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <div className={`flex justify-between items-start mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-knoux-dark-primary' : 'text-knoux-light-primary'}`}>{vault.name}</h2>
                <FaArchive className={`w-8 h-8 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`} />
              </div>
              <p className={`text-xs break-all mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {translate('path')}: {vault.path}
              </p>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {translate('files')}: {vault.encryptedFileCount}
              </p>
               <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {translate('size')}: {(vault.totalSizeEncrypted / (1024*1024)).toFixed(2)} MB
              </p>
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {translate('created')}: {new Date(vault.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
              </p>
              <div className={`flex space-x-2 rtl:space-x-reverse ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <StyledButton variant="secondary" size="sm" iconLeft={<FaList />} onClick={() => handleViewVaultContents(vault)}>
                  {translate('manageContents')} 
                </StyledButton>
                <StyledButton variant="danger" size="sm" iconLeft={<FaTrash />} onClick={() => handleDeleteVault(vault.id)}>
                  {translate('delete')}
                </StyledButton>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className={`text-center py-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {searchTerm ? translate('noResultsFound') : translate('noVaults')} 
        </p>
      )}

      {/* Create Vault Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={translate('createVault')}>
        <div className="space-y-4">
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('vaultName')}</label>
            <input
              type="text"
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
              placeholder={translate('enterVaultName')} 
              className={`w-full p-2 rounded-md border neon-focus-ring-primary ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'}`}
            />
          </div>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('vaultLocation')}</label> 
            <div className={`flex items-center space-x-2 rtl:space-x-reverse`}>
              <input
                type="text"
                value={newVaultPath}
                readOnly 
                placeholder={translate('selectVaultLocationPlaceholder')} 
                className={`flex-grow p-2 rounded-md border ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-400 border-knoux-dark-primary/50' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
              />
              <StyledButton onClick={handleSelectVaultLocation} iconLeft={<FaFolderOpen />} size="sm" variant="ghost">{''}</StyledButton>
            </div>
          </div>
          <div className={`flex space-x-3 rtl:space-x-reverse pt-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <StyledButton variant="ghost" onClick={() => setIsCreateModalOpen(false)}>{translate('cancel')}</StyledButton>
            <StyledButton onClick={handleCreateVault} variant="primary">{translate('create')}</StyledButton> 
          </div>
        </div>
      </Modal>

      {/* View Vault Contents Modal */}
      {selectedVaultForView && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`${translate('manageContents')}: ${selectedVaultForView.name}`} size="lg">
            {isLoadingVaultFiles ? (
                <p>{translate('loading')}...</p>
            ) : currentVaultFiles.length > 0 ? (
                <ul className={`space-y-2 max-h-96 overflow-y-auto custom-scrollbar ${isRTL ? 'text-right' : 'text-left'}`}>
                    {currentVaultFiles.map(file => (
                        <li key={file.path} className={`p-3 rounded-md ${theme === 'dark' ? 'bg-knoux-dark-bg' : 'bg-gray-100'} flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs">{translate('path')}: {file.path}</p>
                            {file.originalSize && <p className="text-xs">{translate('size')}: {(file.originalSize / (1024*1024)).toFixed(2)} MB</p>}
                          </div>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p>{translate('noFilesFoundInVault')}</p>
            )}
            <div className={`mt-4 border-t pt-4 dark:border-gray-700 light:border-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm italic mb-3">{translate('vaultContentsDisclaimer')}</p>
              <StyledButton 
                onClick={() => handleAddFileToVault(selectedVaultForView)}
                iconLeft={<FaFileMedicalAlt />} 
                variant="primary"
                disabled={!window.electronAPI?.addFileToVault}
              >
                {translate('addFilesToVault')}
              </StyledButton>
            </div>
        </Modal>
      )}

    </motion.div>
  );
};

export default VaultManagementPage;