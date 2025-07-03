import { BaseClient } from './base-client'
import { Ministry } from '@/lib/supabase'

export class MinistryClient extends BaseClient {
  async getMinistries(): Promise<Ministry[]> {
    const { data, error } = await this.client
      .from('ministries')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching ministries')
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
      this.handleError(error, 'fetching all ministries')
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
      this.handleError(error, 'fetching ministry')
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
      this.handleError(error, 'creating ministry')
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
      this.handleError(error, 'updating ministry')
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
      this.handleError(error, 'deleting ministry')
      return false
    }

    return true
  }
} 