import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Project } from '../types/portfolio';
import { ExternalLink, Eye, ArrowUpRight } from 'lucide-react';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const { data } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const categories = [
    'All',
    'Brand Identity',
    'Print & Packaging',
    'Social Media',
    'Photo Retouching',
    'Vector & Illustration',
  ];

  const filteredProjects = activeFilter === 'All'
    ? data.projects
    : data.projects.filter(p => p.category === activeFilter);

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
            SELECTED PORTFOLIO & RECENT WORKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Crafted With Precision & Creative Excellence
          </h2>
          <p className="text-sm text-slate-600">
            A curated showcase of brand identities, offset print publications, high-converting social media creatives, and packaging designs.
          </p>
        </div>

        {/* Filter Tabs (Interactive Filter Controls conforming to constitution) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeFilter === category
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/images/project_brand_identity_1791181954785.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="p-3 bg-white text-slate-900 rounded-full hover:bg-sky-50 hover:text-[#0284C7] transition-all transform translate-y-2 group-hover:translate-y-0"
                      title="View Case Study"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white text-slate-900 rounded-full hover:bg-sky-50 hover:text-[#0284C7] transition-all transform translate-y-2 group-hover:translate-y-0"
                        title="View on Behance"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0284C7]">{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.client}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{project.year}</span>
                  </div>

                  <h3
                    onClick={() => onSelectProject(project)}
                    className="text-base font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors cursor-pointer leading-snug"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Tools row */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  {project.tools.slice(0, 2).join(' · ')}
                </div>
                <button
                  onClick={() => onSelectProject(project)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1]"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Behance CTA */}
        <div className="mt-14 text-center">
          <a
            href={data.profile.behanceUrl || 'https://www.behance.net/shawonislam4'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <span>View Full Portfolio on Behance</span>
            <ExternalLink className="w-4 h-4 text-[#0284C7]" />
          </a>
        </div>

      </div>
    </section>
  );
};
