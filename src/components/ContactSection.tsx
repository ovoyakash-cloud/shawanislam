import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare, Facebook, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactSection: React.FC = () => {
  const { data, sendMessage } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await sendMessage(formData);
      setLoading(false);
      setSuccess(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 7000);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Failed to send message. Please try again or email directly.');
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Contact Info & Value Prop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#0284C7] uppercase">
                GET IN TOUCH
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Let's Discuss Your Next Creative Project
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Available for full brand identities, commercial offset print runs, product packaging, and creative social media design. Feel free to contact directly or leave a message.
            </p>

            <div className="space-y-4 pt-4">
              <a
                href={`tel:${data.profile.phone}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Direct Phone / WhatsApp</div>
                  <div className="text-sm font-bold text-slate-900 font-mono">{data.profile.phone}</div>
                </div>
              </a>

              <a
                href={`mailto:${data.profile.email}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Official Email Address</div>
                  <div className="text-sm font-bold text-slate-900">{data.profile.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Studio & Location</div>
                  <div className="text-sm font-bold text-slate-900">{data.profile.address}</div>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 flex items-center gap-3">
              {data.profile.facebookUrl && (
                <a
                  href={data.profile.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Facebook Profile</span>
                </a>
              )}
              {data.profile.behanceUrl && (
                <a
                  href={data.profile.behanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#0284C7]" />
                  <span>Behance Portfolio</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0284C7]" />
              <h3 className="text-lg font-bold text-slate-900">Send an Inquiry</h3>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Message Delivered Successfully!</h4>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Thank you for reaching out. Your message has been saved in the inbox and Shawan will reply shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Your Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Project Subject / Service Needed</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Brand Identity System or Packaging Box Design"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Message / Project Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your requirements, timeline, and goals..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
