
import React from 'react';
import { FaSun, FaMoon, FaGlobe, FaUserCircle } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';
import { Theme, Language } from '../../types';
import KnouxLogo from '../shared/KnouxLogo';

const Header: React.FC = () => {
  const { theme, setTheme, language, setLanguage, translate, isAuthenticated, currentUser } = useAppContext();

  const toggleTheme = () => {
    setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark);
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.English ? Language.Arabic : Language.English);
  };

  const isRTL = language === 'ar';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 sm:px-6 lg:px-8
                     bg-opacity-80 backdrop-blur-md shadow-lg
                     dark:bg-knoux-dark-surface/80 dark:text-gray-100
                     light:bg-knoux-light-surface/80 light:text-gray-800
                     flex items-center justify-between transition-colors duration-300">
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
        <KnouxLogo size="sm" />
        <h1 className="text-xl font-semibold tracking-tight hidden sm:block">{translate('appName')}</h1>
      </div>
      
      <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
        {isAuthenticated && currentUser && (
          <div className={`flex items-center ${isRTL ? 'ml-3' : 'mr-3'} hidden md:flex`}>
            <FaUserCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{translate('welcomeBack', currentUser.username)}</span>
          </div>
        )}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-opacity-20 dark:hover:bg-gray-700 light:hover:bg-gray-300 transition-colors"
          aria-label={theme === Theme.Dark ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === Theme.Dark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === Theme.Dark ? <FaSun className="w-5 h-5 text-yellow-400" /> : <FaMoon className="w-5 h-5 text-knoux-light-primary" />}
        </button>
        <button 
          onClick={toggleLanguage} 
          className="p-2 rounded-full hover:bg-opacity-20 dark:hover:bg-gray-700 light:hover:bg-gray-300 transition-colors"
          aria-label={language === Language.English ? "Switch to Arabic" : "Switch to English"}
          title={language === Language.English ? "Switch to Arabic" : "Switch to English"}
        >
          <FaGlobe className="w-5 h-5 dark:text-gray-300 light:text-gray-700" />
          <span className={`text-xs ${isRTL ? 'mr-1' : 'ml-1'}`}>{language === Language.English ? 'AR' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;