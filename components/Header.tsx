
import React, { useEffect, useState } from 'react';
import { PersonalityType } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userName: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, userName, onLogout }) => {
  const [personality, setPersonality] = useState<PersonalityType>('Guardian');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkPersonality = () => {
      const session = localStorage.getItem('levant_active_session');
      if (session) {
        const user = JSON.parse(session);
        const p = user.settings?.personality || 'Guardian';
        if (p !== personality) setPersonality(p);
        setIsGuest(user.id.startsWith('guest-'));
      }
    };
    checkPersonality();
    const interval = setInterval(checkPersonality, 2000);
    return () => clearInterval(interval);
  }, [personality]);

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <span className="hidden md:flex items-center px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800/50 shadow-sm">
          <svg viewBox="0 0 100 100" className="w-3 h-3 mr-2.5">
            <path d="M35 75 L50 25 L65 75" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="50" cy="25" r="8" fill="currentColor" className="animate-pulse" />
          </svg>
          Neural: {personality} Active
        </span>
        {isGuest && (
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-800/50">
            Guest Session
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all rounded-xl border border-slate-100 dark:border-slate-700"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 1111.25 3v11.25a9 9 0 010 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        {userName && (
          <div className="flex items-center space-x-4 pl-6 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none tracking-tight">{userName}</p>
              <button 
                onClick={onLogout}
                className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                End Session
              </button>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-white text-sm font-black transition-transform hover:scale-110 active:scale-95 cursor-pointer">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
