'use client'

import { useState } from 'react'
import { Container, Title, Text, TextInput, Button, Stack, Switch, Paper, Alert } from '@mantine/core'
import { IconUser, IconSave } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { notifications } from '@mantine/notifications'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    is_server: profile?.is_server || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Alert color="red" title="Access Denied">
            You must be signed in to view your profile.
          </Alert>
        </Container>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <div>
            <Title order={1}>Profile</Title>
            <Text c="dimmed">Update your personal information and preferences.</Text>
          </div>

          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <div>
                  <Title order={3} mb="md">Personal Information</Title>
                  
                  <Stack gap="md">
                    <TextInput
                      label="Email"
                      value={user.email || ''}
                      disabled
                      description="Email cannot be changed"
                    />
                    
                    <TextInput
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      leftSection={<IconUser size={16} />}
                    />
                    
                    <TextInput
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      leftSection={<IconUser size={16} />}
                    />
                  </Stack>
                </div>

                <div>
                  <Title order={3} mb="md">Serving Preferences</Title>
                  
                  <Switch
                    label="I am available to serve in ministries"
                    description="Enable this if you would like to be considered for serving opportunities"
                    checked={formData.is_server}
                    onChange={(e) => setFormData({ ...formData, is_server: e.currentTarget.checked })}
                  />
                </div>

                <Button 
                  type="submit" 
                  loading={loading}
                  leftSection={<IconSave size={16} />}
                  fullWidth
                >
                  Save Changes
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Navigation>
  )
} 