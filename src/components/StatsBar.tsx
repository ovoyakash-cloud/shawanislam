import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Briefcase, Users, Award, Clock } from 'lucide-react';

export const StatsBar: React.FC = () => {
  const { data } = usePortfolio();

  const stats = [
    {
      value: `${data.profile.experienceYears}+`,
      label: 'Years In Industry',
      sub: 'Continuous since 2012',
      icon: Clock,
    },
    {
      value: `${data.profile.completedProjects}+`,
      label: 'Successful Projects',
      sub: 'Print, Branding & Digital',
      icon: Briefcase,
    },
    {
      value: `${data.profile.satisfiedClients}+`,
      label: 'Satisfied Clients',
      sub: 'Local & Global brands',
      icon: Users,
    },
    {
      value: `${data.profile.designAwards}+`,
      label: 'Design Recognitions',
      sub: 'Prepress & Creativity',
      icon: Award,
    },
  ];

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:border-sky-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                    {item.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
