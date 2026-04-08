import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from './services';
import { useAuth } from './AuthContext';

export default function PublicEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/public/${id}`);
        setEvent(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!event) return;
    setSubmitting(true);
    try {
      await api.post(`/events/${event.id}/register`);
      const res = await api.get(`/events/public/${event.id}`);
      setEvent(res.data);
      alert('Registration successful');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-stone-50 p-10 text-center text-stone-400">Loading event...</div>;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-stone-50 p-10">
        <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-3xl p-8">
          <p className="text-red-600 text-sm font-bold">{error || 'Event not found'}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-stone-700">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <section className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden shadow-sm">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-72 object-cover" />
          ) : (
            <div className="h-72 bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-700" />
          )}

          <div className="p-8 md:p-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                  {event.status}
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{event.title}</h1>
                <p className="max-w-3xl text-stone-600 leading-relaxed">{event.description}</p>
              </div>

              {user ? (
                <button
                  onClick={handleRegister}
                  disabled={submitting || (event.remainingCapacity !== null && event.remainingCapacity <= 0)}
                  className="px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              ) : (
                <Link to="/login" className="px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold text-center">
                  Sign In to Register
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailCard icon={Calendar} label="Date" value={new Date(event.date).toLocaleDateString()} />
              <DetailCard icon={Clock} label="Time" value={new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              <DetailCard icon={MapPin} label="Location" value={event.location} />
              <DetailCard
                icon={Users}
                label="Attendance"
                value={`${event.attendeeCount || 0}${typeof event.capacity === 'number' && event.capacity > 0 ? ` / ${event.capacity}` : ''}`}
              />
            </div>

            {event.remainingCapacity !== null && (
              <div className="text-sm text-stone-500">
                Remaining capacity: <span className="font-bold text-stone-900">{event.remainingCapacity}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-center gap-2 text-stone-400 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-stone-900">{value}</p>
    </div>
  );
}
