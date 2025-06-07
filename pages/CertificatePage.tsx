
import React from 'react';
import { FaAward, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaPrint, FaFilePdf, FaFileImage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import KnouxLogo from '../components/shared/KnouxLogo';
import { AUTHOR_SIGNATURE, WHATSAPP_CONTACT, EMAIL_CONTACT, LOCATION_CONTACT } from '../constants';

// This page can be used as part of an "About" or "Help" section if desired.
// For now, it's not a primary navigation item in KNOUX UltraEncrypt Pro.

const CertificatePage: React.FC = () => {
  const { theme, translate, language } = useAppContext();
  const today = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleExport = (format: 'PDF' | 'PNG') => {
    // In a real Electron app, this would trigger backend PDF/PNG generation.
    alert(`TODO: Implement export certificate as ${format} using Electron main process features.`);
    // For example, capture the div content and send to main process to save as image/pdf.
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 flex flex-col items-center"
    >
      <div id="certificate-content" className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden
                       ${theme === 'dark' ? 
                         'bg-gradient-to-br from-knoux-dark-surface via-knoux-dark-bg to-knoux-dark-surface border-2 border-knoux-dark-primary' : 
                         'bg-gradient-to-br from-white via-knoux-light-surface to-white border-2 border-knoux-light-primary'}
                       p-8 space-y-6 relative`}
      >
        {/* Decorative corner elements */}
        <div className={`absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 ${theme === 'dark' ? 'border-knoux-dark-secondary' : 'border-knoux-light-secondary'}`}></div>
        <div className={`absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 ${theme === 'dark' ? 'border-knoux-dark-secondary' : 'border-knoux-light-secondary'}`}></div>
        <div className={`absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 ${theme === 'dark' ? 'border-knoux-dark-secondary' : 'border-knoux-light-secondary'}`}></div>
        <div className={`absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 ${theme === 'dark' ? 'border-knoux-dark-secondary' : 'border-knoux-light-secondary'}`}></div>

        <header className="text-center space-y-2">
          <KnouxLogo size="lg" className="mx-auto" />
          <h1 className={`text-3xl font-bold font-elmessiri ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
            {translate('knouxCertificate')}
          </h1>
          <FaAward className={`w-12 h-12 mx-auto ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
        </header>

        <section className="text-center">
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>This certifies that</p>
          <h2 className={`text-4xl font-amiri font-bold my-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {translate('developerName')}
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
            {translate('developerRole')}
          </p>
        </section>

        <section className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-knoux-dark-bg/50' : 'bg-gray-100/50'} text-sm`}>
          <h3 className={`text-lg font-semibold mb-2 text-center ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
            {translate('contactInfo')}
          </h3>
          <div className="space-y-1">
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
              <FaWhatsapp className="w-4 h-4 mr-2 text-green-500" /> {translate('whatsapp')}: {WHATSAPP_CONTACT}
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
              <FaEnvelope className="w-4 h-4 mr-2 text-blue-400" /> {translate('email')}: {EMAIL_CONTACT}
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
              <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-400" /> {translate('location')}: {LOCATION_CONTACT}
            </p>
          </div>
        </section>
        
        <section className="flex justify-between items-end pt-4 border-t dark:border-knoux-dark-primary/50 light:border-knoux-light-primary/50">
          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('issueDate')}:</p>
            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{today}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('digitalSignature')}:</p>
            <p className={`font-amiri text-xl italic ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-primary'}`}>
              {AUTHOR_SIGNATURE}
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 flex space-x-4">
        <StyledButton onClick={() => handleExport('PDF')} iconLeft={<FaFilePdf />}>
          {translate('exportPdf')}
        </StyledButton>
        <StyledButton onClick={() => handleExport('PNG')} variant="secondary" iconLeft={<FaFileImage />}>
          {translate('exportPng')}
        </StyledButton>
        <StyledButton onClick={() => window.print()} variant="ghost" iconLeft={<FaPrint />}>
          Print
        </StyledButton>
      </div>
    </motion.div>
  );
};

export default CertificatePage;
