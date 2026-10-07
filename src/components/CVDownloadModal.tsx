import React, { useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { X, Download, Printer, Phone, Mail, MapPin, Globe, CheckCircle2 } from 'lucide-react';

interface CVDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CVDownloadModal: React.FC<CVDownloadModalProps> = ({ isOpen, onClose }) => {
  const { data } = usePortfolio();
  const cvPrintRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDirectDownload = () => {
    if (data.profile.cvPdfUrl) {
      const link = document.createElement('a');
      link.href = data.profile.cvPdfUrl;
      link.download = data.profile.cvFileName || 'Md_Shawan_Islam_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Curriculum Vitae Preview — {data.profile.name}
            </h3>
            {data.profile.cvPdfUrl && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Custom PDF Attached
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{data.profile.cvPdfUrl ? 'Download PDF File' : 'Save as PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area - Stylized to match the exact 2-page CV attached by user */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={cvPrintRef}
            className="bg-white w-full max-w-[800px] p-8 sm:p-12 shadow-md rounded-lg text-slate-800 space-y-8 print:p-0 print:shadow-none print:max-w-none"
          >
            
            {/* Header: Photo + Name + Contacts (Page 1 Header) */}
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-between pb-6 border-b-2 border-slate-200">
              <div className="flex gap-5 items-center">
                <img
                  src={data.profile.photoUrl || '/src/assets/images/hero_designer_portrait_1791181928056.jpg'}
                  alt={data.profile.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-sky-500 shadow-xs"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0284C7] tracking-tight">
                    {data.profile.name}
                  </h1>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    {data.profile.roleTitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {data.profile.address}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{data.profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{data.profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{data.profile.behanceUrl}</span>
                </div>
              </div>
            </div>

            {/* Career Objective */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-widest text-[#0284C7] uppercase border-b border-sky-100 pb-1">
                Career Objective
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                {data.profile.bio}
              </p>
            </div>

            {/* Work Experience */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-[#0284C7] uppercase border-b border-sky-100 pb-1">
                Work Experience
              </h2>
              {data.experience.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.role} — {exp.company}</span>
                    <span className="text-[#0284C7]">{exp.period}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{exp.location}</div>
                  <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Computer Skills & Capabilities */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-[#0284C7] uppercase border-b border-sky-100 pb-1">
                Computer Skills & Technical Competencies
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                    <span className="text-slate-800">{s.name} ({s.proficiency}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-[#0284C7] uppercase border-b border-sky-100 pb-1">
                Education
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-slate-500 text-[11px]">Board: {edu.board} · {edu.group}</div>
                    <div className="text-[#0284C7] font-semibold mt-1">Result: {edu.result} (Passed {edu.passingYear})</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-[#0284C7] uppercase border-b border-sky-100 pb-1">
                Personal Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Father's Name:</span>
                  <span className="font-semibold text-slate-800">{data.profile.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Mother's Name:</span>
                  <span className="font-semibold text-slate-800">{data.profile.motherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth:</span>
                  <span className="font-semibold text-slate-800">{data.profile.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Marital Status:</span>
                  <span className="font-semibold text-slate-800">{data.profile.maritalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nationality:</span>
                  <span className="font-semibold text-slate-800">{data.profile.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group:</span>
                  <span className="font-bold text-[#0284C7]">{data.profile.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Reference & Declaration */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-800">
                Reference: {data.references[0]?.name} ({data.references[0]?.designation}) — Phone: {data.references[0]?.phone}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Declaration: I hereby declare that all the information provided in this CV is true, accurate, and complete to the best of my knowledge and belief.
              </p>
              <div className="flex justify-end pt-4">
                <div className="text-right">
                  <div className="font-script text-lg text-slate-800 font-bold italic underline decoration-sky-400">
                    {data.profile.name}
                  </div>
                  <div className="text-[11px] text-slate-500">Authorized Signature</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
