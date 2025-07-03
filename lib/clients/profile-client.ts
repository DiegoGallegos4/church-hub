import { BaseClient } from './base-client'
import { UserProfile } from '@/lib/supabase'

export class ProfileClient extends BaseClient {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      this.handleError(error, 'fetching profile')
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
      this.handleError(error, 'creating profile')
      return null
    }

    return data
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    console.log('ProfileClient: Updating profile for user', userId, 'with updates:', updates)
    
    const { data, error } = await this.client
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('ProfileClient: Error updating profile:', error)
      this.handleError(error, 'updating profile')
      return null
    }

    console.log('ProfileClient: Profile updated successfully:', data)
    return data
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      this.handleError(error, 'fetching profiles')
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
      this.handleError(error, 'updating profile role')
      return null
    }

    return data
  }
} 