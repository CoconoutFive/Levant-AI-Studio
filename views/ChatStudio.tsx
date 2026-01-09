
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { PersonalityType, UserAccount } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  hasAudio?: boolean;
  image?: string;
}

const personalityMetadata: Record<PersonalityType, { icon: string; greeting: string; subtitle: string }> = {
  Guardian: { 
    icon: '🧘', 
    greeting: 'Todo está en calma. Aquí ando para cuando quieras soltar algo.', 
    subtitle: 'Human Presence' 
  },
  Muse: { 
    icon: '🎨', 
    greeting: 'The canvas of conversation awaits your colorful thoughts. What inspires you today?', 
    subtitle: 'Creative Spirit' 
  },
  Architect: { 
    icon: '📐', 
    greeting: 'Session initialized. I am prepared to assist with logical structuring and high-fidelity reasoning.', 
    subtitle: 'Logical Framework' 
  },
  Sentinel: { 
    icon: '⚡', 
    greeting: 'Standing by. Awaiting your directive for maximum efficiency.', 
    subtitle: 'Direct Efficiency' 
  }
};

const ChatStudio: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [personality, setPersonality] = useState<PersonalityType>('Architect');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Camera states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('levant_active_session');
    let initialPersonality: PersonalityType = 'Architect';
    if (savedSession) {
      initialPersonality = JSON.parse(savedSession).settings?.personality || 'Architect';
    }
    setPersonality(initialPersonality);
    chatRef.current = geminiService.createChat(initialPersonality);

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const updateSessionPersonality = (newP: PersonalityType) => {
    const savedSession = localStorage.getItem('levant_active_session');
    if (!savedSession) return;
    
    const session: UserAccount = JSON.parse(savedSession);
    const updatedUser = { 
      ...session, 
      settings: { ...session.settings, personality: newP } 
    };
    
    setPersonality(newP);
    localStorage.setItem('levant_active_session', JSON.stringify(updatedUser));
    
    const accounts = JSON.parse(localStorage.getItem('levant_accounts') || '[]');
    const idx = accounts.findIndex((a: any) => a.id === session.id);
    if (idx !== -1) {
      accounts[idx] = updatedUser;
      localStorage.setItem('levant_accounts', JSON.stringify(accounts));
    }

    chatRef.current = geminiService.createChat(newP);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent sending
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendAudio = async (blob: Blob) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: '[Voice Message]', hasAudio: true }]);

    try {
      const base64 = await blobToBase64(blob);
      const audioPart = {
        inlineData: {
          mimeType: 'audio/webm',
          data: base64
        }
      };

      const result = await chatRef.current.sendMessage({ 
        message: [audioPart, { text: "Listen to this audio and respond naturally based on your personality." }] 
      });
      
      const modelText = result.text || '';
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      if (autoVoice) {
        speak(modelText);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Perdí la conexión un segundo... ¿podrías repetirme eso?' }]);
      chatRef.current = geminiService.createChat(personality); 
    } finally {
      setLoading(false);
    }
  };

  const speak = async (text: string) => {
    try {
      const voiceMap: Record<PersonalityType, string> = {
        Architect: 'Tristan',
        Muse: 'Zephyr',
        Guardian: 'Fenrir',
        Sentinel: 'Kore'
      };
      const base64 = await geminiService.generateSpeech(text, voiceMap[personality]);
      await playAudio(base64);
    } catch (e) {
      console.error("Speech synthesis failed", e);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
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
    source.start();
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !capturedImage) || loading) return;

    const userMessage = input.trim() || (capturedImage ? "[Image]" : "");
    const currentImage = capturedImage;
    
    setInput('');
    setCapturedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: currentImage || undefined }]);
    setLoading(true);

    try {
      let result;
      if (currentImage) {
        const imageBase64 = currentImage.split(',')[1];
        const imagePart = {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        };
        result = await chatRef.current.sendMessage({ 
          message: [imagePart, { text: userMessage || "What is in this image?" }] 
        });
      } else {
        result = await chatRef.current.sendMessage({ message: userMessage });
      }

      const modelText = result.text || '';
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      if (autoVoice) {
        speak(modelText);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Perdí la conexión un segundo... pero ya volví.' }]);
      chatRef.current = geminiService.createChat(personality); 
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4 animate-in fade-in duration-700">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:scale-110 duration-500`}>
            {personalityMetadata[personality].icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Levant IA</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">{personalityMetadata[personality].subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['Guardian', 'Muse', 'Architect', 'Sentinel'] as PersonalityType[]).map((p) => (
              <button
                key={p}
                onClick={() => updateSessionPersonality(p)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  personality === p 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
                title={`Switch to ${p}`}
              >
                {personalityMetadata[p].icon} {p}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

          <button 
            onClick={() => setAutoVoice(!autoVoice)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              autoVoice 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
            }`}
          >
            {autoVoice ? 'Voice Active' : 'Enable Voice'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.982 5.982 0 0115 10a5.982 5.982 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
          </button>
          
          <button 
            onClick={() => setMessages([])}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar px-2"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[40px] flex items-center justify-center text-4xl shadow-inner animate-in zoom-in duration-1000">
              {personalityMetadata[personality].icon}
            </div>
            <div className="space-y-1 max-w-sm px-6">
              <p className="font-bold text-slate-900 dark:text-white text-lg">
                {personalityMetadata[personality].greeting}
              </p>
              <p className="text-xs uppercase tracking-widest font-black text-blue-500 pt-2">Presence: {personality}</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-700`}
          >
            <div className={`max-w-[85%] sm:max-w-[70%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 px-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {msg.role === 'user' ? 'Tú' : 'Levant'}
                </span>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => speak(msg.text)} 
                    className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-11 4a1 1 0 11-2 0 1 1 0 012 0zm5-1a1 1 0 11-2 0 1 1 0 012 0zm3.293-7.707a1 1 0 010 1.414L13.414 11l1.879 1.879a1 1 0 01-1.414 1.414L12 12.414l-1.879 1.879a1 1 0 01-1.414-1.414L10.586 11l-1.879-1.879a1 1 0 011.414-1.414L12 9.586l1.879-1.879a1 1 0 011.414 0z" /></svg>
                  </button>
                )}
              </div>
              <div className={`px-6 py-4 rounded-[28px] text-[15px] leading-relaxed transition-all shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 dark:bg-slate-800 text-white' 
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
              }`}>
                {msg.hasAudio && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 opacity-70">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Voice Recorded</span>
                  </div>
                )}
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="max-w-full rounded-2xl mb-3 border border-white/20 shadow-lg" />
                )}
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-in fade-in duration-500">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 px-2">Processing...</span>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-[28px] flex gap-1.5">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Preview Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-2 border-blue-500/50">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
              <button 
                onClick={stopCamera}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button 
                onClick={takePhoto}
                className="w-20 h-20 bg-white rounded-full border-8 border-slate-300 hover:border-blue-400 transition-all flex items-center justify-center shadow-2xl"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-slate-900"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas for photo capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="px-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative w-32 h-32 group">
            <img src={capturedImage} className="w-full h-full object-cover rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl" />
            <button 
              onClick={() => setCapturedImage(null)}
              className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Field & Recording UI */}
      <div className="relative pt-2 shrink-0 group">
        {isRecording ? (
          <div className="flex items-center justify-between w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-[32px] shadow-2xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-black text-rose-500 tabular-nums">{formatDuration(recordingDuration)}</span>
              </div>
              <div className="flex gap-1 h-4 items-center">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-1 bg-rose-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={cancelRecording}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={stopRecording}
                className="px-6 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
              >
                Stop & Send
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={personality === 'Guardian' ? "Dime lo que sea, aquí ando..." : "Talk to me..."}
              className="w-full pl-8 pr-44 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all shadow-2xl text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                type="button"
                onClick={startCamera}
                disabled={loading}
                className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition transform active:scale-90 border border-slate-100 dark:border-slate-700"
                title="Take Picture"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button 
                type="button"
                onClick={startRecording}
                disabled={loading}
                className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition transform active:scale-90 border border-slate-100 dark:border-slate-700"
                title="Record Audio"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
              </button>
              <button 
                type="submit"
                disabled={(!input.trim() && !capturedImage) || loading}
                className="p-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-black dark:hover:bg-blue-700 disabled:opacity-20 disabled:grayscale transition transform active:scale-90 shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatStudio;
