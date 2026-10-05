import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, Service, SkillItem, WorkExperience, EducationItem } from '../../types/portfolio';
import {
  X, Lock, Shield, Image, FileText, FolderPlus, KeyRound, Database,
  Mail, Check, Trash2, Edit3, Plus, RefreshCw, Upload, Eye, ExternalLink,
  Save, AlertCircle, Copy, CheckCheck, RotateCcw, Activity
} from 'lucide-react';
import { SUPABASE_SQL_SETUP, isValidHttpUrl } from '../../lib/supabase';

export const AdminModal: React.FC = () => {
  const {
    data,
    messages,
    isAdminOpen,
    isAuthenticated,
    isSyncing,
    supabaseConfig,
    closeAdmin,
    verifyPin,
    resetPinToDefault,
    logoutAdmin,
    changePin,
    updateProfile,
    updatePhoto,
    updateAboutPhoto,
    updateCvPdf,
    addProject,
    updateProject,
    deleteProject,
    updateServices,
    updateSkills,
    updateExperience,
    updateEducation,
    markMessageAsRead,
    deleteMessage,
    syncWithSupabase,
    testConnection,
    updateSupabaseSettings,
    resetSupabaseSettings,
    resetSection,
    resetToDefaults,
  } = usePortfolio();

  // Authentication state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinResetNotice, setPinResetNotice] = useState('');

  // Active tab inside authenticated admin
  type AdminTab = 'profile' | 'projects' | 'cv' | 'services_skills' | 'messages' | 'pin' | 'supabase';
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');

  // Profile Form State
  const [profileForm, setProfileForm] = useState(data.profile);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Sync profile form when data changes
  useEffect(() => {
    setProfileForm(data.profile);
  }, [data.profile]);

  // New Project Form State
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>({
    title: '',
    category: 'Brand Identity',
    client: '',
    year: new Date().getFullYear().toString(),
    imageUrl: '',
    description: '',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    link: 'https://www.behance.net/shawonislam4',
    featured: true,
  });
  const [toolInput, setToolInput] = useState('');

  // PIN Change State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');

  // Supabase Custom Config State
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(supabaseConfig.url);
  const [customSupabaseAnonKey, setCustomSupabaseAnonKey] = useState(supabaseConfig.anonKey);
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setCustomSupabaseUrl(supabaseConfig.url);
    setCustomSupabaseAnonKey(supabaseConfig.anonKey);
  }, [supabaseConfig]);

  // Sync state
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isAdminOpen) return null;

  // Handle PIN Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pinInput)) {
      setPinError('');
      setPinResetNotice('');
      setPinInput('');
    } else {
      setPinError('Incorrect Admin PIN. Please check or use default (1234).');
    }
  };

  const handleResetPinClick = () => {
    resetPinToDefault();
    setPinInput('1234');
    setPinError('');
    setPinResetNotice('Admin PIN has been reset to default "1234". Click "Unlock Dashboard" to log in.');
  };

  // Handle PIN Change
  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinSuccessMsg('');
    setPinChangeError('');

    if (newPin !== confirmPin) {
      setPinChangeError('New PINs do not match.');
      return;
    }

    const res = changePin(oldPin, newPin);
    if (res.success) {
      setPinSuccessMsg('PIN successfully updated! Remember your new PIN for future logins.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinChangeError(res.error || 'Failed to update PIN.');
    }
  };

  // Handle Image File Upload (converts file to Base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'about' | 'project') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === 'hero') {
        updatePhoto(result);
        setProfileForm(prev => ({ ...prev, photoUrl: result }));
      } else if (target === 'about') {
        updateAboutPhoto(result);
        setProfileForm(prev => ({ ...prev, aboutPhotoUrl: result }));
      } else if (target === 'project') {
        setProjectForm(prev => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle CV PDF File Upload
  const handleCvPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('PDF file is too large. Please select a file under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      updateCvPdf(result, file.name);
      setProfileForm(prev => ({ ...prev, cvPdfUrl: result, cvFileName: file.name }));
      alert(`CV PDF "${file.name}" uploaded successfully! Visitors can now download it directly.`);
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 4000);
  };

  // Handle Project Submit
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.imageUrl) {
      alert('Please provide at least a project title and an image (upload or URL).');
      return;
    }

    if (editingProjectId) {
      updateProject(editingProjectId, projectForm);
      setEditingProjectId(null);
    } else {
      addProject(projectForm);
    }

    setIsAddingProject(false);
    setProjectForm({
      title: '',
      category: 'Brand Identity',
      client: '',
      year: new Date().getFullYear().toString(),
      imageUrl: '',
      description: '',
      tools: ['Adobe Illustrator', 'Adobe Photoshop'],
      link: 'https://www.behance.net/shawonislam4',
      featured: true,
    });
  };

  const handleEditProjectClick = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      category: p.category,
      client: p.client,
      year: p.year,
      imageUrl: p.imageUrl,
      description: p.description,
      tools: p.tools,
      link: p.link || '',
      featured: p.featured ?? true,
    });
    setIsAddingProject(true);
  };

  const handleAddTool = () => {
    if (!toolInput.trim()) return;
    setProjectForm(prev => ({
      ...prev,
      tools: [...prev.tools, toolInput.trim()],
    }));
    setToolInput('');
  };

  const handleRemoveTool = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  // Handle Supabase Settings Save
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseSaveMsg(null);
    const res = updateSupabaseSettings(customSupabaseUrl, customSupabaseAnonKey);
    if (res.success) {
      setSupabaseSaveMsg({ type: 'success', text: 'Supabase URL & Key updated and applied successfully!' });
      setTimeout(() => setSupabaseSaveMsg(null), 5000);
    } else {
      setSupabaseSaveMsg({ type: 'error', text: res.error || 'Failed to update Supabase configuration.' });
    }
  };

  const handleResetSupabaseConfig = () => {
    if (confirm('Reset Supabase configuration back to initial project credentials?')) {
      resetSupabaseSettings();
      setSupabaseSaveMsg({ type: 'success', text: 'Reset Supabase credentials to initial default values.' });
      setTimeout(() => setSupabaseSaveMsg(null), 4000);
    }
  };

  const handleTestSupabaseConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    const res = await testConnection(customSupabaseUrl, customSupabaseAnonKey);
    setIsTestingConn(false);
    setTestResult(res);
  };

  // Handle Supabase Sync
  const handleManualSync = async () => {
    setSyncMessage(null);
    const res = await syncWithSupabase();
    if (res.success) {
      setSyncMessage({ type: 'success', text: res.message });
    } else {
      setSyncMessage({ type: 'error', text: res.message });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Site Admin & Content Management</span>
                {isAuthenticated && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                    Authenticated
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                Connected to Supabase ({supabaseConfig.url.replace('https://', '').split('.')[0]})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Lock Panel
              </button>
            )}
            <button
              onClick={closeAdmin}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: PIN Login View with PIN Recovery */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center border border-sky-100 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Protected Admin Portal</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Enter your 4-digit security PIN to update photos, CV files, projects, content, and Supabase database.
              </p>
            </div>

            {pinResetNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 text-left">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pinResetNotice}</span>
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Admin PIN"
                  className="w-full text-center text-2xl tracking-[0.3em] font-mono py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0284C7] focus:bg-white transition-all"
                />
                {pinError && (
                  <p className="text-xs text-red-600 mt-2 font-medium">{pinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                Unlock Dashboard
              </button>

              <div className="pt-2 flex flex-col items-center gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 w-full text-center">
                  Default PIN is <strong className="font-mono text-slate-800 font-bold">1234</strong>.
                </div>

                {/* Instant PIN reset button if mistake was made */}
                <button
                  type="button"
                  onClick={handleResetPinClick}
                  className="text-xs text-[#0284C7] hover:text-[#0369A1] hover:underline font-semibold flex items-center gap-1.5 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Made a mistake or forgot PIN? Reset PIN to 1234</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Image className="w-4 h-4 shrink-0" />
                <span>Hero & Photos</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'projects' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <FolderPlus className="w-4 h-4 shrink-0" />
                <span>Upload & Manage Projects</span>
              </button>

              <button
                onClick={() => setActiveTab('cv')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'cv' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>CV PDF & Credentials</span>
              </button>

              <button
                onClick={() => setActiveTab('services_skills')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'services_skills' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>Services & Skills</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'messages' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Inquiries & Inbox</span>
                </div>
                {messages.filter(m => !m.read).length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {messages.filter(m => !m.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('pin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'pin' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Change Admin PIN</span>
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'supabase' ? 'bg-[#0284C7] text-white' : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Supabase Settings & Sync</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              
              {/* TAB 1: HERO & PHOTOS */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Hero Section, Photos & Profile Info</h3>
                      <p className="text-xs text-slate-500">Update your hero portrait, about photo, titles, and bio text.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset profile, headlines, and photos back to initial CV values?')) {
                          resetSection('profile');
                          alert('Profile restored to original CV values!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Profile to Original CV</span>
                    </button>
                  </div>

                  {profileSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Profile information updated successfully!</span>
                    </div>
                  )}

                  {/* Photo Update Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    
                    {/* Main Portrait */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 block">
                          Main Hero Portrait Photo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updatePhoto('/src/assets/images/hero_designer_portrait_1791181928056.jpg');
                            setProfileForm(prev => ({ ...prev, photoUrl: '/src/assets/images/hero_designer_portrait_1791181928056.jpg' }));
                          }}
                          className="text-[10px] text-[#0284C7] hover:underline font-medium"
                        >
                          Restore Default
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <img
                          src={profileForm.photoUrl}
                          alt="Hero Preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-sky-400 shadow-xs"
                        />
                        <div className="space-y-2 flex-1">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload New Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, 'hero')}
                            />
                          </label>
                          <input
                            type="text"
                            value={profileForm.photoUrl}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, photoUrl: e.target.value });
                              updatePhoto(e.target.value);
                            }}
                            placeholder="Or paste image URL"
                            className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* About Section Photo */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 block">
                          About Section Studio Photo
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            updateAboutPhoto('/src/assets/images/about_design_studio_1791181942784.jpg');
                            setProfileForm(prev => ({ ...prev, aboutPhotoUrl: '/src/assets/images/about_design_studio_1791181942784.jpg' }));
                          }}
                          className="text-[10px] text-[#0284C7] hover:underline font-medium"
                        >
                          Restore Default
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <img
                          src={profileForm.aboutPhotoUrl}
                          alt="About Preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-slate-300 shadow-xs"
                        />
                        <div className="space-y-2 flex-1">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Studio Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, 'about')}
                            />
                          </label>
                          <input
                            type="text"
                            value={profileForm.aboutPhotoUrl}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, aboutPhotoUrl: e.target.value });
                              updateAboutPhoto(e.target.value);
                            }}
                            placeholder="Or paste image URL"
                            className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-200 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Profile Text Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Role Title</label>
                        <input
                          type="text"
                          value={profileForm.roleTitle}
                          onChange={(e) => setProfileForm({ ...profileForm, roleTitle: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Hero Headline / Tagline</label>
                      <input
                        type="text"
                        value={profileForm.tagline}
                        onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Hero Bio Prose</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">About Section Description</label>
                      <textarea
                        rows={3}
                        value={profileForm.aboutText}
                        onChange={(e) => setProfileForm({ ...profileForm, aboutText: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Experience (Years)</label>
                        <input
                          type="number"
                          value={profileForm.experienceYears}
                          onChange={(e) => setProfileForm({ ...profileForm, experienceYears: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Completed Projects</label>
                        <input
                          type="number"
                          value={profileForm.completedProjects}
                          onChange={(e) => setProfileForm({ ...profileForm, completedProjects: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Satisfied Clients</label>
                        <input
                          type="number"
                          value={profileForm.satisfiedClients}
                          onChange={(e) => setProfileForm({ ...profileForm, satisfiedClients: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Design Awards</label>
                        <input
                          type="number"
                          value={profileForm.designAwards}
                          onChange={(e) => setProfileForm({ ...profileForm, designAwards: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Phone / WhatsApp</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Facebook URL</label>
                        <input
                          type="text"
                          value={profileForm.facebookUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Behance URL</label>
                        <input
                          type="text"
                          value={profileForm.behanceUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, behanceUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: PROJECTS MANAGER */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Project Upload & Portfolio Manager</h3>
                      <p className="text-xs text-slate-500">Upload new showcase projects, edit existing items, or update images.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Restore initial curated showcase projects?')) {
                            resetSection('projects');
                            alert('Restored default portfolio projects!');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Restore Default Projects</span>
                      </button>

                      {!isAddingProject && (
                        <button
                          onClick={() => {
                            setEditingProjectId(null);
                            setIsAddingProject(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Upload New Project</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add / Edit Project Form */}
                  {isAddingProject && (
                    <form onSubmit={handleProjectSubmit} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-900 uppercase">
                          {editingProjectId ? 'Edit Project' : 'Upload New Project'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Project Title *</label>
                          <input
                            type="text"
                            required
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            placeholder="e.g. Minimalist Packaging System"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Category *</label>
                          <select
                            value={projectForm.category}
                            onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="Brand Identity">Brand Identity</option>
                            <option value="Print & Packaging">Print & Packaging</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Photo Retouching">Photo Retouching</option>
                            <option value="Vector & Illustration">Vector & Illustration</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Client Name</label>
                          <input
                            type="text"
                            value={projectForm.client}
                            onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                            placeholder="e.g. Aura Cosmetics"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">Year</label>
                          <input
                            type="text"
                            value={projectForm.year}
                            onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                            placeholder="2024"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Project Image: File Upload or URL */}
                      <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Project Image (Upload from Computer or Paste URL) *
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(e, 'project')}
                            />
                          </label>
                          <span className="text-xs text-slate-400">or</span>
                          <input
                            type="text"
                            value={projectForm.imageUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                            placeholder="Paste image URL (https://...)"
                            className="flex-1 w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                        {projectForm.imageUrl && (
                          <div className="mt-2">
                            <span className="text-[11px] text-slate-500 block mb-1">Image Preview:</span>
                            <img
                              src={projectForm.imageUrl}
                              alt="Preview"
                              className="h-28 rounded-lg object-cover border border-slate-200"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Project Description</label>
                        <textarea
                          rows={3}
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                          placeholder="Describe the design challenge, printing specifications, and creative outcome..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      {/* Tools & Tags */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Tools Used</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {projectForm.tools.map((t, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md text-xs">
                              <span>{t}</span>
                              <button type="button" onClick={() => handleRemoveTool(idx)} className="hover:text-red-600">
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            placeholder="Add a tool (e.g. Adobe InDesign)"
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddTool}
                            className="px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg font-medium"
                          >
                            Add Tool
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Behance / External Link</label>
                        <input
                          type="text"
                          value={projectForm.link}
                          onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                          placeholder="https://www.behance.net/..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg"
                        >
                          {editingProjectId ? 'Update Project' : 'Publish Project'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="px-4 py-2.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of current projects */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Current Projects ({data.projects.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.projects.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-100"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</div>
                              <div className="text-[11px] text-[#0284C7]">{p.category} · {p.year}</div>
                              <div className="text-[10px] text-slate-400">{p.client}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleEditProjectClick(p)}
                              className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded-md"
                              title="Edit Project"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                  deleteProject(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CV PDF & CREDENTIALS */}
              {activeTab === 'cv' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">CV PDF File & Credential Records</h3>
                      <p className="text-xs text-slate-500">
                        Upload your official CV PDF document for visitor downloads and update personal/academic records.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Restore CV personal and work details back to initial attached CV?')) {
                          resetSection('experience');
                          resetSection('education');
                          updateProfile({ cvPdfUrl: '', cvFileName: 'Md_Shawan_Islam_CV.pdf' });
                          alert('CV details restored to original CV values!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Restore Original CV Details</span>
                    </button>
                  </div>

                  {/* CV File Upload Card */}
                  <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {data.profile.cvPdfUrl ? 'Custom PDF Active' : 'Default Auto-Formatted CV'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            File: {data.profile.cvFileName || 'Md_Shawan_Islam_CV.pdf'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {data.profile.cvPdfUrl && (
                          <button
                            type="button"
                            onClick={() => updateProfile({ cvPdfUrl: '', cvFileName: 'Md_Shawan_Islam_CV.pdf' })}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg"
                          >
                            Remove Uploaded PDF
                          </button>
                        )}
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-4 h-4" />
                          <span>Upload New CV (PDF)</span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleCvPdfUpload}
                          />
                        </label>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      When visitors click <strong>"Download CV (PDF)"</strong> on your website, they will immediately receive this uploaded PDF file.
                    </p>
                  </div>

                  {/* CV Personal Details Fields */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Edit CV Personal & Family Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Father's Name</label>
                        <input
                          type="text"
                          value={data.profile.fatherName}
                          onChange={(e) => updateProfile({ fatherName: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Mother's Name</label>
                        <input
                          type="text"
                          value={data.profile.motherName}
                          onChange={(e) => updateProfile({ motherName: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                        <input
                          type="text"
                          value={data.profile.dateOfBirth}
                          onChange={(e) => updateProfile({ dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Blood Group</label>
                        <input
                          type="text"
                          value={data.profile.bloodGroup}
                          onChange={(e) => updateProfile({ bloodGroup: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Present & Permanent Address</label>
                        <input
                          type="text"
                          value={data.profile.address}
                          onChange={(e) => updateProfile({ address: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Work Experience Records
                    </h4>
                    {data.experience.map((exp, idx) => (
                      <div key={exp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].role = e.target.value;
                              updateExperience(updated);
                            }}
                            placeholder="Role Title"
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].company = e.target.value;
                              updateExperience(updated);
                            }}
                            placeholder="Company Name"
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].period = e.target.value;
                            updateExperience(updated);
                          }}
                          placeholder="Duration (e.g. 2012 to Present)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].description = e.target.value;
                            updateExperience(updated);
                          }}
                          placeholder="Description of duties"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICES & SKILLS */}
              {activeTab === 'services_skills' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Services & Skills Customizer</h3>
                      <p className="text-xs text-slate-500">Fine tune your service offerings and skill percentage bars.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Restore skills and service packages back to initial default values?')) {
                            resetSection('skills');
                            resetSection('services');
                            alert('Skills and services restored!');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Restore Defaults</span>
                      </button>
                    </div>
                  </div>

                  {/* Skills Editor */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Technical Skills & Proficiency (%)
                    </h4>
                    <div className="space-y-2">
                      {data.skills.map((skill, idx) => (
                        <div key={skill.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...data.skills];
                              updated[idx].name = e.target.value;
                              updateSkills(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-medium"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={10}
                              max={100}
                              value={skill.proficiency}
                              onChange={(e) => {
                                const updated = [...data.skills];
                                updated[idx].proficiency = Number(e.target.value);
                                updateSkills(updated);
                              }}
                              className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-center font-mono"
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Editor */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Service Packages
                    </h4>
                    <div className="space-y-3">
                      {data.services.map((srv, idx) => (
                        <div key={srv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <input
                            type="text"
                            value={srv.title}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].title = e.target.value;
                              updateServices(updated);
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                          />
                          <textarea
                            rows={2}
                            value={srv.description}
                            onChange={(e) => {
                              const updated = [...data.services];
                              updated[idx].description = e.target.value;
                              updateServices(updated);
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: MESSAGES INBOX */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Inbound Client Inquiries</h3>
                    <p className="text-xs text-slate-500">Messages sent via the website's contact and consultation forms.</p>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                      <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No client messages received yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border transition-colors ${
                            msg.read ? 'bg-white border-slate-200' : 'bg-sky-50/50 border-sky-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {!msg.read && (
                                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                              )}
                              <span className="text-xs font-bold text-slate-900">{msg.name}</span>
                              <span className="text-xs text-slate-400">({msg.email})</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-700 mb-1">
                            {msg.subject || 'Portfolio Inquiry'}
                          </div>

                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                            {msg.message}
                          </p>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}`}
                              className="text-xs font-semibold text-[#0284C7] hover:underline inline-flex items-center gap-1"
                            >
                              <span>Reply via Email</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <div className="flex items-center gap-2">
                              {!msg.read && (
                                <button
                                  onClick={() => markMessageAsRead(msg.id)}
                                  className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded"
                                >
                                  Mark as Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: CHANGE ADMIN PIN */}
              {activeTab === 'pin' && (
                <div className="space-y-6 max-w-md">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Change Admin PIN</h3>
                    <p className="text-xs text-slate-500">Update the security passcode required to access this admin panel.</p>
                  </div>

                  {pinSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pinSuccessMsg}</span>
                    </div>
                  )}

                  {pinChangeError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{pinChangeError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePinChangeSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Current PIN *</label>
                      <input
                        type="password"
                        required
                        value={oldPin}
                        onChange={(e) => setOldPin(e.target.value)}
                        placeholder="Current PIN (Default is 1234)"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">New PIN (Minimum 4 characters) *</label>
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Enter new secret PIN"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Confirm New PIN *</label>
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Re-enter new secret PIN"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Update Admin PIN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Reset PIN back to default "1234"?')) {
                            resetPinToDefault();
                            alert('Admin PIN has been reset to "1234".');
                          }
                        }}
                        className="px-3.5 py-2.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        Reset PIN to 1234
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: SUPABASE DATABASE & SYNC */}
              {activeTab === 'supabase' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Supabase Cloud Database Configuration</h3>
                    <p className="text-xs text-slate-500">
                      View or reconfigure your Supabase Project URL and Public API Key whenever needed.
                    </p>
                  </div>

                  {supabaseSaveMsg && (
                    <div
                      className={`p-3 text-xs rounded-lg border flex items-center gap-2 ${
                        supabaseSaveMsg.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{supabaseSaveMsg.text}</span>
                    </div>
                  )}

                  {/* Supabase Editable Configuration Card */}
                  <form onSubmit={handleSaveSupabaseConfig} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#0284C7]" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase">
                          Supabase Project Credentials
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetSupabaseConfig}
                        className="text-xs text-[#0284C7] hover:underline font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Initial Project Credentials</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Supabase Project URL *</label>
                      <input
                        type="text"
                        required
                        value={customSupabaseUrl}
                        onChange={(e) => setCustomSupabaseUrl(e.target.value)}
                        placeholder="https://your-project-id.supabase.co"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                      {!isValidHttpUrl(customSupabaseUrl) && (
                        <p className="text-[10px] text-amber-600">Must start with http:// or https://</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Supabase Anon Public API Key *</label>
                      <textarea
                        rows={2}
                        required
                        value={customSupabaseAnonKey}
                        onChange={(e) => setCustomSupabaseAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Apply Credentials</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSupabaseConnection}
                        disabled={isTestingConn}
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Activity className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-pulse text-[#0284C7]' : ''}`} />
                        <span>{isTestingConn ? 'Testing...' : 'Test Connection'}</span>
                      </button>
                    </div>

                    {testResult && (
                      <div
                        className={`p-3 text-xs rounded-lg border mt-2 flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        {testResult.success ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </form>

                  {/* Cloud Sync Action Bar */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Push & Sync Data to Supabase</div>
                      <div className="text-[11px] text-slate-500">
                        Saves all current profile info, projects, skills, and CV files to table <code>portfolio_data</code>.
                      </div>
                    </div>

                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Now with Supabase'}</span>
                    </button>
                  </div>

                  {syncMessage && (
                    <div
                      className={`p-3 text-xs rounded-lg border flex items-center gap-2 ${
                        syncMessage.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{syncMessage.text}</span>
                    </div>
                  )}

                  {/* Supabase SQL Editor Helper */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Supabase SQL Schema Script
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Run this SQL in your Supabase project dashboard (SQL Editor) to create the tables for this site:
                        </p>
                      </div>

                      <button
                        onClick={handleCopySql}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs"
                      >
                        {copiedSql ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0284C7]" />}
                        <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-900 text-sky-200 text-xs font-mono rounded-xl overflow-x-auto max-h-56 leading-relaxed">
                      {SUPABASE_SQL_SETUP}
                    </pre>
                  </div>

                  {/* Reset to Factory Defaults */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Master Reset: Restore Entire Site to Fresh CV</div>
                      <div className="text-[11px] text-slate-500">Restore all initial records, photos, projects, and PIN back to 1234.</div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all content, photos, projects and PIN back to the default CV values?')) {
                          resetToDefaults();
                          alert('Reset all content to original CV values successfully!');
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg self-start sm:self-auto"
                    >
                      Master Reset (All Data)
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
