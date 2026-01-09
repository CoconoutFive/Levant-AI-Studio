
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState<"1:1" | "4:3" | "16:9">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const imageUrl = await geminiService.generateImage(prompt, ratio);
      setResult(imageUrl);
    } catch (error) {
      console.error(error);
      alert('Image generation failed. Please try a different prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Digital Art Lab</h2>
        <p className="text-slate-500">Transform your imagination into visual reality with Gemini 2.5.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Visual Description</label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with floating gardens, 8k resolution, cinematic lighting..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition text-slate-800 pr-16"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition active:scale-95"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center justify-between border-t border-slate-100 pt-6">
          <div className="space-y-3 w-full sm:w-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aspect Ratio</p>
            <div className="flex gap-2">
              {(['1:1', '4:3', '16:9'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    ratio === r ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="flex items-center text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
                Ultra HD Rendering
             </div>
             <div className="flex items-center text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
                Style Consistency
             </div>
          </div>
        </div>
      </div>

      <div className="relative aspect-square md:aspect-video bg-white border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden group shadow-inner">
        {!result && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="font-medium">The canvas is empty. Start generating brilliance.</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-purple-700 font-bold animate-pulse">Rendering your vision...</p>
            <div className="mt-2 text-xs text-slate-400 max-w-xs text-center">AI is synthesizing millions of data points to generate your unique image.</div>
          </div>
        )}

        {result && (
          <div className="h-full w-full animate-in zoom-in duration-500">
            <img src={result} alt="Generated Art" className="w-full h-full object-contain" />
            <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={result} 
                download="levant-art.png"
                className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-full text-slate-700 hover:text-purple-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
