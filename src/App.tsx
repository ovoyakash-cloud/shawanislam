/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { AboutSection } from './components/AboutSection';
import { StatsBar } from './components/StatsBar';
import { SkillsSection } from './components/SkillsSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CVSection } from './components/CVSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CVDownloadModal } from './components/CVDownloadModal';
import { AdminModal } from './components/admin/AdminModal';
import { Project } from './types/portfolio';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-1">
          <Hero onOpenCvModal={() => setIsCvModalOpen(true)} />
          <TrustBar />
          <AboutSection />
          <StatsBar />
          <SkillsSection />
          <ServicesSection />
          <ProjectsSection onSelectProject={(p) => setSelectedProject(p)} />
          <CVSection onOpenCvModal={() => setIsCvModalOpen(true)} />
          <ContactSection />
        </main>

        {/* Footer */}
        <Footer />

        {/* Modals & Hidden Panels */}
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
        <CVDownloadModal
          isOpen={isCvModalOpen}
          onClose={() => setIsCvModalOpen(false)}
        />
        <AdminModal />
      </div>
    </PortfolioProvider>
  );
}
