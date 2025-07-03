import { BaseClient } from './base-client'
import { User } from '@supabase/supabase-js'

export class AuthClient extends BaseClient {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.client.auth.getUser()
    if (error) {
      this.handleError(error, 'getting current user')
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

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) {
      throw error
    }
  }

  async signInWithOtp(email: string) {
    const { data, error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })
    return { data, error }
  }
} 