
import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

import EncryptPage from './pages/EncryptPage';
import DecryptPage from './pages/DecryptPage';
import VaultManagementPage from './pages/VaultManagementPage';
import ActivityLogPage from './pages/ActivityLogPage';
import KeyGeneratorPage from './pages/KeyGeneratorPage';
import SecureShredderPage from './pages/SecureShredderPage';
import SettingsPage from './pages/SettingsPage'; 
import DocumentationPage from './pages/DocumentationPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { theme, isAuthenticated } = useAppContext(); // Added isAuthenticated
  const location = useLocation(); // For AnimatePresence key

  const pageVariants = {
    initial: { opacity: 0, x: "-2vw" }, 
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "2vw" }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate", 
    duration: 0.35 
  };
  
  return (
    <div className={`flex flex-col min-h-screen font-sans transition-colors duration-300
                    ${theme === 'dark' ? 'bg-knoux-dark-bg text-gray-100' : 'bg-knoux-light-bg text-gray-900'}`}>
      {isAuthenticated && <Header />} {/* Show Header only if authenticated */}
      <div className="flex flex-1 pt-0"> {/* Adjusted pt for login page */}
        {isAuthenticated && <Sidebar />} {/* Show Sidebar only if authenticated */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar 
                         ${isAuthenticated ? 'ml-64 pt-16' : 'ml-0 pt-0'}`}> {/* Adjust margin and padding based on auth */}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/" /> : // If already auth, redirect from login
                  <motion.div key="login" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <LoginPage />
                  </motion.div>
              }/>
              <Route path="/" element={
                <ProtectedRoute>
                  <motion.div key="encrypt" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <EncryptPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="/decrypt" element={
                <ProtectedRoute>
                  <motion.div key="decrypt" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <DecryptPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="/vaults" element={
                <ProtectedRoute>
                  <motion.div key="vaults" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <VaultManagementPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="/activity-log" element={
                <ProtectedRoute>
                  <motion.div key="activity-log" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <ActivityLogPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="/key-generator" element={
                <ProtectedRoute>
                  <motion.div key="key-generator" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <KeyGeneratorPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="/secure-shredder" element={
                <ProtectedRoute>
                  <motion.div key="secure-shredder" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <SecureShredderPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
               <Route path="/settings" element={
                 <ProtectedRoute>
                  <motion.div key="settings" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <SettingsPage />
                  </motion.div>
                 </ProtectedRoute>
              }/>
              <Route path="/documentation" element={
                <ProtectedRoute>
                  <motion.div key="docs" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <DocumentationPage />
                  </motion.div>
                </ProtectedRoute>
              }/>
              <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      {isAuthenticated && <Footer />} {/* Show Footer only if authenticated */}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;