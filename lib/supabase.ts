import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface UserProfile {
  id: string
  full_name: string
  email: string
  is_server: boolean
  role: 'user' | 'admin'
  phone?: string
  created_at: string
  updated_at: string
}

export interface Devotional {
  id: string
  title: string
  start_date: string
  end_date?: string
  prayer_points?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface BibleReading {
  id: string
  devotional_id: string
  verse_reference: string
  verse_text: string
  bible_version?: string
  commentary?: string
  created_at: string
  updated_at: string
}

export interface DevotionalIdea {
  id: string
  devotional_id: string
  title: string
  content_type: 'text' | 'link' | 'video'
  content: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Ministry {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RotaSlot {
  id: string
  ministry_id: string
  date: string
  servers_needed: number
  created_by: string
  created_at: string
  updated_at: string
  ministry?: Ministry
}

export interface ServerAssignment {
  id: string
  slot_id: string
  user_id: string
  is_assigned: boolean
  assigned_at: string
  updated_at: string
  slot?: RotaSlot
  user?: UserProfile
}

// Export Profile type alias for backward compatibility
export type Profile = UserProfile 