'use client'

import { useState } from 'react'
import { Container, Title, Text, TextInput, Button, Stack, Alert, Paper } from '@mantine/core'
import { IconMail, IconCheck } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email)
      setSent(true)
    } catch (err) {
      setError('Failed to send sign-in link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Navigation>
      <Container size="sm" py="xl">
        <Stack align="center" py="xl">
          <Paper shadow="md" p="xl" radius="md" withBorder w="100%">
            <Stack gap="lg">
              <div>
                <Title order={1} ta="center">Sign In to Church Hub</Title>
                <Text c="dimmed" ta="center" mt="xs">
                  Enter your email to receive a sign-in link
                </Text>
              </div>

              {sent ? (
                <Alert icon={<IconCheck size={16} />} title="Check your email" color="green">
                  We've sent a sign-in link to <strong>{email}</strong>. 
                  Click the link in your email to sign in to Church Hub.
                </Alert>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                    {error && (
                      <Alert color="red" title="Error">
                        {error}
                      </Alert>
                    )}
                    
                    <TextInput
                      label="Email address"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      leftSection={<IconMail size={16} />}
                    />

                    <Button 
                      type="submit" 
                      loading={loading}
                      fullWidth
                    >
                      Send Sign-in Link
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Navigation>
  )
} 