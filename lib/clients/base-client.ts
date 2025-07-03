import { createClient } from '@/utils/supabase/client'

export abstract class BaseClient {
  protected client = createClient()

  protected handleError(error: any, operation: string): void {
    console.error(`Error in ${operation}:`, error)
  }

  protected handleSuccess(operation: string): void {
    console.log(`${operation} completed successfully`)
  }
} 