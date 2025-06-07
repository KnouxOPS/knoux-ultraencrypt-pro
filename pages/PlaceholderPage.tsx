
import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import { FaTools } from 'react-icons/fa'; // Example icon

interface PlaceholderPageProps {
  titleKey: string;
  messageKey?: string;
  icon?: React.ReactElement<{ className?: string }>;
  showConstructionMessage?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  titleKey, 
  messageKey, 
  icon,
  showConstructionMessage = true 
}) => {
  const { theme, translate } = useAppContext();
  const displayIcon = icon ? React.cloneElement(icon, { className: "w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" }) : <FaTools className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />;

  const defaultMessageKey = "placeholderDefaultMessage";
  // Add to translations: placeholderDefaultMessage: { en: "This section is under active development or awaiting content. Thank you for your patience!", ar: "هذا القسم قيد التطوير النشط أو في انتظار المحتوى. شكرا لك على صبرك!"}

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 flex flex-col items-center justify-center text-center h-full"
    >
      <div className={`p-8 rounded-xl shadow-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface' : 'bg-knoux-light-surface'}
                       border ${theme === 'dark' ? 'border-knoux-dark-primary/30' : 'border-knoux-light-primary/30'}`}>
        {displayIcon}
        <h1 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {translate(titleKey)}
        </h1>
        {showConstructionMessage && (
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {translate(messageKey || defaultMessageKey)}
          </p>
        )}
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'}`}>
          {translate('appName')} - {translate('taglineUltraEncrypt')} 
          {/* Add to translations: taglineUltraEncrypt: { en: "Your Data, Your Control.", ar: "بياناتك تحت سيطرتك." } */}
        </p>
      </div>
    </motion.div>
  );
};

export default PlaceholderPage;
