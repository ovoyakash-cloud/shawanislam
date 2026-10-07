import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteData, ContactMessage } from '../types/portfolio';
import { getIdbItem, setIdbItem } from './idbStorage';
import { DEFAULT_HERO_IMAGE, DEFAULT_ABOUT_IMAGE, DEFAULT_PROJECT_BRAND } from '../data/initialData';

export const INITIAL_DEFAULT_SUPABASE_URL = 'https://vuwwfjxygawbkevjwoud.supabase.co';
export const INITIAL_DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1d3dmanh5Z2F3Ymtldmp3b3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzI5MzMsImV4cCI6MjEwNjc0ODkzM30.0FjAH49Ro2V5QK0tqUCJzVgwPXeEq9tY7yRm5vnYgPw';

const SUPABASE_CONFIG_STORAGE_KEY = 'shawan_portfolio_supabase_config_v1';
const LOCAL_STORAGE_KEY = 'shawan_portfolio_site_data_v1';
const LOCAL_MESSAGES_KEY = 'shawan_portfolio_messages_v1';

export function isValidHttpUrl(str: unknown): str is string {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidHttpUrl(parsed.url) && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch (e) {
    // Ignore error
  }

  // Fallback to env or initial default
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  return {
    url: isValidHttpUrl(envUrl) ? envUrl.trim() : INITIAL_DEFAULT_SUPABASE_URL,
    anonKey: (typeof envKey === 'string' && envKey.length > 20 && !envKey.includes('YOUR_'))
      ? envKey.trim()
      : INITIAL_DEFAULT_SUPABASE_ANON_KEY,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): { success: boolean; error?: string } {
  if (!isValidHttpUrl(url)) {
    return { success: false, error: 'Must be a valid HTTP or HTTPS URL (e.g. https://your-id.supabase.co)' };
  }
  if (!anonKey || anonKey.trim().length < 15) {
    return { success: false, error: 'Anon Key must be a valid Supabase API key.' };
  }

  try {
    localStorage.setItem(
      SUPABASE_CONFIG_STORAGE_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    activeSupabaseClient = initSupabaseClient(url.trim(), anonKey.trim());
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to save config' };
  }
}

export function resetSupabaseConfigToDefault(): SupabaseConfig {
  try {
    localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
  } catch (e) {
    // Ignore error
  }
  const config = {
    url: INITIAL_DEFAULT_SUPABASE_URL,
    anonKey: INITIAL_DEFAULT_SUPABASE_ANON_KEY,
  };
  activeSupabaseClient = initSupabaseClient(config.url, config.anonKey);
  return config;
}

function initSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  try {
    if (isValidHttpUrl(url) && anonKey) {
      return createClient(url, anonKey);
    }
  } catch (err) {
    console.warn('Supabase initialization error, falling back to local mode:', err);
  }
  return null;
}

const currentConfig = getSavedSupabaseConfig();
let activeSupabaseClient: SupabaseClient | null = initSupabaseClient(currentConfig.url, currentConfig.anonKey);

export function getActiveSupabaseClient(): SupabaseClient | null {
  return activeSupabaseClient;
}

export async function testRemoteSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  const clientToTest = (url && anonKey)
    ? initSupabaseClient(url, anonKey)
    : activeSupabaseClient;

  if (!clientToTest) {
    return { success: false, message: 'Invalid URL or Key format.' };
  }

  try {
    const { error } = await clientToTest.from('portfolio_data').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! (Tables not yet created; run the SQL script below in SQL editor).',
        };
      }
      return { success: false, message: `Connected to Supabase, but returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed. Check network or CORS.' };
  }
}

export async function fetchRemoteSiteData(): Promise<SiteData | null> {
  const client = getActiveSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('portfolio_data')
      .select('content')
      .eq('id', 'shawan_portfolio')
      .single();

    if (error) {
      return null;
    }

    if (data && data.content) {
      return data.content as SiteData;
    }
  } catch (err) {
    console.warn('Error reading from Supabase:', err);
  }
  return null;
}

export async function saveRemoteSiteData(siteData: SiteData): Promise<{ success: boolean; error?: string }> {
  const client = getActiveSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not connected' };
  }
  try {
    const { error } = await client
      .from('portfolio_data')
      .upsert({
        id: 'shawan_portfolio',
        content: siteData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error syncing with Supabase' };
  }
}

export async function sendRemoteContactMessage(message: ContactMessage): Promise<{ success: boolean; error?: string }> {
  const client = getActiveSupabaseClient();
  if (!client) {
    return { success: true }; // Local message is already recorded
  }
  try {
    const { error } = await client
      .from('portfolio_messages')
      .insert([
        {
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          created_at: message.date,
          is_read: message.read,
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchRemoteMessages(): Promise<ContactMessage[] | null> {
  const client = getActiveSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('portfolio_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject || '',
      message: row.message,
      date: row.created_at || new Date().toISOString(),
      read: Boolean(row.is_read),
    }));
  } catch (err) {
    return null;
  }
}

// Quota-safe storage helpers: combines high-capacity IndexedDB with synchronous LocalStorage
function createSafeLocalStorageSnapshot(data: SiteData): string {
  try {
    const raw = JSON.stringify(data);
    // If under 2.5MB, write as is
    if (raw.length < 2500000) {
      return raw;
    }

    // If large, omit massive base64 strings from 5MB localStorage (IndexedDB retains complete data)
    const trimmed: SiteData = {
      ...data,
      profile: {
        ...data.profile,
        cvPdfUrl: (data.profile?.cvPdfUrl && data.profile.cvPdfUrl.length > 50000) ? '' : (data.profile?.cvPdfUrl || ''),
        photoUrl: (data.profile?.photoUrl && data.profile.photoUrl.length > 200000)
          ? DEFAULT_HERO_IMAGE
          : (data.profile?.photoUrl || DEFAULT_HERO_IMAGE),
        aboutPhotoUrl: (data.profile?.aboutPhotoUrl && data.profile.aboutPhotoUrl.length > 200000)
          ? DEFAULT_ABOUT_IMAGE
          : (data.profile?.aboutPhotoUrl || DEFAULT_ABOUT_IMAGE),
      },
      projects: data.projects.map((p) => ({
        ...p,
        imageUrl: (p.imageUrl && p.imageUrl.length > 200000)
          ? DEFAULT_PROJECT_BRAND
          : (p.imageUrl || DEFAULT_PROJECT_BRAND),
      })),
    };
    return JSON.stringify(trimmed);
  } catch {
    return JSON.stringify(data);
  }
}

export function getLocalSiteData(): SiteData | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Graceful fallback
  }
  return null;
}

export async function getIdbSiteData(): Promise<SiteData | null> {
  return getIdbItem<SiteData>(LOCAL_STORAGE_KEY);
}

export function saveLocalSiteData(data: SiteData): void {
  // 1. Always write full high-fidelity payload to IndexedDB (virtually unlimited quota)
  setIdbItem(LOCAL_STORAGE_KEY, data).catch(() => {});

  // 2. Write safe snapshot to localStorage for instant synchronous startup
  try {
    const snapshot = createSafeLocalStorageSnapshot(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, snapshot);
  } catch (e: any) {
    // If browser quota exceeded, save safe compact version with default asset fallbacks (never empty strings)
    try {
      const compact: SiteData = {
        ...data,
        profile: {
          ...data.profile,
          cvPdfUrl: '',
          photoUrl: DEFAULT_HERO_IMAGE,
          aboutPhotoUrl: DEFAULT_ABOUT_IMAGE,
        },
        projects: data.projects.map(p => ({
          ...p,
          imageUrl: DEFAULT_PROJECT_BRAND,
        })),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // IndexedDB has already persisted full data, silently ignore
    }
  }
}

export function getLocalMessages(): ContactMessage[] {
  try {
    const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Graceful fallback
  }
  return [];
}

export function saveLocalMessages(messages: ContactMessage[]): void {
  // Persist all messages to IndexedDB
  setIdbItem(LOCAL_MESSAGES_KEY, messages).catch(() => {});

  // Keep latest 25 messages in localStorage to avoid quota issues
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages.slice(0, 25)));
  } catch (e) {
    // Graceful fallback
  }
}

const LOCAL_SECURITY_OTP_KEY = 'shawan_portfolio_security_otp_v1';
export const ADMIN_SECURITY_EMAIL = 'ovoyakash@gmail.com';

export async function generateAndSaveSecurityOtp(): Promise<{ success: boolean; message: string; expiryMinutes: number }> {
  // Generate random secure 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMinutes = 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  const otpRecord = {
    id: 'admin_security_otp',
    code: otpCode,
    createdAt,
    expiresAt,
    used: false,
    attempts: 0,
    email: ADMIN_SECURITY_EMAIL,
  };

  // 1. Save to local secure vault
  try {
    localStorage.setItem(LOCAL_SECURITY_OTP_KEY, JSON.stringify(otpRecord));
  } catch (err) {
    console.warn('Local OTP save warning:', err);
  }

  // 2. Dispatch email to ovoyakash@gmail.com
  try {
    fetch(`https://formsubmit.co/ajax/${ADMIN_SECURITY_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: 'Md. Shawan Islam Portfolio Admin Security',
        _subject: `[ADMIN OTP]: ${otpCode} - Shawan Portfolio PIN Reset Code`,
        recipient: ADMIN_SECURITY_EMAIL,
        otp_code: otpCode,
        message: `Hello Md. Shawan Islam,\n\nYour 6-digit Admin Security Verification Code (OTP) is:\n\n👉  ${otpCode}  👈\n\nThis code will expire in ${expiryMinutes} minutes.\nIf you did not initiate this request, you can safely ignore this email.\n\n— Shawan Portfolio Security System`,
      }),
    }).catch(() => {});
  } catch (mailErr) {
    console.warn('Email dispatch warning:', mailErr);
  }

  // 3. Save directly to Supabase database (in portfolio_data, portfolio_messages, and admin_security_otp)
  const client = getActiveSupabaseClient();
  if (client) {
    try {
      // Save in portfolio_data table
      await client
        .from('portfolio_data')
        .upsert({
          id: 'admin_security_otp',
          content: otpRecord,
          updated_at: createdAt,
        }, { onConflict: 'id' });

      // Save in portfolio_messages table
      await client
        .from('portfolio_messages')
        .insert([
          {
            id: `sec-otp-${Date.now()}`,
            name: 'SECURITY_VAULT_DISPATCH',
            email: ADMIN_SECURITY_EMAIL,
            subject: `[ADMIN PIN RESET OTP]: ${otpCode}`,
            message: `A secure PIN reset verification code was dispatched to ${ADMIN_SECURITY_EMAIL} on ${new Date().toLocaleString()}. One-Time Passcode (OTP): ${otpCode}. Valid for 10 minutes.`,
            created_at: createdAt,
            is_read: false,
          },
        ]);

      // Attempt to save to admin_security_otp table if it exists
      try {
        await client
          .from('admin_security_otp')
          .upsert({
            id: 'latest_otp',
            otp_code: otpCode,
            expires_at: expiresAt,
            used: false,
            created_at: createdAt,
          });
      } catch {
        // Optional table
      }
    } catch (dbErr) {
      console.warn('Supabase OTP write warning:', dbErr);
    }
  }

  return {
    success: true,
    message: `A secure 6-digit verification code (OTP) has been sent to ${ADMIN_SECURITY_EMAIL} and recorded in your database vault! Check your email inbox (or spam) and database.`,
    expiryMinutes,
  };
}

