import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Globe, Users, Settings, Zap, Calendar, 
  MessageSquare, ShieldCheck, MapPin, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from './services';

export default function LandingPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load public feeds");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      
      {/* 1. ANIMATED BACKGROUND GLOWS  */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-black w-5 h-5 fill-black" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">MemberFlow</span>
          </div>
          <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
            <a href="#features" className="hover:text-emerald-400 transition-all">Features</a>
            <a href="#events" className="hover:text-emerald-400 transition-all">Events</a>
            <a href="#blog" className="hover:text-emerald-400 transition-all">Community</a>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-5 py-2 text-sm font-bold text-stone-400 hover:text-white transition-all">Sign In</Link>
            <Link to="/register" className="px-6 py-2.5 bg-white text-black text-xs font-black rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-32 max-w-7xl mx-auto text-center space-y-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Globe className="w-3.5 h-3.5" /> Next Gen Organization Management
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] max-w-5xl mx-auto"
        >
          Manage with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-stone-500">Total Clarity.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-stone-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Professional multi-tenant registration, advanced ID verification, and AI-powered payments—all in one premium platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-6 pt-4"
        >
          <Link to="/register" className="px-10 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all flex items-center gap-3 group">
            Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-10 py-5 bg-stone-900 border border-white/10 text-white font-black rounded-2xl hover:bg-stone-800 transition-all">View Demo</button>
        </motion.div>
      </section>

      {/* Features Grid - FIXED & ENHANCED */}
      <section id="features" className="px-8 py-40 bg-[#080808] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl font-black tracking-tight uppercase">Everything you need to scale.</h2>
            <p className="text-stone-500 max-w-xl mx-auto">Built by experts for organizations that demand precision and beauty.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard icon={ShieldCheck} title="Fayda ID" desc="Real-time national ID registry integration for unmatched member security." delay={0.1} />
            <FeatureCard icon={Settings} title="Dynamic Attributes" desc="Customize your member profiles with unique data points instantly." delay={0.2} />
            <FeatureCard icon={Zap} title="AI Payments" desc="Seamless AI-powered verification for Telebirr and CBE Birr." delay={0.3} />
            <FeatureCard icon={Calendar} title="Events" desc="Coordinate meetings and galas with full RSVP and attendance tracking." delay={0.4} />
            <FeatureCard icon={MessageSquare} title="Community" desc="Keep members informed with professional announcements and blogs." delay={0.5} />
            <FeatureCard icon={Users} title="Multi-Tenant" desc="Manage multiple organizations under a single SuperAdmin center." delay={0.6} />
          </div>
        </div>
      </section>

      {/* Events Section - List Style for Better Spacing */}
      <section id="events" className="px-8 py-40 max-w-7xl mx-auto space-y-16">
        <div className="flex justify-between items-end border-l-4 border-emerald-500 pl-8">
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase">Upcoming Events</h2>
            <p className="text-stone-500">Join our community gatherings and summits.</p>
          </div>
          <Link to="/register" className="text-xs font-black text-emerald-500 uppercase tracking-widest border-b-2 border-emerald-500/20 pb-1 hover:border-emerald-500 transition-all">View Full Calendar</Link>
        </div>

        <div className="grid gap-4">
          {events.length > 0 ? events.map((event) => (
            <motion.div key={event.id} whileHover={{ x: 10 }} className="p-10 bg-stone-900/20 border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-center group hover:bg-stone-900/40 transition-all">
              <div className="flex items-center gap-8">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400"><Calendar /></div>
                <div>
                  <h3 className="text-2xl font-black group-hover:text-emerald-400 transition-colors">{event.title}</h3>
                  <p className="text-stone-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</p>
                </div>
              </div>
              <Link to={`/events/${event.id}`} className="mt-6 md:mt-0 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-white transition-all">
                View Details <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )) : <div className="py-20 text-center text-stone-700 font-black uppercase tracking-widest">No scheduled events</div>}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-500 w-6 h-6 fill-emerald-500" />
            <span className="text-xl font-black tracking-tighter uppercase">MemberFlow</span>
          </div>
          <p className="text-xs text-stone-600 font-bold uppercase tracking-widest">© 2026 MemberFlow  • Professional Edition</p>
          <div className="flex gap-8 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">System Log</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group relative p-10 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] hover:border-emerald-500/50 hover:bg-[#0f0f0f] transition-all duration-500"
    >
      <div className="relative w-16 h-16 mb-8 bg-stone-900 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-emerald-500/50 group-hover:-translate-y-2 transition-all duration-500">
        <Icon className="text-emerald-400 w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-stone-500 leading-relaxed font-medium group-hover:text-stone-400 transition-colors">{desc}</p>
      <div className="absolute bottom-6 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </motion.div>
  );
}