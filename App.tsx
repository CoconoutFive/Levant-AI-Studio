
import React, { useState, useEffect } from 'react';
import { AppView, UserAccount } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import TextStudio from './views/TextStudio';
import ImageStudio from './views/ImageStudio';
import VoiceStudio from './views/VoiceStudio';
import WellnessJournal from './views/WellnessJournal';
import ChatStudio from './views/ChatStudio';
import Forum from './views/Forum';
import Profile from './views/Profile';

const LogoMark = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-10" />
    <path 
      d="M35 75 L50 25 L65 75" 
      fill="none" 
      stroke="url(#logoGrad)" 
      strokeWidth="10" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="drop-shadow-lg"
    />
    <path 
      d="M45 75 L35 75 L45 45" 
      fill="none" 
      stroke="url(#logoGrad)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      className="opacity-50"
    />
    <circle cx="50" cy="25" r="5" fill="url(#logoGrad)" className="animate-pulse" />
  </svg>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('levant_dark_mode') === 'true');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('levant_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('levant_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getAccounts = (): UserAccount[] => {
    const saved = localStorage.getItem('levant_accounts');
    return saved ? JSON.parse(saved) : [];
  };

  const saveAccounts = (accounts: UserAccount[]) => {
    localStorage.setItem('levant_accounts', JSON.stringify(accounts));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const accounts = getAccounts();

    if (authMode === 'signup') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields.');
        return;
      }
      if (accounts.some(a => a.email === formData.email)) {
        setError('An account with this email already exists.');
        return;
      }

      const newUser: UserAccount = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        createdAt: new Date(),
        settings: {
          personality: 'Guardian',
          style: '3D Pixar-style',
          background: 'High-tech Office'
        }
      };

      const updatedAccounts = [...accounts, newUser];
      saveAccounts(updatedAccounts);
      setCurrentUser(newUser);
      localStorage.setItem('levant_active_session', JSON.stringify(newUser));
    } else {
      const user = accounts.find(a => a.email === formData.email && a.password === formData.password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('levant_active_session', JSON.stringify(user));
      } else {
        setError('Invalid email or password.');
      }
    }
  };

  const handleGuestLogin = () => {
    const guestUser: UserAccount = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@levant.local',
      createdAt: new Date(),
      settings: {
        personality: 'Guardian',
        style: 'Minimalist Vector',
        background: 'Zen Garden'
      }
    };
    setCurrentUser(guestUser);
    localStorage.setItem('levant_active_session', JSON.stringify(guestUser));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('levant_active_session');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUserUpdate = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('levant_active_session', JSON.stringify(updatedUser));
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
      case AppView.CHAT:
        return <ChatStudio />;
      case AppView.FORUM:
        return <Forum />;
      case AppView.PROFILE:
        return <Profile onUserUpdate={handleUserUpdate} onLogout={handleLogout} />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors ${isDarkMode ? 'dark' : ''}`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-500">
          <div className="p-8 md:p-12 space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <LogoMark className="w-20 h-20" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Levant AI</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-[0.2em] font-bold">Emotional Workspace</p>
              </div>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'signup' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white font-medium"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white font-medium"
                />
              </div>

              {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-wide">{error}</p>}

              <div className="space-y-3 pt-2">
                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:opacity-90 transition transform active:scale-[0.98] shadow-xl text-[10px] uppercase tracking-widest"
                >
                  {authMode === 'login' ? 'Access Workspace' : 'Create Account'}
                </button>
                
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                  <span className="relative px-4 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest">or</span>
                </div>

                <button 
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-black rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition transform active:scale-[0.98] text-[10px] uppercase tracking-widest"
                >
                  Continue as Guest
                </button>
              </div>
            </form>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
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
          userName={currentUser.name}
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
