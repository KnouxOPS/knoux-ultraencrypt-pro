
import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const StyledButton: React.FC<StyledButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  iconLeft,
  iconRight,
  className, 
  onClick,
  isLoading = false,
  disabled,
  fullWidth = false,
  ...props 
}) => {
  const { theme, language } = useAppContext(); // language for RTL icon adjustments

  const baseStyle = `font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none 
                     flex items-center justify-center gap-2 relative overflow-hidden 
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none`;
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  const variantStyles = {
    primary: `
      text-white
      ${theme === 'dark' ? 
        'bg-knoux-dark-primary hover:bg-purple-700 focus:bg-purple-700' : 
        'bg-knoux-light-primary hover:bg-purple-600 focus:bg-purple-600'}
      shadow-[var(--knoux-glow-primary-deep)] hover:shadow-[0_0_20px_var(--knoux-neon-primary),0_0_30px_rgba(124,58,237,0.7)]
      focus:shadow-[0_0_20px_var(--knoux-neon-primary),0_0_30px_rgba(124,58,237,0.7)]
      transform hover:scale-105 focus:scale-105
    `,
    secondary: `
      text-white
      ${theme === 'dark' ? 
        'bg-knoux-dark-secondary hover:bg-blue-600 focus:bg-blue-600' : 
        'bg-knoux-light-secondary hover:bg-blue-500 focus:bg-blue-500'}
      shadow-[var(--knoux-glow-secondary-deep)] hover:shadow-[0_0_20px_var(--knoux-neon-secondary),0_0_30px_rgba(59,130,246,0.7)]
      focus:shadow-[0_0_20px_var(--knoux-neon-secondary),0_0_30px_rgba(59,130,246,0.7)]
      transform hover:scale-105 focus:scale-105
    `,
    ghost: `
      ${theme === 'dark' ? 
        'bg-transparent hover:bg-knoux-dark-surface/70 text-gray-300 hover:text-white focus:bg-knoux-dark-surface/70 focus:text-white' : 
        'bg-transparent hover:bg-gray-200/70 text-gray-700 hover:text-black focus:bg-gray-200/70 focus:text-black'}
      focus:ring-2 ${theme === 'dark' ? 'focus:ring-knoux-dark-secondary/50' : 'focus:ring-knoux-light-secondary/50'}
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white focus:bg-red-700
      shadow-[var(--knoux-glow-danger-deep)]
      hover:shadow-[0_0_var(--knoux-glow-danger-pulse-intensity)_var(--knoux-neon-danger),0_0_30px_rgba(239,68,68,0.8)]
      focus:shadow-[0_0_var(--knoux-glow-danger-pulse-intensity)_var(--knoux-neon-danger),0_0_30px_rgba(239,68,68,0.8)]
      transform hover:scale-105 focus:scale-105
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white focus:bg-green-700
      shadow-[0_0_15px_var(--knoux-neon-success)] hover:shadow-[0_0_20px_var(--knoux-neon-success),0_0_30px_rgba(16,185,129,0.7)]
      focus:shadow-[0_0_20px_var(--knoux-neon-success),0_0_30px_rgba(16,185,129,0.7)]
      transform hover:scale-105 focus:scale-105
    `,
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;
    if (onClick) {
      onClick(e);
    }
  };

  const iconLeftMargin = children ? (language === 'ar' ? "ml-1" : "mr-1") : "";
  const iconRightMargin = children ? (language === 'ar' ? "mr-1" : "ml-1") : "";


  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className || ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : iconLeft && <span className={iconLeftMargin}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={iconRightMargin}>{iconRight}</span>}
    </button>
  );
};

export default StyledButton;