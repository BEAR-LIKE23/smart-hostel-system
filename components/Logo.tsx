import React from 'react';

interface LogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Display type: 'icon-only' for just the symbol, 'full' or 'horizontal' for symbol + text */
  variant?: 'icon-only' | 'full' | 'horizontal' | 'vertical';
  /** Optional subtitle or role badge (e.g., "Portal", "Admin Suite", "Student Hub") */
  subtitle?: string;
  /** Optional badge next to the text (e.g. "OFFICIAL", "SMART") */
  badgeText?: string;
  /** Extra container class names */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

export const LogoIcon: React.FC<{ sizeClass?: string; className?: string }> = ({ 
  sizeClass = "w-9 h-9", 
  className = "" 
}) => {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeClass} ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Main SVG Container */}
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="hostelLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="hostelAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="hostelRoofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon / Shield Base */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#hostelLogoGrad)" />

        {/* Roof / Architectural Gable Apex */}
        <path 
          d="M12 18L24 9L36 18" 
          stroke="url(#hostelRoofGrad)" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Left Pillar (H Left Column) */}
        <path 
          d="M16 19V36" 
          stroke="#ffffff" 
          strokeWidth="3.6" 
          strokeLinecap="round" 
        />

        {/* Right Pillar (H Right Column) */}
        <path 
          d="M32 19V36" 
          stroke="#ffffff" 
          strokeWidth="3.6" 
          strokeLinecap="round" 
        />

        {/* Central Smart Bridge (H Crossbar) */}
        <path 
          d="M16 27H32" 
          stroke="url(#hostelAccentGrad)" 
          strokeWidth="3.4" 
          strokeLinecap="round" 
        />

        {/* Smart Connectivity Dot / Gateway Node */}
        <circle cx="24" cy="27" r="2.8" fill="#ffffff" />
        <circle cx="24" cy="27" r="1.3" fill="#4f46e5" />

        {/* Subtle Window Accents */}
        <circle cx="24" cy="16" r="1.8" fill="#ffffff" fillOpacity="0.9" />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  subtitle,
  badgeText,
  className = '',
  onClick
}) => {
  // Size mapping
  const sizeStyles = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', badge: 'text-[8px] px-1 py-0.2' },
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', sub: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-sm', badge: 'text-xs px-2.5 py-0.5' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-base', badge: 'text-sm px-3 py-1' },
  }[size];

  const isClickable = Boolean(onClick);

  if (variant === 'icon-only') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''} ${className}`}
      >
        <LogoIcon sizeClass={sizeStyles.icon} />
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div 
        onClick={onClick} 
        className={`flex flex-col items-center text-center gap-2 group ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      >
        <LogoIcon sizeClass={sizeStyles.icon} className="transition-transform group-hover:scale-105" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className={`${sizeStyles.text} font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400`}>
              SmartHostel
            </span>
            {badgeText && (
              <span className={`${sizeStyles.badge} rounded-full font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <span className={`${sizeStyles.sub} font-medium text-gray-500 dark:text-gray-400 tracking-wide`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal / Full default
  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center gap-3 group select-none ${isClickable ? 'cursor-pointer' : ''} ${className}`}
    >
      <LogoIcon sizeClass={sizeStyles.icon} className="transition-transform group-hover:scale-105" />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className={`${sizeStyles.text} font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400`}>
            SmartHostel
          </span>
          {badgeText && (
            <span className={`${sizeStyles.badge} rounded-full font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && (
          <span className={`${sizeStyles.sub} font-medium text-gray-500 dark:text-gray-400 leading-tight tracking-normal`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
