
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/gemini';
import { JournalEntry } from '../types';

const WellnessJournal: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('levant_journal_entries');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) })) : [];
  });

  useEffect(() => {
    localStorage.setItem('levant_journal_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      const analysis = await geminiService.analyzeJournalEntry(text);
      
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        text,
        date: new Date(),
        mood: analysis.mood,
        aiFeedback: analysis.feedback
      };

      setEntries([newEntry, ...entries]);
      setText('');
    } catch (error) {
      console.error(error);
      const fallbackEntry: JournalEntry = {
        id: Date.now().toString(),
        text,
        date: new Date(),
        mood: 'Reflective'
      };
      setEntries([fallbackEntry, ...entries]);
      setText('');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Reflection Lab</h2>
          <p className="text-slate-500 dark:text-slate-400">Your AI-enhanced personal sanctuary for growth and clarity.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Privacy Protected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How are you feeling right now?</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Spill your thoughts... no judgment here. Gemini will offer insights if you'd like."
              className="w-full h-48 p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-400 outline-none transition text-slate-800 dark:text-slate-200 leading-relaxed resize-none"
            />
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{text.length} characters</span>
              <button
                onClick={handleSave}
                disabled={loading || !text.trim()}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg transition transform active:scale-95 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Save & Reflect
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Recent Reflections</h3>
            {entries.length === 0 ? (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p>No reflections yet. Start by writing your first entry above.</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">{entry.date.toLocaleDateString()} at {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {entry.mood && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase border border-blue-100 dark:border-blue-800">
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-4">{entry.text}</p>
                  {entry.aiFeedback && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-xs font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>
                        AI Insight
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">"{entry.aiFeedback}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
            <h3 className="text-xl font-bold mb-4 relative z-10">Reflective Mindset</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10">
              Journaling combined with AI feedback can help identify cognitive patterns and emotional trends over time.
            </p>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-bold text-blue-200 uppercase mb-2">Total Reflections</p>
                <p className="text-3xl font-bold">{entries.length}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-bold text-blue-200 uppercase mb-2">Dominant Mood</p>
                <p className="text-3xl font-bold">{entries[0]?.mood || '—'}</p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Prompt Inspiration</h3>
             <div className="space-y-3">
               {[
                 "What made you smile today?",
                 "What is one thing you're proud of?",
                 "Describe a challenge you faced.",
                 "Who are you grateful for right now?"
               ].map((prompt, i) => (
                 <button 
                  key={i}
                  onClick={() => setText(`Prompt: ${prompt}\n\n`)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 transition-colors"
                 >
                   {prompt}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessJournal;
