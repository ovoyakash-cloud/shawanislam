import React, { useState, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ArrowUp, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, openAdmin } = usePortfolio();

  // 7-clicks secret trigger for footer as well
  const [footerClicks, setFooterClicks] = useState(0);
  const footerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFooterSecretClick = () => {
    if (footerTimerRef.current) {
      clearTimeout(footerTimerRef.current);
    }

    const next = footerClicks + 1;
    if (next >= 7) {
      setFooterClicks(0);
      openAdmin();
    } else {
      setFooterClicks(next);
      footerTimerRef.current = setTimeout(() => {
        setFooterClicks(0);
      }, 2500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              Shawan<span className="text-[#0284C7]">.</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Senior Graphic Designer & Print Specialist · Shyamoly Color Lab & Studio
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a>
            <a href="#resume" className="hover:text-white transition-colors">Resume</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} {data.profile.name}. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Pabna, Bangladesh</span>
            <span className="text-slate-700">·</span>
            
            {/* Discreet secret icon requiring 7 clicks (no suspicious text) */}
            <button
              onClick={handleFooterSecretClick}
              className="p-1 text-slate-700 hover:text-slate-500 transition-colors select-none focus:outline-hidden"
              aria-label="Protected"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
