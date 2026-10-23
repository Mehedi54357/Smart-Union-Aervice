import React from 'react';
import { MapPin, User, Globe, Phone, ShieldCheck, Users, Eye } from 'lucide-react';
import { VisitorStats } from '@/lib/types';

interface HeaderProps {
  visitorStats?: VisitorStats;
}

export default function Header({ visitorStats }: HeaderProps) {
  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-800 shadow-lg">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center text-xs md:text-sm gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-emerald-900 text-emerald-200 px-3 py-1 rounded-full font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            গোপালগঞ্জ জেলা ➔ কাশিয়ানী উপজেলা ➔ রাতইল ইউনিয়ন পরিষদ
          </span>
          <span className="inline-flex items-center gap-1.5 bg-teal-950/80 text-teal-200 px-3 py-1 rounded-full font-mono">
            <Globe className="w-3.5 h-3.5 text-teal-300" />
            munsurunionservice.com
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-emerald-100 font-medium">
            <User className="w-3.5 h-3.5 text-amber-300" />
            পরিচালনায়: <strong className="text-white font-bold">মোঃ মনসুর হোসেন</strong>
          </span>
          <a
            href="tel:+8801571214406"
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-full shadow text-xs transition"
          >
            <Phone className="w-3.5 h-3.5" />
            +880 1571-214406
          </a>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-emerald-900/80 flex flex-col md:flex-row justify-between items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-0.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            রাতইল ইউনিয়ন পরিষদ ডিজিটাল সেবা কেন্দ্র
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Munsur Union Service
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
          {/* Visitor Counter Badge */}
          {visitorStats && (
            <div className="flex items-center gap-2 bg-emerald-900/80 border border-emerald-600/50 px-3.5 py-1.5 rounded-xl shadow-inner backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ভিজিটর:
                </span>
                <span
                  title="সর্বমোট ভিজিট সংখ্যা"
                  className="bg-emerald-950 font-mono font-bold text-white px-2 py-0.5 rounded-md border border-emerald-700/60"
                >
                  মোট {visitorStats.totalVisits}
                </span>
                <span
                  title="আলাদা ইউনিক ভিজিটর"
                  className="bg-teal-950 font-mono font-bold text-teal-200 px-2 py-0.5 rounded-md border border-teal-700/60"
                >
                  ইউনিক {visitorStats.uniqueVisitors}
                </span>
                <span
                  title="আজকের ভিজিটর সংখ্যা"
                  className="bg-amber-950/80 font-mono font-bold text-amber-300 px-2 py-0.5 rounded-md border border-amber-600/40"
                >
                  আজ {visitorStats.todayVisits}
                </span>
              </div>
            </div>
          )}

          <div className="bg-emerald-900/60 border border-emerald-700/60 px-4 py-2 rounded-xl text-center md:text-right">
            <p className="text-xs text-emerald-200">সার্ভিস মোবাইল: <strong className="text-amber-300 font-mono font-bold text-sm">+880 1571-214406</strong></p>
          </div>
        </div>
      </div>
    </header>
  );
}

