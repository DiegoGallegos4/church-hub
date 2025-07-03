import { BaseClient } from './base-client'
import { Rota, RotaSlot, ServerAssignment } from '@/lib/supabase'

export class RotaClient extends BaseClient {
  async getRotaByDate(date: string): Promise<Rota | null> {
    const { data, error } = await this.client
      .rpc('get_rota_by_date', {
        target_date: date
      })

    if (error) {
      this.handleError(error, 'fetching rota by date')
      return null
    }

    return data
  }



  // Get all rotas (for admin views)
  async getRotas(): Promise<Rota[]> {
    const { data, error } = await this.client
      .from('rotas')
      .select(`
        *,
        slots:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)
      .order('date', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching rotas')
      return []
    }

    return data || []
  }

  async getRotaSlots(): Promise<RotaSlot[]> {
    const { data, error } = await this.client
      .from('rota_slots')
      .select(`
        *,
        ministry:ministries(*)
      `)
      .order('created_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching rota slots')
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
      this.handleError(error, 'fetching rota slot')
      return null
    }

    return data
  }

  async createRota(date: string, title?: string, description?: string): Promise<Rota | null> {
    const { data, error } = await this.client
      .rpc('create_rota', {
        rota_date: date,
        rota_title: title,
        rota_description: description
      })

    if (error) {
      this.handleError(error, 'creating rota')
      return null
    }

    // Fetch the created rota
    return this.getRotaById(data.rota_id)
  }

  async getRotaById(rotaId: string): Promise<Rota | null> {
    const { data, error } = await this.client
      .from('rotas')
      .select(`
        *,
        slots:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)
      .eq('id', rotaId)
      .single()

    if (error) {
      this.handleError(error, 'fetching rota')
      return null
    }

    return data
  }

  async createRotaSlot(slotData: Partial<RotaSlot>): Promise<RotaSlot | null> {
    const { data, error } = await this.client
      .from('rota_slots')
      .insert(slotData)
      .select(`
        *,
        ministry:ministries(*)
      `)
      .single()

    if (error) {
      this.handleError(error, 'creating rota slot')
      return null
    }

    return data
  }

  async updateRotaSlot(id: string, updates: Partial<RotaSlot>): Promise<RotaSlot | null> {
    const { data, error } = await this.client
      .from('rota_slots')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        ministry:ministries(*)
      `)
      .single()

    if (error) {
      this.handleError(error, 'updating rota slot')
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
      this.handleError(error, 'deleting rota slot')
      return false
    }

    return true
  }

  async duplicateRota(sourceRotaId: string, targetDate: string): Promise<boolean> {
    const { error } = await this.client
      .rpc('duplicate_rota', {
        source_rota_uuid: sourceRotaId,
        target_date: targetDate
      })

    if (error) {
      this.handleError(error, 'duplicating rota')
      return false
    }

    return true
  }

  // ============================================================================
  // SERVER ASSIGNMENTS
  // ============================================================================

  async getServerAssignments(slotId?: string): Promise<ServerAssignment[]> {
    let query = this.client
      .from('server_assignments')
      .select(`
        *,
        slot:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)

    if (slotId) {
      query = query.eq('slot_id', slotId)
    }

    const { data, error } = await query.order('assigned_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching server assignments')
      return []
    }

    return data || []
  }

  async getUserAssignments(userId: string): Promise<ServerAssignment[]> {
    const { data, error } = await this.client
      .from('server_assignments')
      .select(`
        *,
        slot:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_assigned', true)
      .order('assigned_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching user assignments')
      return []
    }

    return data || []
  }

  async createServerAssignment(assignmentData: Partial<ServerAssignment>): Promise<ServerAssignment | null> {
    const { data, error } = await this.client
      .from('server_assignments')
      .insert(assignmentData)
      .select(`
        *,
        slot:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)
      .single()

    if (error) {
      this.handleError(error, 'creating server assignment')
      return null
    }

    return data
  }

  async updateServerAssignment(id: string, updates: Partial<ServerAssignment>): Promise<ServerAssignment | null> {
    const { data, error } = await this.client
      .from('server_assignments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        slot:rota_slots(
          *,
          ministry:ministries(*)
        )
      `)
      .single()

    if (error) {
      this.handleError(error, 'updating server assignment')
      return null
    }

    return data
  }

  async deleteServerAssignment(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('server_assignments')
      .delete()
      .eq('id', id)

    if (error) {
      this.handleError(error, 'deleting server assignment')
      return false
    }

    return true
  }
} 