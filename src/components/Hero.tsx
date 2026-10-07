import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ArrowRight, Download, CheckCircle, Mail, Sparkles, Award } from 'lucide-react';

interface HeroProps {
  onOpenCvModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCvModal }) => {
  const { data, sendMessage } = usePortfolio();
  const [quickEmail, setQuickEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail || !quickEmail.includes('@')) return;
    setLoading(true);
    await sendMessage({
      name: 'Quick Inquirer',
      email: quickEmail,
      subject: 'Quick Consultation Request from Hero',
      message: `User entered email ${quickEmail} requesting consultation.`,
    });
    setLoading(false);
    setSubmitted(true);
    setQuickEmail('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="home" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white">
      {/* Subtle decorative background circles resembling the reference design */}
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Proposition & Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Subtle blue kicker */}
            <div className="inline-flex items-center gap-2">
              <span className="h-0.5 w-6 bg-[#0284C7]" />
              <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
                {data.profile.kicker || 'ONE OF THE BEST DESIGN SOLUTIONS'}
              </span>
            </div>

            {/* Prominent Designer Name */}
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-semibold text-slate-500">I am</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0284C7] tracking-tight">
                Shawan Islam
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              {data.profile.tagline || 'Creating High-Impact Brand Identities & Print Solutions'}
            </h1>

            {/* Bio prose */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {data.profile.bio}
            </p>

            {/* Quick Conversion Box - Exactly like the reference layout */}
            <div className="pt-2">
              {submitted ? (
                <div className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Thank you! Shawan will get back to you shortly.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleQuickLead}
                  className="flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 bg-white rounded-xl shadow-xs border border-slate-200/90 max-w-xl"
                >
                  <div className="relative flex-1 w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-all shadow-xs hover:shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending...' : 'Get Started'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick Badges / Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenCvModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#0284C7]" />
                <span>View & Download CV (PDF)</span>
              </button>

              <a
                href="#portfolio"
                className="text-xs font-semibold text-slate-600 hover:text-[#0284C7] transition-colors"
              >
                Explore Selected Works →
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <span>12+ Years at Shyamoly Color Lab</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0284C7]" />
                <span>850+ Projects Completed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Portrait with Layered Radial Rings as in Attached Reference */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              
              {/* Outer soft light blue ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-100/90 via-sky-50/70 to-blue-100/90 scale-100 border border-sky-200/50" />
              
              {/* Mid concentric ring */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-b from-sky-200/60 to-blue-300/40 scale-95" />
              
              {/* Inner concentric ring */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-[#0284C7]/20 to-sky-100/80" />

              {/* Designer Portrait Image with crisp cut-out styling */}
              <div className="relative z-10 w-[90%] h-[95%] rounded-b-full overflow-hidden flex items-end justify-center shadow-lg border-b-4 border-white/60">
                <img
                  src={data.profile.photoUrl || '/src/assets/images/hero_designer_portrait_1791181928056.jpg'}
                  alt={data.profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback container in case of any external broken link
                    (e.target as HTMLImageElement).src = '/src/assets/images/hero_designer_portrait_1791181928056.jpg';
                  }}
                />
              </div>

              {/* Floating verified badge */}
              <div className="absolute bottom-4 left-0 z-20 bg-white/95 backdrop-blur-xs py-2 px-3.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#0284C7]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Md. Shawan Islam</div>
                  <div className="text-[10px] text-slate-500 font-medium">Graphic Designer & Prepress</div>
                </div>
              </div>

              {/* Floating Experience Badge */}
              <div className="absolute top-8 right-0 z-20 bg-white/95 backdrop-blur-xs py-2 px-3 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-800">Available for Projects</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
