
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaUserShield, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { Navigate, useLocation } from 'react-router-dom';
import KnouxLogo from '../components/shared/KnouxLogo';

const LoginPage: React.FC = () => {
  const { theme, translate, login, isAuthenticated, language } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    if (!success) {
      setError(translate('invalidCredentials'));
    }
    // Navigation is handled by App.tsx based on isAuthenticated state
  };

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`min-h-screen flex flex-col items-center justify-center p-4
                  ${theme === 'dark' ? 'bg-knoux-dark-bg' : 'bg-knoux-light-bg'}`}
    >
      <div className={`w-full max-w-md p-8 md:p-10 rounded-xl shadow-2xl
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-md border border-knoux-dark-primary/50 shadow-[var(--knoux-glow-primary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-md border border-knoux-light-primary/50 shadow-2xl'}
                        ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex flex-col items-center mb-6 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'} md:justify-center md:space-x-4 rtl:space-x-reverse`}>
          <KnouxLogo size="lg" className="mb-3 md:mb-0" />
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold text-center md:text-left ${isRTL ? 'md:text-right' : 'md:text-left'}
                            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {translate('loginPageTitle')}
            </h1>
            <p className={`text-sm text-center md:text-left ${isRTL ? 'md:text-right' : 'md:text-left'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {translate('loginWelcome')}
            </p>
          </div>
        </div>
        
        <p className={`mb-6 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {translate('loginInstructions')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
                htmlFor="username" 
                className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {translate('username')}
            </label>
            <div className="relative">
                <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={translate('enterUsername')}
                required
                className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                            ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'}
                            ${isRTL ? 'rtl:pr-10 ltr:pl-10' : 'ltr:pl-10 rtl:pr-10'}`}
                />
                <FaUserShield className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            </div>
          </div>

          <div>
            <label 
                htmlFor="password" 
                className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {translate('password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={translate('enterPassword')}
                required
                className={`w-full p-3 rounded-lg border neon-focus-ring-primary
                            ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-200 border-knoux-dark-primary/50' : 'bg-white text-gray-700 border-gray-300'}
                            ${isRTL ? 'rtl:pr-10 ltr:pl-10' : 'ltr:pr-10 rtl:pl-10'}`}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className={`absolute inset-y-0 px-3 flex items-center text-gray-500 hover:text-knoux-dark-primary dark:hover:text-knoux-light-primary ${isRTL ? 'left-0' : 'right-0'}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <p className={`text-sm text-center p-2.5 rounded-md border
                           ${theme === 'dark' ? 'bg-red-900/30 text-red-300 border-red-700/50' : 'bg-red-100/70 text-red-700 border-red-300/50'}`}>
              {error}
            </p>
          )}

          <StyledButton 
            type="submit" 
            fullWidth 
            size="lg" 
            variant="primary" 
            isLoading={isLoading} 
            disabled={isLoading}
            className="py-3.5 text-base"
            iconLeft={isLoading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
          >
            {translate('loginButton')}
          </StyledButton>
        </form>
        <p className={`mt-8 text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            KNOUX UltraEncrypt Pro - {translate('taglineUltraEncrypt')}
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
