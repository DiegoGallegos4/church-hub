import { BaseClient } from './base-client'
import { Devotional, DevotionalIdea, CreateDevotionalData, BibleReading } from '@/lib/supabase'

export class DevotionalClient extends BaseClient {
  async getDevotionals(): Promise<Devotional[]> {
    const { data, error } = await this.client
      .from('devotionals')
      .select(`
        *,
        devotional_ideas(*),
        bible_readings(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      this.handleError(error, 'fetching devotionals')
      return []
    }

    return data || []
  }

  async getDevotional(id: string): Promise<Devotional | null> {
    const { data, error } = await this.client
      .from('devotionals')
      .select(`
        *,
        devotional_ideas(*),
        bible_readings(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      this.handleError(error, 'fetching devotional')
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
      this.handleError(error, 'creating devotional')
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
      this.handleError(devotionalError, 'creating devotional')
      return null
    }

    // If there are Bible readings, create them
    if (devotionalData.bible_readings && devotionalData.bible_readings.length > 0) {
      const readingsData = devotionalData.bible_readings.map(reading => ({
        devotional_id: devotional.id,
        verse_reference: reading.verse_reference,
        verse_text: reading.verse_text,
        commentary: reading.commentary
      }))

      const { error: readingsError } = await this.client
        .from('bible_readings')
        .insert(readingsData)

      if (readingsError) {
        this.handleError(readingsError, 'creating bible readings')
        // Note: The devotional was created but readings failed
      }
    }

    // If there are devotional ideas, create them
    console.log('Devotional ideas in createDevotionalWithIdeas:', devotionalData.devotional_ideas)
    if (devotionalData.devotional_ideas && devotionalData.devotional_ideas.length > 0) {
      const ideasData = devotionalData.devotional_ideas.map(idea => ({
        devotional_id: devotional.id,
        title: idea.title,
        content_type: idea.content_type,
        content: idea.content,
        description: idea.description
      }))
      console.log('Ideas data to insert:', ideasData)

      const { error: ideasError } = await this.client
        .from('devotional_ideas')
        .insert(ideasData)

      if (ideasError) {
        console.error('Error creating devotional ideas:', ideasError)
        this.handleError(ideasError, 'creating devotional ideas')
        // Note: The devotional was created but ideas failed
        // You might want to delete the devotional or handle this differently
      } else {
        console.log('Devotional ideas created successfully')
      }
    } else {
      console.log('No devotional ideas to create')
    }

    // Return the devotional with ideas
    return this.getDevotional(devotional.id)
  }

  async updateDevotional(id: string, updates: Partial<Devotional>): Promise<Devotional | null> {
    const { data, error } = await this.client
      .from('devotionals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        devotional_ideas(*),
        bible_readings(*)
      `)
      .single()

    if (error) {
      this.handleError(error, 'updating devotional')
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
      this.handleError(error, 'deleting devotional')
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
      this.handleError(error, 'fetching devotional ideas')
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
      this.handleError(error, 'creating devotional idea')
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
      this.handleError(error, 'updating devotional idea')
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
      this.handleError(error, 'deleting devotional idea')
      return false
    }

    return true
  }

  async deleteDevotionalIdeas(devotionalId: string): Promise<boolean> {
    const { error } = await this.client
      .from('devotional_ideas')
      .delete()
      .eq('devotional_id', devotionalId)

    if (error) {
      this.handleError(error, 'deleting devotional ideas')
      return false
    }

    return true
  }

  // ============================================================================
  // BIBLE READINGS
  // ============================================================================

  async getBibleReadings(devotionalId: string): Promise<BibleReading[]> {
    const { data, error } = await this.client
      .from('bible_readings')
      .select('*')
      .eq('devotional_id', devotionalId)
      .order('created_at', { ascending: true })

    if (error) {
      this.handleError(error, 'fetching bible readings')
      return []
    }

    return data || []
  }

  async createBibleReading(readingData: Omit<BibleReading, 'id' | 'created_at' | 'updated_at'>): Promise<BibleReading | null> {
    const { data, error } = await this.client
      .from('bible_readings')
      .insert(readingData)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'creating bible reading')
      return null
    }

    return data
  }

  async updateBibleReading(id: string, updates: Partial<BibleReading>): Promise<BibleReading | null> {
    const { data, error } = await this.client
      .from('bible_readings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      this.handleError(error, 'updating bible reading')
      return null
    }

    return data
  }

  async deleteBibleReading(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('bible_readings')
      .delete()
      .eq('id', id)

    if (error) {
      this.handleError(error, 'deleting bible reading')
      return false
    }

    return true
  }

  async deleteBibleReadings(devotionalId: string): Promise<boolean> {
    const { error } = await this.client
      .from('bible_readings')
      .delete()
      .eq('devotional_id', devotionalId)

    if (error) {
      this.handleError(error, 'deleting bible readings')
      return false
    }

    return true
  }
} 