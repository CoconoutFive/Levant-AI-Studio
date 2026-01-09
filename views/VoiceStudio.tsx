
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/gemini';

const VoiceStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const audioContextRef = useRef<AudioContext | null>(null);

  const voices = [
    { name: 'Kore', label: 'Balanced & Clear', gender: 'Female' },
    { name: 'Puck', label: 'Friendly & Casual', gender: 'Male' },
    { name: 'Tristan', label: 'Deep & Authoritative', gender: 'Male' },
    { name: 'Fenrir', label: 'Warm & Natural', gender: 'Female' },
    { name: 'Zephyr', label: 'Soft & Atmospheric', gender: 'Female' },
  ];

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const base64 = await geminiService.generateSpeech(text, selectedVoice);
      await playAudio(base64);
    } catch (error) {
      console.error(error);
      alert('Speech synthesis failed.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    // Decoding helper implementation
    const decode = (b64: string) => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };

    const data = decode(base64);
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    setPlaying(true);
    source.onended = () => setPlaying(false);
    source.start();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Voice Synthesis Lab</h2>
          <p className="text-slate-500 mt-2">Next-gen human-sounding neural voices.</p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse"></span>
                24kHz Hi-Fi Output
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-4">Input Script</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want the AI to speak. For best results, use punctuation and emotional cues..."
              className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-400 outline-none transition text-lg text-slate-800 leading-relaxed resize-none"
            />
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Character count: {text.length}</span>
              <button
                onClick={handleSynthesize}
                disabled={loading || !text.trim()}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition transform active:scale-95 ${
                  loading ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Synthesize & Play
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Voice Profiles</h3>
            <div className="space-y-3">
              {voices.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setSelectedVoice(v.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    selectedVoice === v.name ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="text-left">
                    <p className={`font-bold ${selectedVoice === v.name ? 'text-rose-700' : 'text-slate-800'}`}>{v.name}</p>
                    <p className="text-xs text-slate-500">{v.label}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    selectedVoice === v.name ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-slate-200 border-transparent text-slate-500'
                  }`}>
                    {v.gender}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <h3 className="font-bold mb-2">Voice Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Neural TTS delivers expressive prosody and natural pauses based on context.</p>
            <div className="flex items-center gap-1">
               {[1,2,3,4,5,6,7,8,9,10].map(i => (
                 <div 
                   key={i} 
                   className={`w-1 bg-rose-500 rounded-full ${playing ? 'animate-bounce' : 'h-2'}`}
                   style={{ 
                     height: playing ? `${Math.random() * 20 + 10}px` : '4px',
                     animationDelay: `${i * 0.1}s`,
                     animationDuration: '0.6s'
                   }}
                 ></div>
               ))}
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-600/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudio;
