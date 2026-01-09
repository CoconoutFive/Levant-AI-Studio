
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
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
  expression: 'Friendly' | 'Determined' | 'Cheerful' | 'Calm';
  style: '3D Pixar-style' | 'Cyberpunk' | 'Minimalist Vector' | 'Sketch';
  outfit: 'Business Suit' | 'Tech Hoodie' | 'Futuristic Armor' | 'Smart Casual';
  outfitColor: string;
  background: 'High-tech Office' | 'Neon City' | 'Zen Garden' | 'Abstract Geometric';
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem('levant_avatar_url'));
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeTab, setActiveTab] = useState<'anatomy' | 'style'>('anatomy');
  
  const [settings, setSettings] = useState<AvatarSettings>(() => {
    const saved = localStorage.getItem('levant_avatar_settings');
    return saved ? JSON.parse(saved) : {
      gender: 'male',
      skinTone: '#F5C6A5',
      eyeColor: '#4A3728',
      eyeShape: 'Almond',
      noseShape: 'Straight',
      mouthStyle: 'Friendly Smile',
      hairStyle: 'Short & Stylish',
      facialHair: 'None',
      accessories: 'None',
      expression: 'Friendly',
      style: '3D Pixar-style',
      outfit: 'Business Suit',
      outfitColor: '#0F172A', // Slate 900
      background: 'High-tech Office'
    };
  });

  useEffect(() => {
    localStorage.setItem('levant_avatar_settings', JSON.stringify(settings));
  }, [settings]);

  const generateAvatar = async () => {
    setIsGeneratingAvatar(true);
    try {
      const prompt = `A professional ${settings.style} ${settings.gender} character named Levant. 
      Physical Details:
      - Skin color: HEX ${settings.skinTone} tone.
      - Eyes: ${settings.eyeShape} shape, ${settings.eyeColor} color.
      - Nose: ${settings.noseShape} shape.
      - Mouth: ${settings.mouthStyle}.
      - Hair: ${settings.hairStyle}.
      - Facial Hair: ${settings.facialHair}.
      - Expression: ${settings.expression}.
      - Accessories: ${settings.accessories !== 'None' ? `Wearing ${settings.accessories}` : 'No accessories'}.
      Attire: Wearing a ${settings.outfitColor} ${settings.outfit}. 
      Environment: ${settings.background} background. 
      Lighting: Soft cinematic lighting, 8k resolution, professional 3D character design, highly detailed textures.`;
      
      const url = await geminiService.generateImage(prompt, "1:1");
      setAvatarUrl(url);
      localStorage.setItem('levant_avatar_url', url);
      setShowCustomizer(false);
    } catch (error) {
      console.error("Failed to generate avatar:", error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const skinTones = [
    { color: '#F5C6A5', label: 'Fair' },
    { color: '#E0AC69', label: 'Honey' },
    { color: '#8D5524', label: 'Deep' },
    { color: '#C68642', label: 'Tan' },
    { color: '#FFDBAC', label: 'Pale' },
  ];

  const eyeColors = [
    { color: '#4A3728', label: 'Brown' },
    { color: '#2E536F', label: 'Blue' },
    { color: '#3D642D', label: 'Green' },
    { color: '#707070', label: 'Grey' },
    { color: '#A97040', label: 'Hazel' },
  ];

  const outfitColors = [
    { color: '#0F172A', label: 'Midnight' },
    { color: '#2563EB', label: 'Royal' },
    { color: '#DC2626', label: 'Crimson' },
    { color: '#16A34A', label: 'Emerald' },
    { color: '#F8FAFC', label: 'Arctic' },
  ];

  const OptionGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        {children}
      </div>
    </div>
  );

  const tools = [
    { id: AppView.TEXT_STUDIO, title: 'Content Generator', description: 'Draft articles, code, and summaries.', color: 'bg-blue-500', icon: '✍️' },
    { id: AppView.IMAGE_STUDIO, title: 'Art Studio', description: 'High-fidelity visual assets.', color: 'bg-purple-500', icon: '🎨' },
    { id: AppView.VOICE_STUDIO, title: 'Voice Synthesizer', description: 'Natural, expressive human speech.', color: 'bg-rose-500', icon: '🎙️' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome to Levant</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Unleash the power of professional AI. Your personalized workspace is ready to transform ideas into reality.
          </p>
          <button 
            onClick={() => setView(AppView.WELLNESS)}
            className="mt-4 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
          >
            <span>🧘</span> Reflection Lab
          </button>
        </div>

        {/* Avatar Card */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-xl flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48 rounded-[40px] bg-slate-50 dark:bg-slate-950 overflow-hidden border-2 border-blue-500/10 shadow-inner group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Levant Avatar" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex items-center justify-center h-full text-5xl grayscale opacity-30">👤</div>
              )}
              {isGeneratingAvatar && (
                <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-xl flex flex-col items-center justify-center text-white">
                  <svg className="animate-spin h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Encoding DNA...</span>
                </div>
              )}
            </div>
            
            {!showCustomizer ? (
              <div className="w-full space-y-4">
                <div className="text-center">
                  <h4 className="font-black text-slate-900 dark:text-white text-xl">Identity Node</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Active Representation</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={generateAvatar}
                    disabled={isGeneratingAvatar}
                    className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-2xl hover:opacity-90 transition active:scale-[0.97] text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {avatarUrl ? 'Regenerate' : 'Deploy Avatar'}
                  </button>
                  <button 
                    onClick={() => setShowCustomizer(true)}
                    className="p-4 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-2xl transition"
                    title="Customize"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tighter">Character Creator</h5>
                  <button onClick={() => setShowCustomizer(false)} className="text-slate-400 hover:text-slate-600 transition p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['anatomy', 'style'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar text-left pb-2">
                  {activeTab === 'anatomy' ? (
                    <>
                      <OptionGroup label="Gender & Identity">
                        <div className="flex gap-2">
                          {['male', 'female', 'neutral'].map(g => (
                            <button 
                              key={g}
                              onClick={() => setSettings({...settings, gender: g as any})}
                              className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition ${settings.gender === g ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}
                            >
                              {g.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </OptionGroup>

                      <OptionGroup label="Complexion">
                        <div className="flex gap-2 justify-between px-1">
                          {skinTones.map(st => (
                            <button 
                              key={st.color}
                              onClick={() => setSettings({...settings, skinTone: st.color})}
                              className={`w-8 h-8 rounded-full border-2 transition transform hover:scale-110 ${settings.skinTone === st.color ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent'}`}
                              style={{ backgroundColor: st.color }}
                              title={st.label}
                            />
                          ))}
                        </div>
                      </OptionGroup>

                      <div className="grid grid-cols-2 gap-3">
                         <OptionGroup label="Eye Shape">
                            <select 
                              value={settings.eyeShape} 
                              onChange={(e) => setSettings({...settings, eyeShape: e.target.value as any})}
                              className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                            >
                              <option value="Almond">Almond</option>
                              <option value="Round">Round</option>
                              <option value="Narrow">Narrow</option>
                              <option value="Wide">Wide</option>
                            </select>
                         </OptionGroup>
                         <OptionGroup label="Eye Color">
                            <div className="flex gap-1 items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-2 h-[34px]">
                               {eyeColors.map(ec => (
                                 <button 
                                  key={ec.color}
                                  onClick={() => setSettings({...settings, eyeColor: ec.color})}
                                  className={`w-4 h-4 rounded-full border transition ${settings.eyeColor === ec.color ? 'ring-2 ring-blue-500 border-white' : 'border-transparent'}`}
                                  style={{ backgroundColor: ec.color }}
                                  title={ec.label}
                                 />
                               ))}
                            </div>
                         </OptionGroup>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <OptionGroup label="Nose Shape">
                           <select 
                             value={settings.noseShape} 
                             onChange={(e) => setSettings({...settings, noseShape: e.target.value as any})}
                             className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                           >
                             <option value="Button">Button</option>
                             <option value="Straight">Straight</option>
                             <option value="Aquiline">Aquiline</option>
                             <option value="Broad">Broad</option>
                           </select>
                        </OptionGroup>
                        <OptionGroup label="Facial Hair">
                           <select 
                             value={settings.facialHair} 
                             onChange={(e) => setSettings({...settings, facialHair: e.target.value as any})}
                             className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                           >
                             <option value="None">None</option>
                             <option value="Stubble">Stubble</option>
                             <option value="Full Beard">Full Beard</option>
                             <option value="Goatee">Goatee</option>
                             <option value="Clean Shaven">Clean Shaven</option>
                           </select>
                        </OptionGroup>
                      </div>

                      <OptionGroup label="Hair & Mouth">
                         <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={settings.hairStyle} 
                              onChange={(e) => setSettings({...settings, hairStyle: e.target.value as any})}
                              className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                            >
                              <option value="Short & Stylish">Stylish Short</option>
                              <option value="Long & Wavy">Wavy Long</option>
                              <option value="Buzz Cut">Buzz Cut</option>
                              <option value="Professional Bun">Sleek Bun</option>
                              <option value="Curly Afro">Curly Afro</option>
                              <option value="Bald">Bald</option>
                            </select>
                            <select 
                              value={settings.mouthStyle} 
                              onChange={(e) => setSettings({...settings, mouthStyle: e.target.value as any})}
                              className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                            >
                              <option value="Friendly Smile">Smile</option>
                              <option value="Neutral">Neutral</option>
                              <option value="Open Smile">Open</option>
                              <option value="Subtle Smirk">Smirk</option>
                            </select>
                         </div>
                      </OptionGroup>
                    </>
                  ) : (
                    <>
                      <OptionGroup label="Art Style">
                        <select 
                          value={settings.style} 
                          onChange={(e) => setSettings({...settings, style: e.target.value as any})}
                          className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                        >
                          <option value="3D Pixar-style">Pixar 3D</option>
                          <option value="Cyberpunk">Cyberpunk</option>
                          <option value="Minimalist Vector">Vector</option>
                          <option value="Sketch">Sketch</option>
                        </select>
                      </OptionGroup>

                      <OptionGroup label="Clothing & Color">
                         <div className="grid grid-cols-2 gap-2">
                            <select 
                              value={settings.outfit} 
                              onChange={(e) => setSettings({...settings, outfit: e.target.value as any})}
                              className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                            >
                              <option value="Business Suit">Executive Suit</option>
                              <option value="Tech Hoodie">Cyber Hoodie</option>
                              <option value="Futuristic Armor">Exosuit</option>
                              <option value="Smart Casual">Casual</option>
                            </select>
                            <div className="flex gap-1 items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-2">
                               {outfitColors.map(oc => (
                                 <button 
                                  key={oc.color}
                                  onClick={() => setSettings({...settings, outfitColor: oc.color})}
                                  className={`w-4 h-4 rounded-full border transition ${settings.outfitColor === oc.color ? 'ring-2 ring-blue-500 border-white' : 'border-transparent'}`}
                                  style={{ backgroundColor: oc.color }}
                                  title={oc.label}
                                 />
                               ))}
                            </div>
                         </div>
                      </OptionGroup>

                      <OptionGroup label="Accessories">
                        <select 
                          value={settings.accessories} 
                          onChange={(e) => setSettings({...settings, accessories: e.target.value as any})}
                          className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                        >
                          <option value="None">None</option>
                          <option value="Modern Glasses">Glasses</option>
                          <option value="Futuristic Visor">Visor</option>
                          <option value="Tech Headset">Headset</option>
                          <option value="Earrings">Studs</option>
                        </select>
                      </OptionGroup>

                      <OptionGroup label="Environment">
                        <select 
                          value={settings.background} 
                          onChange={(e) => setSettings({...settings, background: e.target.value as any})}
                          className="w-full py-2 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-700 dark:text-slate-300"
                        >
                          <option value="High-tech Office">Tech HQ</option>
                          <option value="Neon City">Neo City</option>
                          <option value="Zen Garden">Zen Garden</option>
                          <option value="Abstract Geometric">Abstract</option>
                        </select>
                      </OptionGroup>
                    </>
                  )}
                </div>

                <button 
                  onClick={generateAvatar}
                  disabled={isGeneratingAvatar}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition transform active:scale-[0.98] text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30"
                >
                  {isGeneratingAvatar ? 'Synthesizing...' : 'Apply & Sync'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
              Initialize
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        ))}
      </div>

      {/* Slimmer Footer Section */}
      <div className="bg-slate-900 dark:bg-black rounded-3xl p-6 text-white border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Core</span>
              <span className="text-sm font-bold tracking-tight">Gemini 3.0 Enterprise</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="hidden lg:flex gap-3">
              {['128K Context', 'Zero-Latency', 'Native Vision'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-500/20">
             <span className="text-blue-500 animate-pulse">⚡</span>
             <span className="text-[10px] font-black text-blue-400 tracking-widest">SYSTEM_OPTIMIZED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
