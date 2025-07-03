// Types for our database
export interface UserProfile {
  id: string
  name: string
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
  bible_readings?: BibleReading[]
  created_by: string
  created_at: string
  updated_at: string
  devotional_ideas?: DevotionalIdea[]
}

export interface CreateDevotionalData {
  title: string
  start_date: string
  end_date?: string
  prayer_points?: string
  bible_readings?: BibleReading[]
  devotional_ideas?: Omit<DevotionalIdea, 'id' | 'devotional_id' | 'created_at' | 'updated_at'>[]
}

export interface BibleReading {
  id?: string
  devotional_id?: string
  verse_reference: string
  verse_text: string
  commentary?: string
  created_at?: string
  updated_at?: string
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

export interface Rota {
  id: string
  date: string
  title?: string
  description?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  slots?: RotaSlot[]
}

export interface RotaSlot {
  id: string
  rota_id: string
  ministry_id: string
  servers_needed: number
  created_by: string
  created_at: string
  updated_at: string
  ministry?: Ministry
}

export interface RotaTemplateItem {
  id: string
  template_id: string
  ministry_id: string
  servers_needed: number
  sort_order: number
  created_at: string
  updated_at: string
  ministry?: Ministry
}

export interface RotaTemplate {
  id: string
  name: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
  items?: RotaTemplateItem[]
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