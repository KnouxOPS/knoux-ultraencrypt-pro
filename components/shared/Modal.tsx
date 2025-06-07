
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../contexts/AppContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useAppContext();

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full'
  };
  
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            className={`relative w-full ${sizeClasses[size]} rounded-xl shadow-2xl
                        ${theme === 'dark' ? 'bg-knoux-dark-surface text-gray-100 border border-knoux-dark-primary' : 'bg-knoux-light-surface text-gray-800 border border-knoux-light-primary'}
                        flex flex-col overflow-hidden`}
            onClick={(e) => e.stopPropagation()} // Prevent click through
          >
            <header className={`flex items-center justify-between p-4 border-b
                               ${theme === 'dark' ? 'border-knoux-dark-primary/50' : 'border-knoux-light-primary/50'}`}>
              <h2 className="text-xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-full
                            ${theme === 'dark' ? 'hover:bg-knoux-dark-bg' : 'hover:bg-gray-200'}
                            transition-colors`}
                aria-label="Close modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </header>
            <main className="p-6 overflow-y-auto flex-grow">
              {children}
            </main>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
    