import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, Globe, Users, 
  Settings, Zap, Calendar, MessageSquare, ShieldCheck,
  MapPin, Clock, Tag, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import api from './services';

export default function LandingPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [blogsRes, eventsRes] = await Promise.all([
          api.get('/blogs/public'),
          api.get('/events/public')
        ]);
        setBlogs(blogsRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        setLoadError('Failed to load public content');
        console.error("Failed to load public feeds");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);
  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">MemberFlow</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold text-stone-500 uppercase tracking-widest">
          <a href="#features" className="hover:text-stone-900 transition-colors">Features</a>
          <a href="#about" className="hover:text-stone-900 transition-colors">About</a>
          <a href="#services" className="hover:text-stone-900 transition-colors">Services</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-sm font-bold hover:text-emerald-600 transition-colors">Sign In</Link>
          <Link to="/register" className="px-5 py-2 bg-stone-900 text-white text-sm font-bold rounded-full hover:bg-stone-800 transition-all active:scale-95 shadow-lg">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-7xl mx-auto text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Globe className="w-3 h-3" /> The Next Generation of Organization Management
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-4xl mx-auto"
        >
          Manage your organization with <span className="text-emerald-500 italic">total clarity.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-stone-500 max-w-2xl mx-auto font-medium"
        >
          Professional multi-tenant registration, advanced ID verification, AI-powered payments, and community engagement—all in one premium platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 pt-4"
        >
          <Link to="/register" className="px-8 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-stone-800 transition-all shadow-2xl flex items-center gap-2 group">
            Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 bg-stone-100 text-stone-900 font-bold rounded-2xl hover:bg-stone-200 transition-all">View Demo</button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Everything you need to scale.</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Built by experts for organizations that demand precision, security, and beauty.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Fayda ID Verification" 
              desc="Real-time national ID registry integration for unmatched member security and trust." 
            />
            <FeatureCard 
              icon={Settings} 
              title="Dynamic Attributes" 
              desc="Customize your member profiles with unique organizational data points instantly." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Telebirr & CBE Birr" 
              desc="Seamless AI-powered payment verification with automated invoice generation." 
            />
            <FeatureCard 
              icon={Calendar} 
              title="Event Management" 
              desc="Coordinate meetings, galas, and events with full RSVP and attendance tracking." 
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="Internal Blogs" 
              desc="Keep your community informed with professional announcements and storytelling." 
            />
            <FeatureCard 
              icon={Users} 
              title="Multi-Org Support" 
              desc="Manage multiple organizations under a single SuperAdmin master control center." 
            />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="px-8 py-32 max-w-7xl mx-auto space-y-16">
        <div className="flex justify-between items-end">
          <div className="space-y-4 text-left">
            <h2 className="text-4xl font-black tracking-tight uppercase">Upcoming Events</h2>
            <p className="text-stone-500 max-w-lg">Join our open community gatherings and networking summits.</p>
          </div>
          <Link to="/register" className="text-sm font-black text-stone-900 border-b-2 border-stone-900 pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-all uppercase tracking-widest">View Full Calendar</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && <div className="col-span-full py-20 text-center text-stone-300 font-bold uppercase tracking-[0.4em]">Loading public events</div>}
          {loadError && !loading && <div className="col-span-full py-20 text-center text-red-400 font-bold uppercase tracking-[0.3em]">{loadError}</div>}
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="bg-white border border-stone-100 p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all space-y-6">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-stone-50 rounded-2xl text-stone-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-stone-400 tracking-widest leading-none">Date</div>
                  <div className="text-sm font-bold text-stone-900">{new Date(event.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">{event.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-2">{event.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
                <MapPin className="w-4 h-4" /> {event.location}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Published Event
                </div>
                <Link to={`/events/${event.id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-900 hover:text-emerald-600">
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
          {!loading && !loadError && events.length === 0 && <div className="col-span-full py-20 text-center text-stone-300 font-bold uppercase tracking-[0.4em]">No public summits scheduled</div>}
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blog" className="px-8 py-32 bg-stone-900 text-white rounded-[4rem] mx-4 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-20 -mt-20" />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">Latest from the Community</h2>
            <p className="text-stone-400 max-w-xl mx-auto">Insights, success stories, and major announcements from MemberFlow organizations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogs.slice(0, 2).map(blog => (
              <div key={blog.id} className="group cursor-pointer space-y-6">
                <div className="aspect-[16/9] bg-stone-800 rounded-3xl overflow-hidden">
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-700">
                    <MessageSquare className="w-12 h-12" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">{blog.category}</span>
                    <span className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{blog.title}</h3>
                  <p className="text-stone-400 leading-relaxed line-clamp-3">{blog.content}</p>
                  <button className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] pt-2 group-hover:text-emerald-400 transition-colors">
                    Read Expansion <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {blogs.length === 0 && <div className="col-span-full py-20 text-center text-stone-700 font-bold uppercase tracking-[0.4em]">Resource library is currently empty</div>}
          </div>
        </div>
      </section>
      <footer className="px-8 py-20 border-t border-stone-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">MemberFlow</span>
          </div>
          <p className="text-sm text-stone-400">© 2026 MemberFlow OMMS. Professional Edition.</p>
          <div className="flex gap-6 text-sm font-bold text-stone-500 uppercase tracking-widest">
            <a href="#" className="hover:text-stone-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-stone-900 transition-colors">System Log</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 bg-white border border-stone-200 rounded-3xl hover:shadow-xl transition-all space-y-6 group">
      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-colors">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="text-stone-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
