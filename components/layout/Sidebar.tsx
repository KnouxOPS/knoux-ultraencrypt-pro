
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaLock, FaUnlock, FaArchive, FaListAlt, FaKey, FaTrashAlt, FaCog, FaBook, FaPowerOff
} from 'react-icons/fa'; 
import { useAppContext } from '../../contexts/AppContext';
import KnouxLogo from '../shared/KnouxLogo';
import { AUTHOR_SIGNATURE } from '../../constants';
import StyledButton from '../shared/StyledButton'; // Import StyledButton

interface NavItemProps {
  to: string;
  icon: React.ReactElement<{ className?: string }>;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ease-in-out w-full";
  const activeClasses = "bg-opacity-20 dark:bg-knoux-dark-primary light:bg-knoux-light-primary text-white dark:text-opacity-100 light:text-opacity-100 font-semibold shadow-lg";
  const inactiveClasses = "hover:bg-opacity-10 dark:hover:bg-gray-700 light:hover:bg-gray-300 dark:text-gray-400 light:text-gray-600";
  
  return (
    <NavLink
      to={to}
      end={to === "/"} // Ensures exact match for home page '/' if it's the encrypt page
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span className="text-sm">{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { translate, isAuthenticated, logout } = useAppContext(); // Added isAuthenticated and logout

  const navItems = [
    { to: "/", icon: <FaLock />, label: translate('encrypt') },
    { to: "/decrypt", icon: <FaUnlock />, label: translate('decrypt') },
    { to: "/vaults", icon: <FaArchive />, label: translate('vaults') },
    { to: "/activity-log", icon: <FaListAlt />, label: translate('activityLog') },
    { to: "/key-generator", icon: <FaKey />, label: translate('keyGenerator') },
    { to: "/secure-shredder", icon: <FaTrashAlt />, label: translate('secureShredder') },
    { to: "/settings", icon: <FaCog />, label: translate('settings') },
    { to: "/documentation", icon: <FaBook />, label: translate('documentation') },
  ];

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 p-4 
                     bg-opacity-70 backdrop-blur-lg shadow-xl
                     dark:bg-knoux-dark-surface/70 dark:text-gray-100 
                     light:bg-knoux-light-surface/70 light:text-gray-800
                     flex flex-col justify-between transition-colors duration-300 overflow-y-auto custom-scrollbar">
      <div>
        <div className="flex items-center justify-center mb-6 mt-2">
            <KnouxLogo size="md"/>
        </div>
        <nav className="space-y-1.5">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto pt-4 border-t dark:border-gray-700 light:border-gray-300">
        {isAuthenticated && (
          <div className="mb-4">
            <StyledButton
              onClick={logout}
              variant="danger"
              size="sm"
              fullWidth
              iconLeft={<FaPowerOff />}
            >
              {translate('logout')}
            </StyledButton>
          </div>
        )}
        <div className="flex flex-col items-center text-center">
          <p className="text-xs dark:text-gray-400 light:text-gray-600">
            &copy; {new Date().getFullYear()} {translate('appName')}
          </p>
          <p className="text-xs dark:text-gray-500 light:text-gray-500">
            {AUTHOR_SIGNATURE}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;