import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const SkillsSection: React.FC = () => {
  const { data } = usePortfolio();

  return (
    <section id="experience" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual representation matching reference layout */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 aspect-4/3 relative group">
              <img
                src="/src/assets/images/about_design_studio_1791181942784.jpg"
                alt="Creative Skill Studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-sky-300">
                  Daily Workflow at Shyamoly Color Lab
                </span>
                <h3 className="text-lg font-bold">
                  Pre-Press Preparation, Color Separation & Design Execution
                </h3>
              </div>
            </div>

            {/* Quick language proficiency meter */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {data.profile.languages.map((lang) => (
                <div key={lang} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <div className="text-xs font-bold text-slate-800">{lang.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500">{lang.includes('Native') ? 'Native' : 'Fluent'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Skill Bars matching attached screenshot */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
                PROFESSIONAL CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Mastery in Creative Tools & Print Production
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              With over 12 years of hands-on experience handling high-volume offset printing, vector brand assets, and creative marketing campaigns, my skills ensure both artistic flair and rigorous technical precision.
            </p>

            {/* Progress Bars */}
            <div className="space-y-5 pt-2">
              {data.skills.map((skill) => (
                <div key={skill.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-800">{skill.name}</span>
                    <span className="text-[#0284C7] font-mono tabular-nums">{skill.proficiency}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0284C7] to-sky-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
