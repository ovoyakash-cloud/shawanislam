import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CheckCircle2, Award, Briefcase, GraduationCap, Heart, MapPin } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { data } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'mission' | 'vision'>('mission');

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Floating 12+ Years Badge (Direct match to attached image) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-4/3 lg:aspect-3/4 max-w-lg mx-auto border border-slate-100">
              <img
                src={data.profile.aboutPhotoUrl || '/src/assets/images/about_design_studio_1791181942784.jpg'}
                alt="Creative Design Studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/src/assets/images/about_design_studio_1791181942784.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Experience Badge in lower corner (matching design) */}
              <div className="absolute bottom-5 right-5 bg-[#10B981] text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                <span className="text-3xl font-extrabold tracking-tight">
                  {data.profile.experienceYears}+
                </span>
                <div className="text-xs font-semibold leading-tight text-white/95">
                  Years Of<br />Experience
                </div>
              </div>
            </div>

            {/* Quick reference snippet */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0284C7]" />
                <span className="font-semibold text-slate-900">Shyamoly Color Lab & Studio</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>Pabna, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy, Mission/Vision tabs, & CV Points */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
                LEARN ABOUT ME
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Brainstorming Sessions Churning Out Impactful Ideas
              </h2>
            </div>

            <p className="text-base text-slate-600 leading-relaxed">
              {data.profile.aboutText}
            </p>

            {/* Interactive Mission / Vision Segmented Tabs */}
            <div className="space-y-4 pt-2">
              <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`px-5 py-2 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'mission'
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Our Mission
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`px-5 py-2 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'vision'
                      ? 'bg-[#0284C7] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Our Vision
                </button>
              </div>

              {/* Dynamic Mission/Vision copy */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-sm text-slate-700 leading-relaxed">
                {activeTab === 'mission' ? data.profile.mission : data.profile.vision}
              </div>
            </div>

            {/* Key Quality Guarantees (Matching exact design) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0284C7] shrink-0" />
                <span className="text-sm font-medium text-slate-800">
                  Pixel perfect & expertly crafted to print and digital standards
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0284C7] shrink-0" />
                <span className="text-sm font-medium text-slate-800">
                  We love what we do & who we do it for — 100% satisfaction guaranteed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0284C7] shrink-0" />
                <span className="text-sm font-medium text-slate-800">
                  Direct color lab prepress calibration preventing costly offset print errors
                </span>
              </div>
            </div>

            {/* Hobbies / Personal interests tag row */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Personal Interests & Hobbies:
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
                {data.profile.hobbies.map((hobby, index) => (
                  <React.Fragment key={hobby}>
                    <span className="hover:text-[#0284C7] transition-colors">{hobby}</span>
                    {index < data.profile.hobbies.length - 1 && <span className="text-slate-300">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
