import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createAuthClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  console.log('Auth confirm route called with:', { token_hash, type, next })

  if (!token_hash || !type) {
    console.error('Missing token_hash or type:', { token_hash, type })
    redirect('/error?message=' + encodeURIComponent('Invalid confirmation link'))
  }

  const supabase = await createAuthClient()
  
  console.log('Verifying OTP with Supabase...')
  
  const { data, error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  console.log('OTP verification result:', { data, error })

  if (error) {
    console.error('OTP verification failed:', error)
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  console.log('OTP verification successful, redirecting to:', next)
  // redirect user to specified redirect URL or root of app
  redirect(next)
} 