export async function verifySecurityOtp(enteredCode: string): Promise<{ valid: boolean; error?: string }> {
  if (!enteredCode || enteredCode.trim().length !== 6) {
    return { valid: false, error: 'Please enter a valid 6-digit security code (OTP).' };
  }

  let otpRecord: any = null;

  // 1. Check Supabase database first
  const client = getActiveSupabaseClient();
  if (client) {
    try {
      const { data } = await client
        .from('portfolio_data')
        .select('content')
        .eq('id', 'admin_security_otp')
        .single();

      if (data && data.content) {
        otpRecord = data.content;
      }
    } catch (e) {
      // Continue to local fallback
    }
  }

  // 2. Fallback to local secure vault if database unreachable
  if (!otpRecord) {
    try {
      const local = localStorage.getItem(LOCAL_SECURITY_OTP_KEY);
      if (local) {
        otpRecord = JSON.parse(local);
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!otpRecord || !otpRecord.code) {
    return {
      valid: false,
      error: 'No active OTP verification code found in the database. Please request a new security code first.',
    };
  }

  if (otpRecord.used) {
    return {
      valid: false,
      error: 'This security code has already been used and invalidated. Please request a new OTP.',
    };
  }

  const now = new Date().getTime();
  const expiry = new Date(otpRecord.expiresAt).getTime();
  if (now > expiry) {
    return {
      valid: false,
      error: 'This security code has expired (10 minutes limit). Please request a new OTP.',
    };
  }

  if (otpRecord.attempts >= 5) {
    return {
      valid: false,
      error: 'Too many incorrect attempts. For security, this code has been locked. Request a new OTP.',
    };
  }

  if (enteredCode.trim() !== otpRecord.code.toString().trim()) {
    // Record failed attempt
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;
    try {
      localStorage.setItem(LOCAL_SECURITY_OTP_KEY, JSON.stringify(otpRecord));
      if (client) {
        await client
          .from('portfolio_data')
          .upsert({ id: 'admin_security_otp', content: otpRecord, updated_at: new Date().toISOString() });
      }
    } catch (e) {}

    return {
      valid: false,
      error: `Invalid security code (Attempt ${otpRecord.attempts}/5). Check your database record.`,
    };
  }

  // Mark OTP as used immediately so it cannot be reused
  otpRecord.used = true;
  try {
    localStorage.setItem(LOCAL_SECURITY_OTP_KEY, JSON.stringify(otpRecord));
    if (client) {
      await client
        .from('portfolio_data')
        .upsert({ id: 'admin_security_otp', content: otpRecord, updated_at: new Date().toISOString() });
      try {
        await client
          .from('admin_security_otp')
          .update({ used: true })
          .eq('id', 'latest_otp');
      } catch {
        // Optional table
      }
    }
  } catch (e) {}

  return { valid: true };
}

// SQL setup script for user's Supabase dashboard
export const SUPABASE_SQL_SETUP = `-- Copy and run this in your Supabase SQL Editor:
-- 1. Create table for portfolio content & security vaults
CREATE TABLE IF NOT EXISTS public.portfolio_data (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for incoming contact messages & security logs
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- 3. Create table for admin security verification codes (OTP)
CREATE TABLE IF NOT EXISTS public.admin_security_otp (
  id TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) & allow authenticated public access
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_otp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Portfolio" ON public.portfolio_data FOR SELECT USING (true);
CREATE POLICY "Public Update Portfolio" ON public.portfolio_data FOR ALL USING (true);

CREATE POLICY "Public Insert Messages" ON public.portfolio_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Messages" ON public.portfolio_messages FOR SELECT USING (true);
CREATE POLICY "Public Update Messages" ON public.portfolio_messages FOR UPDATE USING (true);
CREATE POLICY "Public Delete Messages" ON public.portfolio_messages FOR DELETE USING (true);

CREATE POLICY "Public Manage OTP" ON public.admin_security_otp FOR ALL USING (true);
`;
