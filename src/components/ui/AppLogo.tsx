'use client';

import React, { memo, useMemo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string;
  iconName?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  src = '/assets/images/app_logo.png',
  iconName = 'SparklesIcon',
  size = 1120, // Increased from 200 to a more reasonable header size
  className = '',
  onClick,
}: AppLogoProps) {
  // Ensure minimum size for visibility
  const actualSize = useMemo(() => Math.max(size, 60), [size]);

  const containerClassName = useMemo(() => {
    const classes = ['flex items-center justify-center'];

    if (onClick) {
      classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div
      className={containerClassName}
      onClick={onClick}
      style={{
        width: `${actualSize}px`,
        height: `${actualSize}px`,
        minWidth: `${actualSize}px`,
        minHeight: `${actualSize}px`,
      }}
    >
      {src ? (
        <AppImage
          src={src}
          alt="Logo"
          width={actualSize}
          height={actualSize}
          priority={true}
          unoptimized={src.endsWith('.svg')}
          className="object-contain"
          style={{
            width: `${actualSize}px`,
            height: `${actualSize}px`,
            maxWidth: 'none',
          }}
        />
      ) : (
        <AppIcon name={iconName} size={actualSize} className="flex-shrink-0" />
      )}
    </div>
  );
});

export default AppLogo;
