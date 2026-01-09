
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import TextStudio from './views/TextStudio';
import ImageStudio from './views/ImageStudio';
import VoiceStudio from './views/VoiceStudio';
import WellnessJournal from './views/WellnessJournal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('levant_dark_mode') === 'true');
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('levant_user_name'));
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    localStorage.setItem('levant_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('levant_user_name', tempName.trim());
    }
  };

  const handleLogout = () => {
    setUserName(null);
    localStorage.removeItem('levant_user_name');
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case AppView.TEXT_STUDIO:
        return <TextStudio />;
      case AppView.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppView.VOICE_STUDIO:
        return <VoiceStudio />;
      case AppView.WELLNESS:
        return <WellnessJournal />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  // Onboarding screen
  if (!userName) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors ${isDarkMode ? 'dark' : ''}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg">
              ✨
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome to Levant</h1>
              <p className="text-slate-500 dark:text-slate-400">Your professional creative AI workspace.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">What should we call you?</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Your Name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white font-medium"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:opacity-90 transition transform active:scale-[0.98] shadow-xl"
              >
                Get Started
              </button>
            </form>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-xs font-semibold text-slate-400 hover:text-blue-500 transition-colors"
               >
                 Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          userName={userName}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
