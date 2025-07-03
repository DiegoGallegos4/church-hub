'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient, UserProfile, authClient, profileClient } from '@/lib'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext: Initial session:', session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session)
      setLoading(true)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    // Fallback: If no session after 5 seconds, set loading to false (but do not set user to null)
    const timeout = setTimeout(() => {
      setLoading(false)
      console.warn('AuthContext fallback: Session restoration is taking longer than expected.')
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await profileClient.getProfile(userId)
      
      if (profileData) {
        setProfile(profileData)
      } else {
        // Profile not found, create one
        const authUser = await authClient.getCurrentUser()
        if (authUser) {
          const newProfile = await profileClient.createProfile(userId, authUser)
          if (newProfile) {
            setProfile(newProfile)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set profile to null on error to prevent infinite loading
      setProfile(null)
    }
  }

  const signOut = async () => {
    await authClient.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return

    console.log('AuthContext: Updating profile for user', user.id, 'with updates:', updates)
    
    const updatedProfile = await profileClient.updateProfile(user.id, updates)
    if (updatedProfile) {
      console.log('AuthContext: Profile updated successfully, setting new profile:', updatedProfile)
      setProfile(updatedProfile)
    } else {
      console.error('AuthContext: Failed to update profile')
    }
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 