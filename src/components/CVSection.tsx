import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Download, FileText, Briefcase, GraduationCap, User, Phone, Mail, MapPin, Award, CheckCircle2 } from 'lucide-react';

interface CVSectionProps {
  onOpenCvModal: () => void;
}

export const CVSection: React.FC<CVSectionProps> = ({ onOpenCvModal }) => {
  const { data } = usePortfolio();

  const handleDownload = () => {
    if (data.profile.cvPdfUrl) {
      // If admin uploaded a custom PDF, trigger download
      const link = document.createElement('a');
      link.href = data.profile.cvPdfUrl;
      link.download = data.profile.cvFileName || 'Md_Shawan_Islam_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open interactive printable CV modal
      onOpenCvModal();
    }
  };

  return (
    <section id="resume" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
              CURRICULUM VITAE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verified Experience & Professional Credentials
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Complete career background, technical qualifications, and personal credentials documented in official format.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-xl transition-all shadow-xs hover:shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download CV (PDF)</span>
            </button>
            <button
              onClick={onOpenCvModal}
              className="inline-flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-[#0284C7]" />
              <span>Preview Full CV</span>
            </button>
          </div>
        </div>

        {/* 2-Column CV Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Work Experience & Education */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Work Experience */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Work Experience</h3>
                  <p className="text-xs text-slate-500">12+ Years of continuous commercial practice</p>
                </div>
              </div>

              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-sky-400">
                    <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#0284C7] ring-4 ring-sky-100" />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900">{exp.role}</h4>
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold text-[#0284C7] bg-sky-50 rounded-md">
                        {exp.period}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">
                      {exp.company}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      {exp.location}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Academic Background</h3>
                  <p className="text-xs text-slate-500">Certified academic achievements</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                    <div className="text-xs font-bold text-[#0284C7]">{edu.degree}</div>
                    <div className="text-xs font-semibold text-slate-800">{edu.institution}</div>
                    <div className="text-[11px] text-slate-500">Board: {edu.board} · {edu.group}</div>
                    <div className="text-xs font-mono font-bold text-slate-700 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Result: {edu.result}</span>
                      <span>Passed {edu.passingYear}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Personal Details & References */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Personal Details from CV */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Details</h3>
                  <p className="text-xs text-slate-500">Official CV records</p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-400 font-medium">Full Name</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{data.profile.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Date of Birth</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{data.profile.dateOfBirth}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Father's Name</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{data.profile.fatherName}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Mother's Name</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{data.profile.motherName}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Nationality</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{data.profile.nationality}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-medium">Blood Group</dt>
                  <dd className="font-semibold text-[#0284C7] mt-0.5 font-mono">{data.profile.bloodGroup}</dd>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-medium">Permanent & Present Address</dt>
                  <dd className="font-medium text-slate-700 mt-0.5">{data.profile.address}</dd>
                </div>
              </dl>
            </div>

            {/* References from CV */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Professional Reference</h3>
                  <p className="text-xs text-slate-500">Industry verification contact</p>
                </div>
              </div>

              {data.references.map((ref) => (
                <div key={ref.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{ref.name}</div>
                  <div className="text-[#0284C7] font-semibold">{ref.designation}</div>
                  <div className="flex items-center gap-2 text-slate-600 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ref.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ref.address}</span>
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
