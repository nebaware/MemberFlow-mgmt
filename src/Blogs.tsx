import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Tag, User, Calendar, Search, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';
import { useAuth } from './AuthContext';

type BlogForm = {
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
};

const initialForm: BlogForm = {
  title: '',
  content: '',
  category: 'General',
  status: 'draft',
};

export default function Blogs() {
  const { isAdmin } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogForm>(initialForm);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/blogs', {
        params: {
          q: q || undefined,
          category: category || undefined,
          status: status || undefined,
        },
      });
      setBlogs(res.data || []);
    } catch {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBlogs();
    }, 250);
    return () => clearTimeout(timeout);
  }, [q, category, status]);

  const startCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowEditor(true);
  };

  const startEdit = (blog: any) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      category: blog.category || 'General',
      status: blog.status || 'draft',
    });
    setShowEditor(true);
  };

  const saveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/blogs/${editingId}`, formData);
      } else {
        await api.post('/blogs', formData);
      }
      setShowEditor(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchBlogs();
    } catch {
      alert('Failed to save blog post');
    }
  };

  const deleteBlog = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch {
      alert('Failed to delete post');
    }
  };

  const changeStatus = async (id: string, nextStatus: string) => {
    try {
      await api.patch(`/blogs/${id}`, { status: nextStatus });
      fetchBlogs();
    } catch {
      alert('Failed to change status');
    }
  };

  const categories = ['General', 'Urgent', 'Update', 'Event Info'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-stone-900">Announcements & Blog</h2>
          <p className="text-stone-500 mt-1">Draft/publish workflow, categories, filters, and author metadata.</p>
        </div>
        {isAdmin && (
          <button onClick={startCreate} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold text-sm">
            <Plus className="w-4 h-4 inline mr-1" /> New Post
          </button>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title/content" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-stone-200 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-stone-200 text-sm">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-stone-400">Loading posts...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && blogs.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 text-stone-500">No posts found.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <motion.div key={blog.id} layout className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-stone-100 text-stone-600 uppercase font-black tracking-wider">
                  <Tag className="w-3 h-3" /> {blog.category || 'General'}
                </span>
                <h3 className="text-xl font-bold text-stone-900">{blog.title}</h3>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${blog.status === 'published' ? 'bg-emerald-100 text-emerald-700' : blog.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'}`}>
                {blog.status || (blog.isPublic ? 'published' : 'draft')}
              </span>
            </div>
            <p className="text-sm text-stone-600 line-clamp-4">{blog.content}</p>

            <div className="text-xs text-stone-500 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><User className="w-3 h-3 inline mr-1" /> {blog.authorName || 'Org Administrator'}</div>
              <div><Calendar className="w-3 h-3 inline mr-1" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleString()}</div>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => startEdit(blog)} className="px-3 py-2 text-xs font-bold rounded-lg bg-stone-100 text-stone-800"><Pencil className="w-4 h-4 inline mr-1" />Edit</button>
                <button onClick={() => deleteBlog(blog.id)} className="px-3 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4 inline mr-1" />Delete</button>
                <button onClick={() => changeStatus(blog.id, 'draft')} className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-50 text-amber-700">Move to Draft</button>
                <button onClick={() => changeStatus(blog.id, 'published')} className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700">Publish</button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl">
              <h3 className="text-2xl font-black mb-5">{editingId ? 'Edit Post' : 'Create Post'}</h3>
              <form onSubmit={saveBlog} className="space-y-3">
                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Title" />
                <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3 h-40" placeholder="Content" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full border border-stone-200 rounded-xl p-3">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
