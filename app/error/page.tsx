'use client'

import { useEffect, useState } from 'react'
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const [errorMessage, setErrorMessage] = useState('There was an error with your authentication. Please try signing in again.')
  const searchParams = useSearchParams()

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setErrorMessage(decodeURIComponent(messageParam))
    }
  }, [searchParams])

  return (
    <Container size="sm" py="xl">
      <Stack align="center" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder w="100%">
          <Stack gap="lg" align="center">
            <IconAlertCircle size={48} color="red" />
            <div>
              <Title order={1} ta="center">Authentication Error</Title>
              <Text c="dimmed" ta="center" mt="xs">
                {errorMessage}
              </Text>
            </div>
            
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <Button>
                Go to Sign In
              </Button>
            </Link>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
} 