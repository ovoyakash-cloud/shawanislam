import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Service } from '../types/portfolio';
import { Sparkles, Package, Printer, Image as ImageIcon, ArrowRight, Check, X } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const { data } = usePortfolio();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getServiceIcon = (iconName: string, idx: number) => {
    switch (idx) {
      case 0:
        return { icon: Sparkles, bg: 'bg-purple-50 text-purple-600', active: 'border-purple-200' };
      case 1:
        return { icon: Package, bg: 'bg-[#0284C7] text-white shadow-md shadow-sky-200', active: 'border-sky-300' };
      case 2:
        return { icon: Printer, bg: 'bg-amber-50 text-amber-600', active: 'border-amber-200' };
      default:
        return { icon: ImageIcon, bg: 'bg-emerald-50 text-emerald-600', active: 'border-emerald-200' };
    }
  };

  return (
    <section id="services" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with CTA button on right (Matching image) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
              HOW CAN WE HELP?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Special Outstanding Services For Your Brand
            </h2>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors shadow-xs shrink-0 self-start md:self-auto"
          >
            <span>Request Custom Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Cards Grid - Exactly matching design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.services.map((service, idx) => {
            const style = getServiceIcon(service.iconName, idx);
            const Icon = style.icon;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#0284C7] transition-colors leading-snug">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6">
                    {service.description}
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0284C7] transition-colors pt-4 border-t border-slate-100 w-full"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">
              {selectedService.category}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
              {selectedService.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {selectedService.description}
            </p>

            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Deliverables & Specifications:
              </h4>
              <div className="space-y-2">
                {selectedService.deliverables.map((deliv, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#contact"
                onClick={() => setSelectedService(null)}
                className="flex-1 text-center py-2.5 px-4 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
              >
                Inquire About This Service
              </a>
              <button
                onClick={() => setSelectedService(null)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
