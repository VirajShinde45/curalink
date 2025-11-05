import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ivqljpbifavxzvebujiy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cWxqcGJpZmF2eHp2ZWJ1aml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzQ4NzcsImV4cCI6MjA3Nzc1MDg3N30.lykcMhAOzFOMTrRYsDMDeCjZslfJTKqVep31LnRT4dM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserType = 'patient' | 'researcher';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  user_type: UserType;
  birth_date: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  user_type: UserType;
  conditions: string[];
  interests: string[];
  specialties: string[];
  locale: string;
  notify_settings: {
    email: boolean;
    in_app: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ClinicalTrial {
  id: string;
  nct_number: string | null;
  title: string;
  summary: string | null;
  sponsor: string | null;
  status: string;
  phase: string | null;
  enrollment_count: number | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: string;
  pmid: string | null;
  doi: string | null;
  title: string;
  abstract: string | null;
  journal: string | null;
  pub_date: string | null;
  authors_text: string | null;
  trial_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  category_id: string;
  title: string;
  author_id: string;
  status: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  entity_type: 'trial' | 'publication' | 'thread' | 'post' | 'expert';
  entity_id: string;
  created_at: string;
}

export interface MeetingRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  title: string;
  purpose: string | null;
  status: string;
  preferred_times: any[];
  notes: string | null;
  meeting_url: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}
