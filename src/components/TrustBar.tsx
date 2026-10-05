import React from 'react';
import { Palette, Layers, Printer, PenTool, Layout, CheckCircle2 } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const tools = [
    { name: 'Adobe Illustrator', category: 'Expert Level', icon: PenTool },
    { name: 'Adobe Photoshop', category: 'Expert Level', icon: Palette },
    { name: 'Offset Prepress Setup', category: '12+ Years Mastery', icon: Printer },
    { name: 'Adobe InDesign', category: 'Editorial Layout', icon: Layout },
    { name: 'Color Lab Calibration', category: 'Shyamoly Studio', icon: Layers },
    { name: 'Behance Portfolio', category: 'Verified Creator', icon: CheckCircle2 },
  ];

  return (
    <section className="py-10 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            PROVEN TOOLS & PRINT INDUSTRY WORKFLOW
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center">
          {tools.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-sky-50 group-hover:text-[#0284C7] flex items-center justify-center mb-2 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 text-center tracking-tight">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-400 tracking-normal mt-0.5">
                  {t.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
