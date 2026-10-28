import React from 'react';

interface GoogleAccentDotsProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const GoogleAccentDots: React.FC<GoogleAccentDotsProps> = ({
  className = '',
  size = 'sm',
}) => {
  const dotSizes = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  const s = dotSizes[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      aria-hidden="true"
      title="Localway • Google Partner Ecosystem"
    >
      <span className={`${s} rounded-full bg-[#4285F4] opacity-80`} />
      <span className={`${s} rounded-full bg-[#EA4335] opacity-80`} />
      <span className={`${s} rounded-full bg-[#FBBC05] opacity-80`} />
      <span className={`${s} rounded-full bg-[#34A853] opacity-80`} />
    </div>
  );
};

export const GoogleAccentLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`h-[2px] w-full flex rounded-full overflow-hidden opacity-75 ${className}`} aria-hidden="true">
      <div className="flex-1 bg-[#4285F4]" />
      <div className="flex-1 bg-[#EA4335]" />
      <div className="flex-1 bg-[#FBBC05]" />
      <div className="flex-1 bg-[#34A853]" />
    </div>
  );
};
