import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Clock,
  Search,
  Pencil,
  Trash2,
  BellRing,
  Eye,
  List,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services';
import { useAuth } from './AuthContext';

type EventForm = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  imageUrl: string;
  status: 'draft' | 'published' | 'cancelled';
};

const initialForm: EventForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  capacity: 0,
  imageUrl: '',
  status: 'draft',
};

export default function Events() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventForm>(initialForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [activeEventForAttendees, setActiveEventForAttendees] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/events', {
        params: {
          q: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setEvents(res.data || []);
    } catch (_err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const event of events) {
      const day = new Date(event.date).toLocaleDateString();
      const arr = map.get(day) || [];
      arr.push(event);
      map.set(day, arr);
    }
    return Array.from(map.entries());
  }, [events]);

  const startCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const startEdit = (event: any) => {
    setEditingId(event.id);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      capacity: Number(event.capacity || 0),
      imageUrl: event.imageUrl || '',
      status: event.status || 'draft',
    });
    setShowForm(true);
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/events/${editingId}`, formData);
      } else {
        await api.post('/events', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchEvents();
    } catch {
      alert('Failed to save event');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch {
      alert('Failed to delete event');
    }
  };

  const triggerReminder = async (id: string) => {
    try {
      await api.post(`/events/${id}/remind`);
      alert('Reminder triggered for registered attendees');
      fetchEvents();
    } catch {
      alert('Failed to trigger reminder');
    }
  };

  const registerEvent = async (id: string) => {
    try {
      await api.post(`/events/${id}/register`);
      alert('Registration successful');
      fetchEvents();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to register');
    }
  };

  const openAttendees = async (event: any) => {
    setActiveEventForAttendees(event);
    try {
      const res = await api.get(`/events/${event.id}/attendees`);
      setAttendees(res.data || []);
    } catch {
      setAttendees([]);
    }
  };

  const updateAttendeeStatus = async (uid: string, status: string) => {
    if (!activeEventForAttendees) return;
    try {
      await api.patch(`/events/${activeEventForAttendees.id}/attendees/${uid}`, { status });
      const res = await api.get(`/events/${activeEventForAttendees.id}/attendees`);
      setAttendees(res.data || []);
    } catch {
      alert('Failed to update attendee status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-stone-900">Events & RSVP</h2>
          <p className="text-stone-500 mt-1">List, calendar, attendees, reminders, and publish controls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${viewMode === 'list' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
          >
            <List className="w-4 h-4 inline mr-1" /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${viewMode === 'calendar' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
          >
            <Calendar className="w-4 h-4 inline mr-1" /> Calendar
          </button>
          {isAdmin && (
            <button onClick={startCreate} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold text-sm">
              <Plus className="w-4 h-4 inline mr-1" /> Create Event
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, location"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <div className="text-stone-400">Loading events...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && events.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 text-stone-500">No events found.</div>
      )}

      {!loading && !error && events.length > 0 && viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-stone-200 rounded-3xl overflow-hidden">
              {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="w-full h-44 object-cover" /> : null}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <span className="text-[10px] uppercase font-black px-2 py-1 rounded-full bg-stone-100 text-stone-700">{event.status}</span>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{event.description}</p>
                <div className="text-xs text-stone-600 space-y-1">
                  <div><Clock className="w-4 h-4 inline mr-1" /> {new Date(event.date).toLocaleString()}</div>
                  <div><MapPin className="w-4 h-4 inline mr-1" /> {event.location}</div>
                  <div><Users className="w-4 h-4 inline mr-1" /> {event.attendeeCount || event.attendees?.length || 0} / {event.capacity || 'Unlimited'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isAdmin && event.status === 'published' && (
                    <button onClick={() => registerEvent(event.id)} className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white">
                      Register
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => startEdit(event)} className="px-3 py-2 text-xs font-bold rounded-lg bg-stone-100 text-stone-800"><Pencil className="w-4 h-4 inline mr-1" />Edit</button>
                      <button onClick={() => deleteEvent(event.id)} className="px-3 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4 inline mr-1" />Delete</button>
                      <button onClick={() => triggerReminder(event.id)} className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-50 text-amber-700"><BellRing className="w-4 h-4 inline mr-1" />Reminder</button>
                      <button onClick={() => openAttendees(event)} className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700"><UserCheck className="w-4 h-4 inline mr-1" />Attendees</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && events.length > 0 && viewMode === 'calendar' && (
        <div className="space-y-4">
          {groupedByDay.map(([day, dayEvents]) => (
            <div key={day} className="bg-white border border-stone-200 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">{day}</div>
              <div className="space-y-2">
                {dayEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">{event.title}</p>
                      <p className="text-xs text-stone-500">{event.location}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-stone-500">{event.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl">
              <h3 className="text-2xl font-black mb-5">{editingId ? 'Edit Event' : 'Create Event'}</h3>
              <form onSubmit={saveEvent} className="space-y-3">
                <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Title" />
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3 h-24" placeholder="Description" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="datetime-local" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" />
                  <input required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Location" />
                  <input type="number" min={0} value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Capacity" />
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full border border-stone-200 rounded-xl p-3">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full border border-stone-200 rounded-xl p-3" placeholder="Image URL (optional)" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeEventForAttendees && (
          <div className="fixed inset-0 bg-stone-900/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">Attendees: {activeEventForAttendees.title}</h3>
                <button onClick={() => setActiveEventForAttendees(null)} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold">Close</button>
              </div>
              {attendees.length === 0 ? (
                <div className="text-sm text-stone-500">No attendees yet.</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-auto">
                  {attendees.map((att) => (
                    <div key={att.uid} className="p-3 border border-stone-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">{att.fullName}</p>
                        <p className="text-xs text-stone-500">{att.email}</p>
                      </div>
                      <select value={att.status} onChange={(e) => updateAttendeeStatus(att.uid, e.target.value)} className="text-xs border border-stone-200 rounded-lg px-2 py-1">
                        <option value="registered">Registered</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="attended">Attended</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
