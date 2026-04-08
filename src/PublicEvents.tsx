import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from './services';

export default function PublicEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/events/public');
        setEvents(res.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = events.filter((e: any) => `${e.title} ${e.description} ${e.location}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black tracking-tight uppercase">Public Events</h1>
            <p className="text-stone-500 mt-2 max-w-2xl">Browse published events. Sign in to register.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events..." className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        {loading && <div className="py-16 text-center text-stone-400 font-bold uppercase tracking-widest">Loading events...</div>}
        {error && !loading && <div className="py-16 text-center text-red-600 font-bold">{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="py-16 text-center text-stone-400 font-bold uppercase tracking-widest">No published events</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event: any) => (
            <Link key={event.id} to={`/events/${event.id}`} className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
              {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="w-full h-44 object-cover" /> : <div className="h-44 bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-700" />}
              <div className="p-6 space-y-3">
                <h2 className="text-xl font-black tracking-tight">{event.title}</h2>
                <p className="text-sm text-stone-600 line-clamp-2">{event.description}</p>
                <div className="text-xs font-bold text-stone-500 space-y-1">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleString()}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
