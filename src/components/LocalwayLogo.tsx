import React from 'react';

interface LocalwayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBadgeBorder?: boolean;
}

export const LocalwayLogo: React.FC<LocalwayLogoProps> = ({
  className = '',
  size = 'md',
  showBadgeBorder = false,
}) => {
  const heightClasses = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    hero: 'h-9 sm:h-11',
  };

  const containerClasses = showBadgeBorder
    ? 'inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200'
    : 'inline-flex items-center';

  return (
    <div className={`${containerClasses} ${className}`} id="localway-logo-container">
      <img
        src="/localway-logo-transparent.png"
        alt="Localway"
        className={`${heightClasses[size]} w-auto object-contain select-none`}
        onError={(e) => {
          // Fallback to text if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'inline-block';
          }
        }}
      />
      <span className="hidden font-extrabold tracking-tight text-slate-900 text-xl">
        Localway
      </span>
    </div>
  );
};
