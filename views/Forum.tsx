
import React, { useState, useEffect } from 'react';
import { ForumPost, ForumComment, UserAccount } from '../types';
import { geminiService } from '../services/gemini';

const categories = ['Creative', 'Logic', 'Support', 'Prompt Share'] as const;

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  // New post state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<typeof categories[number]>('Prompt Share');

  useEffect(() => {
    const savedSession = localStorage.getItem('levant_active_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession));

    const savedPosts = localStorage.getItem('levant_forum_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts).map((p: any) => ({ ...p, date: new Date(p.date) })));
    } else {
      // Seed data
      const seed: ForumPost[] = [
        {
          id: '1',
          authorId: 'system',
          authorName: 'Architect',
          title: 'Welcome to the Collective Mind',
          content: 'This space is for sharing your discoveries with Levant AI. Whether it is a beautiful prompt or a logic sequence, share it here.',
          category: 'Support',
          date: new Date(),
          likes: 12,
          comments: []
        },
        {
          id: '2',
          authorId: 'user-2',
          authorName: 'CreativeSoul',
          title: 'Tips for Cyberpunk Portraits',
          content: 'Try adding "volumetric fog" and "high-contrast neon" to your Image Art prompts. The results are stunning!',
          category: 'Prompt Share',
          date: new Date(Date.now() - 3600000),
          likes: 45,
          comments: []
        }
      ];
      setPosts(seed);
      localStorage.setItem('levant_forum_posts', JSON.stringify(seed));
    }
  }, []);

  const savePosts = (updated: ForumPost[]) => {
    setPosts(updated);
    localStorage.setItem('levant_forum_posts', JSON.stringify(updated));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim() || !newContent.trim()) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      title: newTitle,
      content: newContent,
      category: newCategory,
      date: new Date(),
      likes: 0,
      comments: []
    };

    savePosts([post, ...posts]);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleLike = (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    savePosts(updated);
  };

  const generateAISummary = async (post: ForumPost) => {
    setLoadingAI(post.id);
    try {
      const prompt = `Analyze this forum post and its context. Provide a very concise "AI Synthesis" (max 30 words) summarizing the core value or insight of this post.
      Title: ${post.title}
      Content: ${post.content}`;
      
      const summary = await geminiService.generateText(prompt, "Act as an insightful AI analyst.");
      const updated = posts.map(p => p.id === post.id ? { ...p, aiSummary: summary } : p);
      savePosts(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Community Lab</h2>
          <p className="text-slate-500 dark:text-slate-400">Share prompts, results, and insights with the Levant collective.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition transform active:scale-95 text-[10px] uppercase tracking-widest"
        >
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Categories</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs">
                All Discussions
              </button>
              {categories.map(cat => (
                <button key={cat} className="w-full text-left px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10">
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-300 mb-2">Global Feed</h4>
              <p className="text-2xl font-black">{posts.length}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Active Threads</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Post Feed */}
        <div className="lg:col-span-3 space-y-6">
          {isCreating && (
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-600 rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Share with the Collective</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-rose-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="Give it a catchy name..."
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                    <select 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold text-xs"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content</label>
                  <textarea 
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Describe your prompt, result, or thought..."
                    className="w-full h-32 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-blue-700 transition">
                  Publish Post
                </button>
              </form>
            </div>
          )}

          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{post.authorName}</h4>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                      {post.date.toLocaleDateString()} • {post.category}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition group/like"
                >
                  <svg className={`w-4 h-4 ${post.likes > 0 ? 'fill-rose-500 text-rose-500' : ''} group-active/like:scale-150 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  <span className="text-xs font-black">{post.likes}</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{post.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">{post.content}</p>
                
                {post.aiSummary && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl animate-in fade-in slide-in-from-left-4">
                    <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                      AI Neural Synthesis
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{post.aiSummary}"</p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-4">
                  <button 
                    onClick={() => generateAISummary(post)}
                    disabled={!!loadingAI}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 disabled:opacity-50 transition"
                  >
                    {loadingAI === post.id ? (
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                    Generate Insight
                  </button>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px]">
              <div className="text-4xl">🛸</div>
              <p className="font-bold">No signals detected in the lab yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
