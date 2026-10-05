import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteData, PortfolioProfile, Project, Service, SkillItem, WorkExperience, EducationItem, ContactMessage } from '../types/portfolio';
import { INITIAL_DATA } from '../data/initialData';
import {
  getLocalSiteData,
  saveLocalSiteData,
  getLocalMessages,
  saveLocalMessages,
  fetchRemoteSiteData,
  saveRemoteSiteData,
  sendRemoteContactMessage,
  fetchRemoteMessages,
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfigToDefault,
  testRemoteSupabaseConnection,
  SupabaseConfig
} from '../lib/supabase';

interface PortfolioContextType {
  data: SiteData;
  messages: ContactMessage[];
  isAdminOpen: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
  supabaseConfig: SupabaseConfig;
  openAdmin: () => void;
  closeAdmin: () => void;
  verifyPin: (pin: string) => boolean;
  logoutAdmin: () => void;
  changePin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  resetPinToDefault: () => void;
  updateProfile: (profile: Partial<PortfolioProfile>) => void;
  updatePhoto: (photoUrl: string) => void;
  updateAboutPhoto: (photoUrl: string) => void;
  updateCvPdf: (fileUrl: string, fileName: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateServices: (services: Service[]) => void;
  updateSkills: (skills: SkillItem[]) => void;
  updateExperience: (exp: WorkExperience[]) => void;
  updateEducation: (edu: EducationItem[]) => void;
  sendMessage: (msg: { name: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; error?: string }>;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  testConnection: (url?: string, key?: string) => Promise<{ success: boolean; message: string }>;
  updateSupabaseSettings: (url: string, anonKey: string) => { success: boolean; error?: string };
  resetSupabaseSettings: () => void;
  resetSection: (section: 'profile' | 'projects' | 'services' | 'skills' | 'experience' | 'education') => void;
  resetToDefaults: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SiteData>(() => {
    const local = getLocalSiteData();
    return local || INITIAL_DATA;
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    return getLocalMessages();
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    return getSavedSupabaseConfig();
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with remote Supabase on initial mount if available
  useEffect(() => {
    let isMounted = true;
    async function loadRemote() {
      const remoteData = await fetchRemoteSiteData();
      if (remoteData && isMounted) {
        setData(remoteData);
        saveLocalSiteData(remoteData);
      }
      const remoteMsgs = await fetchRemoteMessages();
      if (remoteMsgs && isMounted && remoteMsgs.length > 0) {
        setMessages(remoteMsgs);
        saveLocalMessages(remoteMsgs);
      }
    }
    loadRemote();
    return () => { isMounted = false; };
  }, []);

  // Listen to keyboard shortcut: Ctrl+Shift+A or Cmd+Shift+A or hash #admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Save changes locally and optionally remote
  const commitData = (newData: SiteData) => {
    setData(newData);
    saveLocalSiteData(newData);
    // Background sync with Supabase
    saveRemoteSiteData(newData).catch(() => {});
  };

  const openAdmin = () => setIsAdminOpen(true);
  const closeAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const verifyPin = (pin: string) => {
    if (pin.trim() === (data.adminPin || '1234')) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const resetPinToDefault = () => {
    const updated = { ...data, adminPin: '1234' };
    commitData(updated);
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
  };

  const changePin = (oldPin: string, newPin: string) => {
    if (oldPin.trim() !== (data.adminPin || '1234')) {
      return { success: false, error: 'Current PIN is incorrect.' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'New PIN must be at least 4 characters.' };
    }
    const updated: SiteData = {
      ...data,
      adminPin: newPin.trim(),
    };
    commitData(updated);
    return { success: true };
  };

  const updateProfile = (profileUpdates: Partial<PortfolioProfile>) => {
    const updated: SiteData = {
      ...data,
      profile: {
        ...data.profile,
        ...profileUpdates,
      },
    };
    commitData(updated);
  };

  const updatePhoto = (photoUrl: string) => {
    updateProfile({ photoUrl });
  };

  const updateAboutPhoto = (aboutPhotoUrl: string) => {
    updateProfile({ aboutPhotoUrl });
  };

  const updateCvPdf = (cvPdfUrl: string, cvFileName: string) => {
    updateProfile({ cvPdfUrl, cvFileName });
  };

  const addProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
    };
    const updated: SiteData = {
      ...data,
      projects: [newProject, ...data.projects],
    };
    commitData(updated);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = data.projects.map(p => (p.id === id ? { ...p, ...updates } : p));
    const updated: SiteData = {
      ...data,
      projects: updatedProjects,
    };
    commitData(updated);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = data.projects.filter(p => p.id !== id);
    const updated: SiteData = {
      ...data,
      projects: updatedProjects,
    };
    commitData(updated);
  };

  const updateServices = (services: Service[]) => {
    commitData({ ...data, services });
  };

  const updateSkills = (skills: SkillItem[]) => {
    commitData({ ...data, skills });
  };

  const updateExperience = (experience: WorkExperience[]) => {
    commitData({ ...data, experience });
  };

  const updateEducation = (education: EducationItem[]) => {
    commitData({ ...data, education });
  };

  const sendMessage = async (msg: { name: string; email: string; subject: string; message: string }) => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name,
      email: msg.email,
      subject: msg.subject || 'Portfolio Inquiry',
      message: msg.message,
      date: new Date().toISOString(),
      read: false,
    };

    const nextMessages = [newMsg, ...messages];
    setMessages(nextMessages);
    saveLocalMessages(nextMessages);

    const res = await sendRemoteContactMessage(newMsg);
    return res;
  };

  const markMessageAsRead = (id: string) => {
    const updated = messages.map(m => (m.id === id ? { ...m, read: true } : m));
    setMessages(updated);
    saveLocalMessages(updated);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    saveLocalMessages(updated);
  };

  const syncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await saveRemoteSiteData(data);
      setIsSyncing(false);
      if (res.success) {
        return { success: true, message: 'All portfolio data successfully saved and synchronized to Supabase Cloud!' };
      } else {
        return { success: false, message: res.error || 'Could not write to Supabase table. Ensure table portfolio_data exists.' };
      }
    } catch (e: any) {
      setIsSyncing(false);
      return { success: false, message: e?.message || 'Sync failed.' };
    }
  };

  const testConnection = async (url?: string, key?: string) => {
    return testRemoteSupabaseConnection(url, key);
  };

  const updateSupabaseSettings = (url: string, anonKey: string) => {
    const res = saveSupabaseConfig(url, anonKey);
    if (res.success) {
      setSupabaseConfig({ url, anonKey });
    }
    return res;
  };

  const resetSupabaseSettings = () => {
    const reset = resetSupabaseConfigToDefault();
    setSupabaseConfig(reset);
  };

  const resetSection = (section: 'profile' | 'projects' | 'services' | 'skills' | 'experience' | 'education') => {
    const updated = {
      ...data,
      [section]: INITIAL_DATA[section],
    };
    commitData(updated);
  };

  const resetToDefaults = () => {
    commitData(INITIAL_DATA);
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        messages,
        isAdminOpen,
        isAuthenticated,
        isSyncing,
        supabaseConfig,
        openAdmin,
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
        sendMessage,
        markMessageAsRead,
        deleteMessage,
        syncWithSupabase,
        testConnection,
        updateSupabaseSettings,
        resetSupabaseSettings,
        resetSection,
        resetToDefaults,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
