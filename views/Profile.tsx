
import React, { useState, useEffect } from 'react';
import { UserAccount, PersonalityType } from '../types';
import { geminiService } from '../services/gemini';

interface ProfileProps {
  onUserUpdate: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onUserUpdate, onLogout }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('levant_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.settings?.bio || '');
  const [language, setLanguage] = useState(user?.settings?.language || 'English');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Password change states
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [settings, setSettings] = useState(user?.settings || {
    personality: 'Guardian',
    style: '3D Pixar-style',
    background: 'High-tech Office',
    language: 'English',
    bio: '',
    density: 'Comfortable',
    nameChanged: false
  });

  const isNameLocked = settings.nameChanged;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    // Check if name is being changed and wasn't changed before
    const isChangingName = name !== user.name;
    const newNameChangedValue = isNameLocked || isChangingName;

    const updatedUser: UserAccount = {
      ...user,
      name: isNameLocked ? user.name : name, // Force old name if locked
      settings: {
        ...settings,
        bio,
        language,
        nameChanged: newNameChangedValue
      }
    };

    onUserUpdate(updatedUser);
    setUser(updatedUser);
    setSettings(updatedUser.settings);
    
    const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
    const idx = accounts.findIndex((a: any) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = updatedUser;
      localStorage.setItem('levant_accounts', JSON.stringify(accounts));
    }

    setIsSaving(false);
    setMessage({ 
      text: isChangingName ? 'Core identity synchronized and name locked' : 'Core identity synchronized', 
      type: 'success' 
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (user.password && currentPass !== user.password) {
      setMessage({ text: 'Neural key mismatch (Current password incorrect)', type: 'error' });
      return;
    }
    
    const updatedUser = { ...user, password: newPass };
    onUserUpdate(updatedUser);
    
    const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
    const idx = accounts.findIndex((a: any) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = updatedUser;
      localStorage.setItem('levant_accounts', JSON.stringify(accounts));
    }

    setCurrentPass('');
    setNewPass('');
    setMessage({ text: 'Neural access key updated', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteAccount = () => {
    if (!user) return;
    if (window.confirm("FATAL ACTION: Are you sure you want to decommission this account? All neural data will be purged.")) {
      const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
      const filtered = accounts.filter((a: any) => a.id !== user.id);
      localStorage.setItem('levant_accounts', JSON.stringify(filtered));
      onLogout();
    }
  };

  const generateNewAvatar = async () => {
    if (!user) return;
    setIsGeneratingAvatar(true);
    try {
      const prompt = `Professional ${settings.style} character portrait of ${name}. High quality, cinematic lighting, ${settings.background} background.`;
      const url = await geminiService.generateImage(prompt, "1:1");
      
      const updatedUser = { ...user, avatarUrl: url };
      onUserUpdate(updatedUser);
      setUser(updatedUser);
      
      const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
      const idx = accounts.findIndex((a: any) => a.id === user.id);
      if (idx !== -1) {
        accounts[idx] = updatedUser;
        localStorage.setItem('levant_accounts', JSON.stringify(accounts));
      }

      setMessage({ text: 'Neural appearance updated', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Avatar synthesis failed', type: 'error' });
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">My Identity</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Coordinate your neural presence and account permissions.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
             Established {new Date(user.createdAt).toLocaleDateString()}
           </span>
        </div>
      </div>

      {message && (
        <div className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in zoom-in duration-300 shadow-xl fixed top-24 left-1/2 -translate-x-1/2 z-50 min-w-[300px] border ${
          message.type === 'success' 
          ? 'bg-blue-600 text-white border-blue-400' 
          : 'bg-rose-600 text-white border-rose-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Stats & Avatar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 shadow-sm flex flex-col items-center">
            <div className="relative w-52 h-52 rounded-[64px] overflow-hidden mb-8 bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl group ring-8 ring-slate-50 dark:ring-slate-800/50">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-30 bg-slate-100 dark:bg-slate-800">👤</div>
              )}
              {isGeneratingAvatar && (
                <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <svg className="animate-spin h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-[9px] font-black uppercase tracking-widest">Synthesizing...</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={generateNewAvatar}
              disabled={isGeneratingAvatar}
              className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50 shadow-sm"
            >
              {isGeneratingAvatar ? 'Synthesizing...' : 'Edit Profile Image (AI)'}
            </button>

            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 w-full text-center space-y-1">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800 py-1 px-3 rounded-full inline-block">
                {user.email}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Account Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Signals</p>
                    <p className="text-2xl font-black">12.4k</p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Neural Health</p>
                    <p className="text-2xl font-black">99.8%</p>
                  </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full"></div>
          </div>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Identity Form */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Identity Core
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Name</label>
                  {isNameLocked && (
                    <span className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      Name Locked
                    </span>
                  )}
                </div>
                <input 
                  type="text"
                  disabled={isNameLocked}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] outline-none transition text-slate-800 dark:text-white font-bold ${
                    isNameLocked ? 'opacity-60 cursor-not-allowed' : 'focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400'
                  }`}
                />
                {!isNameLocked && (
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest ml-1">
                    * You can only change your name once.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Personal Bio / Neural Intent</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your AI context about yourself..."
                  className="w-full h-32 px-7 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white font-bold resize-none"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cognitive Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition font-black text-[11px] uppercase tracking-widest"
                  >
                    <option value="English">English (Global)</option>
                    <option value="Spanish">Spanish (Latam/ES)</option>
                    <option value="French">French (Parisian)</option>
                    <option value="German">German (Logical)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Neural Density</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px]">
                    {['Comfortable', 'Compact'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSettings({...settings, density: d})}
                        className={`flex-1 py-3.5 rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                          settings.density === d ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-[28px] uppercase tracking-[0.2em] text-[11px] hover:bg-black dark:hover:bg-blue-700 transition shadow-2xl active:scale-[0.98]"
                >
                  {isSaving ? 'Synchronizing Core...' : 'Commit Core Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Security Form */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Neural Access Key
            </h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Key</label>
                  <input 
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Neural Key</label>
                  <input 
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-10 py-5 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black rounded-[28px] uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 dark:hover:bg-slate-900 transition active:scale-[0.98]"
              >
                Update Access Key
              </button>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30 rounded-[48px] p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500 mb-2">Danger Zone</h3>
                <p className="text-sm text-rose-600/70 dark:text-rose-400/70 font-medium">Decommissioning your account will permanently purge all neural history, image generations, and cognitive weights.</p>
              </div>
              <button
                onClick={deleteAccount}
                className="shrink-0 px-8 py-4 bg-rose-600 text-white font-black rounded-[24px] uppercase tracking-widest text-[10px] hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 active:scale-95"
              >
                Decommission Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
