import { BaseClient } from './base-client'
import { RotaTemplate, RotaTemplateItem } from '@/lib/supabase'

export class RotaTemplateClient extends BaseClient {
  async getRotaTemplates(): Promise<RotaTemplate[]> {
    const { data, error } = await this.client
      .rpc('get_rota_templates')

    if (error) {
      this.handleError(error, 'fetching rota templates')
      return []
    }

    return data || []
  }

  async createRotaTemplate(name: string, description?: string): Promise<RotaTemplate | null> {
    const { data, error } = await this.client
      .rpc('create_rota_template', {
        template_name: name,
        template_description: description
      })

    if (error) {
      this.handleError(error, 'creating rota template')
      return null
    }

    // Fetch the created template
    return this.getRotaTemplateById(data.template_id)
  }

  async getRotaTemplateById(templateId: string): Promise<RotaTemplate | null> {
    const { data, error } = await this.client
      .from('rota_templates')
      .select(`
        *,
        items:rota_template_items(
          *,
          ministry:ministries(*)
        )
      `)
      .eq('id', templateId)
      .single()

    if (error) {
      this.handleError(error, 'fetching rota template')
      return null
    }

    return data
  }

  async addTemplateItem(
    templateId: string, 
    ministryId: string, 
    serversNeeded: number = 1, 
    sortOrder: number = 0
  ): Promise<RotaTemplateItem | null> {
    const { data, error } = await this.client
      .rpc('add_template_item', {
        template_uuid: templateId,
        ministry_uuid: ministryId,
        servers_needed_count: serversNeeded,
        sort_order_param: sortOrder
      })

    if (error) {
      this.handleError(error, 'adding template item')
      return null
    }

    // Fetch the created item
    const { data: item, error: itemError } = await this.client
      .from('rota_template_items')
      .select(`
        *,
        ministry:ministries(*)
      `)
      .eq('id', data.item_id)
      .single()

    if (itemError) {
      this.handleError(itemError, 'fetching template item')
      return null
    }

    return item
  }

  async duplicateTemplate(templateId: string, targetDates: string[]): Promise<boolean> {
    const { error } = await this.client
      .rpc('duplicate_rota_template', {
        template_uuid: templateId,
        target_dates: targetDates
      })

    if (error) {
      this.handleError(error, 'duplicating rota template')
      return false
    }

    return true
  }

  async deleteTemplateItem(itemId: string): Promise<boolean> {
    const { error } = await this.client
      .from('rota_template_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      this.handleError(error, 'deleting template item')
      return false
    }

    return true
  }

  async updateTemplateItem(
    itemId: string, 
    updates: Partial<Pick<RotaTemplateItem, 'servers_needed' | 'sort_order'>>
  ): Promise<RotaTemplateItem | null> {
    const { data, error } = await this.client
      .from('rota_template_items')
      .update(updates)
      .eq('id', itemId)
      .select(`
        *,
        ministry:ministries(*)
      `)
      .single()

    if (error) {
      this.handleError(error, 'updating template item')
      return null
    }

    return data
  }
} 