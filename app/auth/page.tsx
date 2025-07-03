'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, TextInput, Button, Stack, Alert, Paper } from '@mantine/core'
import { IconMail, IconCheck } from '@tabler/icons-react'
import { Navigation } from '@/components/Navigation/Navigation'
import { useSearchParams } from 'next/navigation'
import { sendOtp } from './actions'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  // Handle error and success messages from URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    console.log('URL params:', { errorParam, messageParam })
    
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam)
      console.log('Setting error:', decodedError)
      setError(decodedError)
    }
    
    if (messageParam) {
      const decodedMessage = decodeURIComponent(messageParam)
      console.log('Setting message:', decodedMessage)
      setMessage(decodedMessage)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with email:', email)
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('email', email)
      console.log('Calling sendOtp action...')
      await sendOtp(formData)
    } catch (err: any) {
      console.error('Client-side error:', err)
      setError(err.message || 'Failed to send verification code. Please try again.')
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
                  Enter your email to receive a verification code
                </Text>
              </div>

              {message ? (
                <Alert icon={<IconCheck size={16} />} title="Check your email" color="green">
                  {message}
                  <br />
                  <br />
                  <strong>Important:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Check your spam/junk folder if you don't see the email</li>
                    <li>The code will expire in 1 hour for security</li>
                    <li>Click the link in the email to complete your sign-in</li>
                  </ul>
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
                      Send Verification Code
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