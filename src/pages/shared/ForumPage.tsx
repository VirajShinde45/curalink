import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { ChatBubbleLeftRightIcon, PlusIcon, UserCircleIcon, ClockIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface Thread {
  id: string;
  title: string;
  category: string;
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
  reply_count: number;
  last_activity: string;
}

interface Post {
  id: string;
  thread_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_role: string;
  created_at: string;
}

export default function ForumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [replying, setReplying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Form states
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState('general');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'trials', label: 'Clinical Trials' },
    { value: 'research', label: 'Research Topics' },
    { value: 'support', label: 'Patient Support' },
    { value: 'collaboration', label: 'Collaboration' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    loadThreads();
  }, [user, selectedCategory]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('forum_thread')
        .select(`
          id,
          title,
          category,
          author_id,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      const { data: threadsData, error: threadsError } = await query;
      
      if (threadsError) throw threadsError;
      
      // Get author info and reply counts
      const enrichedThreads = await Promise.all(
        (threadsData || []).map(async (thread) => {
          // Get author info
          const { data: userData } = await supabase
            .from('user_profile')
            .select('full_name, user_type')
            .eq('user_id', thread.author_id)
            .single();
          
          // Count replies
          const { count } = await supabase
            .from('forum_post')
            .select('id', { count: 'exact', head: true })
            .eq('thread_id', thread.id);
          
          return {
            ...thread,
            author_name: userData?.full_name || 'Anonymous',
            author_role: userData?.user_type || 'user',
            reply_count: count || 0,
            last_activity: thread.updated_at
          };
        })
      );
      
      setThreads(enrichedThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_post')
        .select(`
          id,
          thread_id,
          content,
          author_id,
          created_at
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Get author info for each post
      const enrichedPosts = await Promise.all(
        (data || []).map(async (post) => {
          const { data: userData } = await supabase
            .from('user_profile')
            .select('full_name, user_type')
            .eq('user_id', post.author_id)
            .single();
          
          return {
            ...post,
            author_name: userData?.full_name || 'Anonymous',
            author_role: userData?.user_type || 'user'
          };
        })
      );
      
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThreadTitle.trim() || !newThreadContent.trim()) return;
    
    try {
      setCreating(true);
      
      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('forum_thread')
        .insert({
          title: newThreadTitle.trim(),
          category: newThreadCategory,
          author_id: user.id
        })
        .select()
        .single();
      
      if (threadError) throw threadError;
      
      // Create first post
      const { error: postError } = await supabase
        .from('forum_post')
        .insert({
          thread_id: thread.id,
          content: newThreadContent.trim(),
          author_id: user.id
        });
      
      if (postError) throw postError;
      
      // Reset form and reload
      setNewThreadTitle('');
      setNewThreadContent('');
      setNewThreadCategory('general');
      await loadThreads();
      alert('Thread created successfully!');
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const createReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedThread || !replyContent.trim()) return;
    
    try {
      setReplying(true);
      
      const { error } = await supabase
        .from('forum_post')
        .insert({
          thread_id: selectedThread.id,
          content: replyContent.trim(),
          author_id: user.id
        });
      
      if (error) throw error;
      
      // Update thread's updated_at
      await supabase
        .from('forum_thread')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedThread.id);
      
      // Reset form and reload
      setReplyContent('');
      await loadPosts(selectedThread.id);
      await loadThreads();
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setReplying(false);
    }
  };

  const selectThread = (thread: Thread) => {
    setSelectedThread(thread);
    loadPosts(thread.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && threads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary" />
                Community Forum
              </h1>
              <p className="mt-2 text-gray-600">Connect, discuss, and collaborate with the community</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-2">
            {/* Create Thread Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <button
                onClick={() => {
                  const form = document.getElementById('create-thread-form');
                  form?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Start New Discussion
              </button>
            </div>

            {/* Thread List */}
            <div className="space-y-4">
              {threads.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No discussions yet. Start the first one!</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => selectThread(thread)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedThread?.id === thread.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{thread.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <UserCircleIcon className="h-4 w-4" />
                            {thread.author_name}
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                              thread.author_role === 'researcher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {thread.author_role}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {formatDate(thread.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                            {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {thread.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create Thread Form */}
            <div id="create-thread-form" className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Start New Discussion</h2>
              <form onSubmit={createThread} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="What would you like to discuss?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.filter(c => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Thread'}
                </button>
              </form>
            </div>
          </div>

          {/* Thread View */}
          <div className="lg:col-span-1">
            {selectedThread ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedThread.title}</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {selectedThread.category}
                  </span>
                </div>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {posts.map((post) => (
                    <div key={post.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{post.author_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          post.author_role === 'researcher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {post.author_role}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{post.content}</p>
                      <span className="text-xs text-gray-500">{formatDate(post.created_at)}</span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={createReply} className="border-t border-gray-200 pt-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm mb-2"
                    required
                  />
                  <button
                    type="submit"
                    disabled={replying}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {replying ? 'Posting...' : 'Post Reply'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center sticky top-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a thread to view the discussion</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
