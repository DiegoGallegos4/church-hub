'use client'

import { useEffect, useState } from 'react'
import { Container, Alert, Loader, Center } from '@mantine/core'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Center>
            <Loader size="lg" />
          </Center>
        </Container>
      </Navigation>
    )
  }

  if (!user) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Alert color="red" title="Access Denied">
            You must be signed in to access admin features.
          </Alert>
        </Container>
      </Navigation>
    )
  }

  if (!isAdmin) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Alert color="red" title="Access Denied">
            You must be an administrator to access this area.
          </Alert>
        </Container>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <Container size="lg" py="xl">
        {children}
      </Container>
    </Navigation>
  )
} 