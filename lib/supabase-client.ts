import { createClient } from '@/utils/supabase/client'
import { UserProfile, Devotional, RotaSlot, Ministry, CreateDevotionalData, DevotionalIdea } from '@/lib/supabase'

export class SupabaseClient {
  private client = createClient()

  // ============================================================================
  // AUTHENTICATION & USER MANAGEMENT
  // ============================================================================

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    return user
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) {
      throw error
    }
  }

  // ============================================================================
  // USER PROFILES
  // ============================================================================

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  async createProfile(userId: string, userData: any): Promise<UserProfile | null> {
    const profileData = {
      id: userId,
      email: userData.email || '',
      name: userData.user_metadata?.name || 
            userData.user_metadata?.full_name || 
            userData.email?.split('@')[0] || 
            'User',
      role: 'user',
      is_server: false,
      phone: userData.user_metadata?.phone || null
    }

    const { data, error } = await this.client
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }

    return data || []
  }

  async updateProfileRole(userId: string, role: 'user' | 'admin'): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile role:', error)
      return null
    }

    return data
  }

  // ============================================================================
  // DEVOTIONALS
  // ============================================================================

  async getDevotionals(): Promise<Devotional[]> {
    const { data, error } = await this.client
      .from('devotionals')
      .select(`
        *,
        devotional_ideas(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching devotionals:', error)
      return []
    }

    return data || []
  }

  async getDevotional(id: string): Promise<Devotional | null> {
    const { data, error } = await this.client
      .from('devotionals')
      .select(`
        *,
        devotional_ideas(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching devotional:', error)
      return null
    }

    return data
  }

  async createDevotional(devotionalData: Partial<Devotional>): Promise<Devotional | null> {
    const { data, error } = await this.client
      .from('devotionals')
      .insert(devotionalData)
      .select()
      .single()

    if (error) {
      console.error('Error creating devotional:', error)
      return null
    }

    return data
  }

  async createDevotionalWithIdeas(devotionalData: CreateDevotionalData): Promise<Devotional | null> {
    // Start a transaction
    const { data: devotional, error: devotionalError } = await this.client
      .from('devotionals')
      .insert({
        title: devotionalData.title,
        start_date: devotionalData.start_date,
        end_date: devotionalData.end_date,
        prayer_points: devotionalData.prayer_points
      })
      .select()
      .single()

    if (devotionalError) {
      console.error('Error creating devotional:', devotionalError)
      return null
    }

    // If there are devotional ideas, create them
    if (devotionalData.devotional_ideas && devotionalData.devotional_ideas.length > 0) {
      const ideasData = devotionalData.devotional_ideas.map(idea => ({
        devotional_id: devotional.id,
        title: idea.title,
        content_type: idea.content_type,
        content: idea.content,
        description: idea.description
      }))

      const { error: ideasError } = await this.client
        .from('devotional_ideas')
        .insert(ideasData)

      if (ideasError) {
        console.error('Error creating devotional ideas:', ideasError)
        // Note: The devotional was created but ideas failed
        // You might want to delete the devotional or handle this differently
      }
    }

    // Return the devotional with ideas
    return this.getDevotional(devotional.id)
  }

  async updateDevotional(id: string, updates: Partial<Devotional>): Promise<Devotional | null> {
    const { data, error } = await this.client
      .from('devotionals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating devotional:', error)
      return null
    }

    return data
  }

  async deleteDevotional(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('devotionals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting devotional:', error)
      return false
    }

    return true
  }

  // ============================================================================
  // DEVOTIONAL IDEAS
  // ============================================================================

  async getDevotionalIdeas(devotionalId: string): Promise<DevotionalIdea[]> {
    const { data, error } = await this.client
      .from('devotional_ideas')
      .select('*')
      .eq('devotional_id', devotionalId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching devotional ideas:', error)
      return []
    }

    return data || []
  }

  async createDevotionalIdea(ideaData: Omit<DevotionalIdea, 'id' | 'created_at' | 'updated_at'>): Promise<DevotionalIdea | null> {
    const { data, error } = await this.client
      .from('devotional_ideas')
      .insert(ideaData)
      .select()
      .single()

    if (error) {
      console.error('Error creating devotional idea:', error)
      return null
    }

    return data
  }

  async updateDevotionalIdea(id: string, updates: Partial<DevotionalIdea>): Promise<DevotionalIdea | null> {
    const { data, error } = await this.client
      .from('devotional_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating devotional idea:', error)
      return null
    }

    return data
  }

  async deleteDevotionalIdea(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('devotional_ideas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting devotional idea:', error)
      return false
    }

    return true
  }

  // ============================================================================
  // MINISTRIES
  // ============================================================================

  async getMinistries(): Promise<Ministry[]> {
    const { data, error } = await this.client
      .from('ministries')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching ministries:', error)
      return []
    }

    return data || []
  }

  async getAllMinistries(): Promise<Ministry[]> {
    const { data, error } = await this.client
      .from('ministries')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all ministries:', error)
      return []
    }

    return data || []
  }

  async getMinistry(id: string): Promise<Ministry | null> {
    const { data, error } = await this.client
      .from('ministries')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching ministry:', error)
      return null
    }

    return data
  }

  async createMinistry(ministryData: Partial<Ministry>): Promise<Ministry | null> {
    const { data, error } = await this.client
      .from('ministries')
      .insert(ministryData)
      .select()
      .single()

    if (error) {
      console.error('Error creating ministry:', error)
      return null
    }

    return data
  }

  async updateMinistry(id: string, updates: Partial<Ministry>): Promise<Ministry | null> {
    const { data, error } = await this.client
      .from('ministries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ministry:', error)
      return null
    }

    return data
  }

  async deleteMinistry(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('ministries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting ministry:', error)
      return false
    }

    return true
  }

  // ============================================================================
  // ROTA MANAGEMENT
  // ============================================================================

  async getRotaSlots(): Promise<RotaSlot[]> {
    const { data, error } = await this.client
      .from('rota_slots')
      .select(`
        *,
        ministry:ministries(*)
      `)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching rota slots:', error)
      return []
    }

    return data || []
  }

  async getRotaSlotsByDateRange(startDate: string, endDate: string): Promise<RotaSlot[]> {
    const { data, error } = await this.client
      .from('rota_slots')
      .select(`
        *,
        ministry:ministries(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching rota slots by date range:', error)
      return []
    }

    return data || []
  }

  async getRotaSlot(id: string): Promise<RotaSlot | null> {
    const { data, error } = await this.client
      .from('rota_slots')
      .select(`
        *,
        ministry:ministries(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching rota slot:', error)
      return null
    }

    return data
  }

  async createRotaSlot(slotData: Partial<RotaSlot>): Promise<RotaSlot | null> {
    const { data, error } = await this.client
      .from('rota_slots')
      .insert(slotData)
      .select()
      .single()

    if (error) {
      console.error('Error creating rota slot:', error)
      return null
    }

    return data
  }

  async updateRotaSlot(id: string, updates: Partial<RotaSlot>): Promise<RotaSlot | null> {
    const { data, error } = await this.client
      .from('rota_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating rota slot:', error)
      return null
    }

    return data
  }

  async deleteRotaSlot(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('rota_slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting rota slot:', error)
      return false
    }

    return true
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async getStats() {
    try {
      const [devotionals, rotaSlots, ministries, profiles] = await Promise.all([
        this.getDevotionals(),
        this.getRotaSlots(),
        this.getAllMinistries(),
        this.getAllProfiles(),
      ])

      return {
        devotionals: devotionals.length,
        rotaSlots: rotaSlots.length,
        ministries: ministries.length,
        profiles: profiles.length,
        activeMinistries: ministries.filter(m => m.is_active).length,
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return null
    }
  }
}

// Export a singleton instance
export const supabaseClient = new SupabaseClient() 