import React from 'react';
import { User } from 'lucide-react';

interface UserProfileMenuProps {
  onOpenManageQuestions: () => void;
  onOpenAdminTab?: (tab: 'submissions' | 'fields' | 'segments' | 'settings') => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  onLoginRequest?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onOpenManageQuestions,
  onOpenAdminTab,
  isAuthenticated,
  onLogout,
  onLoginRequest,
}) => {
  const handleClick = () => {
    if (isAuthenticated) {
      onOpenManageQuestions();
    } else if (onLoginRequest) {
      onLoginRequest();
    } else {
      onOpenManageQuestions();
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* 
        Discreet, minimalist neutral gray trigger without down-chevron.
        Subtle styling so onboarding clients don't notice it, dedicated for admin use.
      */}
      <button
        type="button"
        id="admin-header-profile-button"
        onClick={handleClick}
        aria-label="Acesso Administrativo"
        title={isAuthenticated ? 'Acesso Administrativo (Conectado)' : 'Acesso Restrito'}
        className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-9 rounded-full border border-slate-200/80 bg-slate-100/70 hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-all duration-200 cursor-pointer shadow-xs select-none"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-200/70 group-hover:bg-slate-300/80 text-slate-500 group-hover:text-slate-700 transition-colors">
          <User className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      </button>
    </div>
  );
};
