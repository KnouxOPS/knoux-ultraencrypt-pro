
import React from 'react';
import { AUTHOR_SIGNATURE } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';

const Footer: React.FC = () => {
  const { theme } = useAppContext();
  return (
    <footer className={`py-4 text-center text-sm 
                       ${theme === 'dark' ? 'text-gray-400 bg-knoux-dark-surface' : 'text-gray-600 bg-knoux-light-surface'} 
                       border-t 
                       ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
      <p>&copy; {new Date().getFullYear()} KNOUX. All rights reserved.</p>
      <p>Developed by: {AUTHOR_SIGNATURE}</p>
    </footer>
  );
};

export default Footer;
    