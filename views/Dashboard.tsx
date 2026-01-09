
import React, { useState, useEffect } from 'react';
import { AppView, PersonalityType, UserAccount } from '../types';
import { geminiService } from '../services/gemini';

interface DashboardProps {
  setView: (view: AppView) => void;
}

interface AvatarSettings {
  gender: 'male' | 'female' | 'neutral';
  skinTone: string;
  eyeColor: string;
  eyeShape: 'Almond' | 'Round' | 'Narrow' | 'Wide';
  noseShape: 'Button' | 'Straight' | 'Aquiline' | 'Broad';
  mouthStyle: 'Friendly Smile' | 'Neutral' | 'Open Smile' | 'Subtle Smirk';
  hairStyle: 'Short & Stylish' | 'Long & Wavy' | 'Buzz Cut' | 'Professional Bun' | 'Curly Afro' | 'Bald';
  facialHair: 'None' | 'Stubble' | 'Full Beard' | 'Goatee' | 'Clean Shaven';
  accessories: 'None' | 'Modern Glasses' | 'Futuristic Visor' | 'Tech Headset' | 'Earrings';
  personality: PersonalityType;
  style: '3D Pixar-style' | 'Cyberpunk' | 'Minimalist Vector' | 'Sketch';
  outfit: 'Business Suit' | 'Tech Hoodie' | 'Futuristic Armor' | 'Smart Casual';
  outfitColor: string;
  background: 'High-tech Office' | 'Neon City' | 'Zen Garden' | 'Abstract Geometric';
}

const tools = [
  {
    id: AppView.CHAT,
    title: 'Neural Chat',
    description: 'Casual and soulful presence for when things feel heavy.',
    icon: '💬',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    id: AppView.TEXT_STUDIO,
    title: 'Content Studio',
    description: 'Draft professional documents and creative copy with logic.',
    icon: '✍️',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    id: AppView.IMAGE_STUDIO,
    title: 'Digital Art Lab',
    description: 'Generate visuals and character art with advanced models.',
    icon: '🎨',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    id: AppView.VOICE_STUDIO,
    title: 'Voice Synthesis',
    description: 'Transform text into expressive human-like neural speech.',
    icon: '🎙️',
    color: 'bg-rose-500/10 text-rose-500',
  },
];

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [session, setSession] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('levant_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(session?.avatarUrl || null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeTab, setActiveTab] = useState<'anatomy' | 'style' | 'cognitive'>('anatomy');
  
  const [settings, setSettings] = useState<AvatarSettings>(() => {
    return session?.settings || {
      gender: 'male',
      skinTone: '#F5C6A5',
      eyeColor: '#4A3728',
      eyeShape: 'Almond',
      noseShape: 'Straight',
      mouthStyle: 'Friendly Smile',
      hairStyle: 'Short & Stylish',
      facialHair: 'None',
      accessories: 'None',
      personality: 'Guardian',
      style: '3D Pixar-style',
      outfit: 'Business Suit',
      outfitColor: '#0F172A',
      background: 'High-tech Office'
    };
  });

  const updateSession = (newSettings: AvatarSettings, newAvatarUrl?: string) => {
    if (!session) return;
    const updatedUser = { 
      ...session, 
      settings: newSettings, 
      avatarUrl: newAvatarUrl || session.avatarUrl 
    };
    
    // Update active session
    setSession(updatedUser);
    localStorage.setItem('levant_active_session', JSON.stringify(updatedUser));
    
    // Update account in "database"
    const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
    const idx = accounts.findIndex((a: any) => a.id === session.id);
    if (idx !== -1) {
      accounts[idx] = updatedUser;
      localStorage.setItem('levant_accounts', JSON.stringify(accounts));
    }
  };

  useEffect(() => {
    if (session) updateSession(settings);
  }, [settings]);

  const generateAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const prompt = `Professional ${settings.style} ${settings.gender} character Levant. Skin: ${settings.skinTone}. Eyes: ${settings.eyeShape}, ${settings.eyeColor}. Mouth: ${settings.mouthStyle}. Hair: ${settings.hairStyle}. Wearing ${settings.outfitColor} ${settings.outfit}. ${settings.background} background. Soft lighting.`;
      const url = await geminiService.generateImage(prompt, "1:1");
      setAvatarUrl(url);
      updateSession(settings, url);
      setShowCustomizer(false);
    } catch (error) {
      console.error("Avatar failed:", error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // UI Components inside Dashboard
  const OptionGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome, {session?.name.split(' ')[0]}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
              Your profile is isolated and secure. The <span className="text-blue-600 font-black uppercase text-sm tracking-widest">{settings.personality}</span> presence is ready.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView(AppView.WELLNESS)}
              className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-3"
            >
              <span>🧘</span> Reflection Lab
            </button>
          </div>
        </div>

        {/* Avatar Card */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 shadow-2xl flex flex-col items-center space-y-6">
            <div className="relative w-56 h-56 rounded-[56px] bg-slate-50 dark:bg-slate-950 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex items-center justify-center h-full text-5xl grayscale opacity-30">👤</div>
              )}
              {isGeneratingAvatar && (
                <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <svg className="animate-spin h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Syncing...</span>
                </div>
              )}
            </div>
            
            <div className="w-full space-y-4">
              {!showCustomizer ? (
                <div className="flex gap-2">
                  <button onClick={generateAvatar} className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">
                    Deploy Avatar
                  </button>
                  <button onClick={() => setShowCustomizer(true)} className="p-4 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:text-blue-600 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                   <div className="flex items-center justify-between">
                     <h5 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Customizer</h5>
                     <button onClick={() => setShowCustomizer(false)} className="text-rose-500 font-bold text-[10px] uppercase">Close</button>
                   </div>
                   <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {['anatomy', 'cognitive'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition ${activeTab === t ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>
                      ))}
                   </div>
                   {activeTab === 'cognitive' && (
                     <div className="grid grid-cols-2 gap-2">
                       {['Guardian', 'Muse', 'Architect', 'Sentinel'].map(p => (
                         <button 
                           key={p} 
                           onClick={() => setSettings({...settings, personality: p as any})}
                           className={`py-3 text-[10px] font-black uppercase rounded-xl border transition ${settings.personality === p ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
                         >
                           {p}
                         </button>
                       ))}
                     </div>
                   )}
                   {activeTab === 'anatomy' && (
                     <div className="space-y-2">
                        <select 
                          value={settings.gender} 
                          onChange={(e) => setSettings({...settings, gender: e.target.value as any})}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="neutral">Neutral</option>
                        </select>
                        <select 
                          value={settings.style} 
                          onChange={(e) => setSettings({...settings, style: e.target.value as any})}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase"
                        >
                          <option value="3D Pixar-style">Pixar 3D</option>
                          <option value="Cyberpunk">Cyberpunk</option>
                          <option value="Minimalist Vector">Vector</option>
                        </select>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setView(tool.id)}
            className="group relative flex flex-col text-left p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-8 group-hover:rotate-6 transition-transform`}>
              {tool.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{tool.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
