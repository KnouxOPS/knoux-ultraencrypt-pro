
import React from 'react';
import { KNOUX_LOGO_URL } from '../../constants';

interface KnouxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const KnouxLogo: React.FC<KnouxLogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <img 
      src={KNOUX_LOGO_URL} 
      alt="KNOUX Logo" 
      className={`${sizeClasses[size]} ${className || ''}`} 
    />
  );
};

export default KnouxLogo;
    