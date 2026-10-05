import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteData, ContactMessage } from '../types/portfolio';

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

// LocalStorage helpers for reliable immediate persistence
export function getLocalSiteData(): SiteData | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to read from localStorage', e);
  }
  return null;
}

export function saveLocalSiteData(data: SiteData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to localStorage', e);
  }
}

export function getLocalMessages(): ContactMessage[] {
  try {
    const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to read messages from localStorage', e);
  }
  return [];
}

export function saveLocalMessages(messages: ContactMessage[]): void {
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages to localStorage', e);
  }
}

// SQL setup script for user's Supabase dashboard
export const SUPABASE_SQL_SETUP = `-- Copy and run this in your Supabase SQL Editor:
-- 1. Create table for portfolio content
CREATE TABLE IF NOT EXISTS public.portfolio_data (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for incoming contact messages
CREATE TABLE IF NOT EXISTS public.portfolio_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- 3. Enable Row Level Security (RLS) & allow public read/write
ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Portfolio" ON public.portfolio_data FOR SELECT USING (true);
CREATE POLICY "Public Update Portfolio" ON public.portfolio_data FOR ALL USING (true);

CREATE POLICY "Public Insert Messages" ON public.portfolio_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Messages" ON public.portfolio_messages FOR SELECT USING (true);
CREATE POLICY "Public Update Messages" ON public.portfolio_messages FOR UPDATE USING (true);
CREATE POLICY "Public Delete Messages" ON public.portfolio_messages FOR DELETE USING (true);
`;
