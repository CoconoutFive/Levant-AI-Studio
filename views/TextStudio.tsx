
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';

const TextStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const text = await geminiService.generateText(prompt);
      setResult(text || '');
      setHistory(prev => [text || '', ...prev].slice(0, 5));
    } catch (error) {
      console.error(error);
      setResult('An error occurred during generation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Studio</h2>
          <p className="text-slate-500">Draft, refine, and iterate with Gemini 3 Flash.</p>
        </div>
        <button 
          onClick={() => { setPrompt(''); setResult(''); }}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Clear Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a product description for a premium coffee maker..."
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none outline-none text-slate-800"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition shadow-lg ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Thinking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Generate Content
                </>
              )}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Templates</h3>
            <div className="flex flex-wrap gap-2">
              {['Social Media Post', 'Blog Outline', 'Email Reply', 'Code Fix'].map(tpl => (
                <button
                  key={tpl}
                  onClick={() => setPrompt(`Generate a ${tpl} for: `)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-600 transition"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full space-y-4">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Output</span>
              {result && (
                <button 
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
            <div className="p-6 flex-1 overflow-y-auto prose prose-slate max-w-none">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 text-center px-8">
                  <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p>Your AI-generated response will appear here once you hit "Generate".</p>
                </div>
              )}
              {loading && (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                </div>
              )}
              {result && <div className="whitespace-pre-wrap text-slate-800 leading-relaxed animate-in fade-in duration-700">{result}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextStudio;
