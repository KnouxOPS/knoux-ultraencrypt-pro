
import React from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaQuestionCircle, FaShieldAlt, FaLock, FaUnlock, FaArchive, FaKey, FaTrashAlt, FaCog } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
// import StyledButton from '../components/shared/StyledButton'; // If needed for links

const DocumentationPage: React.FC = () => {
  const { theme, translate } = useAppContext();

  const sections = [
    { 
      titleKey: "docIntroTitle", 
      contentKey: "docIntroContent",
      icon: <FaShieldAlt />,
      todoPrompt: "(TODO: Expand with overview, mission, key benefits for the user, and what problems this app solves. Explain local-first security.)"
    },
    { 
      titleKey: "docEncryptionTitle", 
      contentKey: "docEncryptionContent",
      icon: <FaLock />,
      todoPrompt: "(TODO: Detailed steps: selecting files, choosing algorithm, password best practices, understanding output (e.g., .knxenc files), what happens to original file if 'shred' is selected, common errors and solutions during encryption.)",
      subsections: [
        { titleKey: "docAlgoAES", contentKey: "docAlgoAESDetail", todoPrompt: "(TODO: Explain GCM, IVs, AuthTags simply. Mention it's a strong symmetric cipher.)" },
        { titleKey: "docAlgoChaCha", contentKey: "docAlgoChaChaDetail", todoPrompt: "(TODO: Briefly explain benefits like speed and security. Mention it's a stream cipher.)" },
        { titleKey: "docAlgoPQ", contentKey: "docAlgoPQDetail", todoPrompt: "(TODO: Explain implications, when to consider (long-term storage), potential performance differences, and that they are for advanced users or specific needs.)" },
      ]
    },
    { 
      titleKey: "docDecryptionTitle", 
      contentKey: "docDecryptionContent",
      icon: <FaUnlock />,
      todoPrompt: "(TODO: Step-by-step guide for decryption, selecting the correct encrypted file, entering the password, choosing the algorithm (if not auto-detected), handling metadata if separate, common issues like wrong password or algorithm.)"
    },
    { 
      titleKey: "docVaultsTitle", 
      contentKey: "docVaultsContent",
      icon: <FaArchive />,
      todoPrompt: "(TODO: Explain vault concept (secure encrypted folders). How to create a new vault, naming conventions, choosing a location. How to add files to a vault (encryption process), decrypt files from a vault, and manage/delete vaults. Security considerations for vault paths and backups.)"
    },
    { 
      titleKey: "docKeyGenTitle", 
      contentKey: "docKeyGenContent",
      icon: <FaKey />,
      todoPrompt: "(TODO: Explain options (length, character sets). Importance of randomness. How strength is estimated (local vs. AI if available). Using generated keys for encryption. Copying keys securely.)"
    },
    { 
      titleKey: "docShredderTitle", 
      contentKey: "docShredderContent",
      icon: <FaTrashAlt />,
      todoPrompt: "(TODO: Explain how secure shredding works (data overwriting). Importance of shred passes. Warning about data irreversibility. When to use it (e.g., after encrypting and verifying the encrypted copy).)"
    },
    { 
      titleKey: "docSettingsTitle", 
      contentKey: "docSettingsContent",
      icon: <FaCog />,
      todoPrompt: "(TODO: Detail each setting (Theme, Language, Default Algorithm, Default Shred Passes, Auto-delete options, Import/Export settings). Explain their impact on the application's behavior and user experience.)"
    },
    { 
      titleKey: "docTroubleshootingTitle", 
      contentKey: "docTroubleshootingContent",
      icon: <FaQuestionCircle />,
      todoPrompt: "(TODO: Populate with common errors users might face (e.g., 'Decryption failed', 'File not found', 'Permission denied'), their likely causes, and step-by-step solutions. Add FAQs like 'What if I forget my password?', 'Is my data sent anywhere?', 'How to backup encrypted files?')"
    },
    { 
      titleKey: "docContactTitle", 
      contentKey: "docContactContent",
      icon: <FaBookOpen />, // Changed icon for variety
      todoPrompt: "(TODO: Provide contact methods from constants or a dedicated form if planned. Explain how to report bugs or suggest features.)"
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-8 max-w-3xl mx-auto"
    >
      <div className="flex items-center mb-8">
        <FaBookOpen className={`w-12 h-12 mr-4 ${theme === 'dark' ? 'text-knoux-dark-primary' : 'text-knoux-light-primary'}`} />
        <div>
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {translate('documentation')}
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('docSubtitle')}</p>
        </div>
      </div>

      {sections.map((section, index) => (
        <section key={index} className={`p-6 rounded-xl shadow-lg 
                                         ${theme === 'dark' ? 'bg-knoux-dark-surface border border-knoux-dark-primary/20' : 'bg-knoux-light-surface border border-knoux-light-primary/20'}`}>
          <h2 className={`text-2xl font-semibold mb-3 flex items-center ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`}>
            {section.icon && React.cloneElement(section.icon, {className: "w-6 h-6 mr-2"})}
            {translate(section.titleKey)}
          </h2>
          <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {translate(section.contentKey)} <em className="text-xs opacity-70">{section.todoPrompt}</em>
          </p>
          {section.subsections && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 dark:border-knoux-dark-primary/50 light:border-knoux-light-primary/50">
              {section.subsections.map((sub, subIndex) => (
                 <div key={subIndex}>
                    <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{translate(sub.titleKey)}</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {translate(sub.contentKey)} <em className="text-xs opacity-70">{sub.todoPrompt}</em>
                    </p>
                 </div> 
              ))}
            </div>
          )}
        </section>
      ))}
      
      <div className={`mt-10 p-6 rounded-xl text-center ${theme === 'dark' ? 'bg-knoux-dark-bg' : 'bg-gray-100'}`}>
        <FaQuestionCircle className={`w-10 h-10 mx-auto mb-3 ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`}/>
        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{translate('needMoreHelp')}</h3>
        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{translate('contactSupportMessage')}</p>
        {/* TODO: Add contact button or info from constants using StyledButton if desired */}
      </div>

    </motion.div>
  );
};

export default DocumentationPage;
