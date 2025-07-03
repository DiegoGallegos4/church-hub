'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  TextInput, 
  Button, 
  Group,
  Alert
} from '@mantine/core'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { notifications } from '@mantine/notifications'

export default function ProfilePage() {
  const { user, profile, loading, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      notifications.show({
        title: 'Error',
        message: 'Name is required',
        color: 'red',
      })
      return
    }

    setIsSaving(true)
    try {
      const updateData: Partial<typeof profile> = {
        name: trimmedName
      }
      
      // Only include phone if it's not empty
      const trimmedPhone = phone.trim()
      if (trimmedPhone) {
        updateData.phone = trimmedPhone
      } else {
        updateData.phone = undefined
      }
      
      console.log('Updating profile with:', updateData)
      
      await updateProfile(updateData)

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      })

      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || '')
      setPhone(profile.phone || '')
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <Navigation>
        <Container size="sm" py="xl">
          <LoadingSpinner />
        </Container>
      </Navigation>
    )
  }

  if (!user) {
    return (
      <Navigation>
        <Container size="sm" py="xl">
          <Alert color="red" title="Access Denied">
            You must be signed in to view your profile.
          </Alert>
        </Container>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <Container size="sm" py="xl">
        <Stack align="center" py="xl">
          <Paper shadow="md" p="xl" radius="md" withBorder w="100%">
            <Stack gap="lg">
              <div>
                <Title order={1} ta="center">Your Profile</Title>
                <Text c="dimmed" ta="center" mt="xs">
                  Manage your account information
                </Text>
              </div>
              
              {isEditing ? (
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    value={user.email || ''}
                    disabled
                    description="Email cannot be changed"
                  />

                  <TextInput
                    label="Name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <TextInput
                    label="Phone (Optional)"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Stack>
              ) : (
                <Stack gap="md">
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Email</Text>
                    <Text>{user.email || 'N/A'}</Text>
                    <Text size="xs" c="dimmed">Email cannot be changed</Text>
                  </div>

                  <div>
                    <Text size="sm" fw={500} c="dimmed">Name</Text>
                    <Text>{profile?.name || 'Not set'}</Text>
                  </div>

                  <div>
                    <Text size="sm" fw={500} c="dimmed">Phone</Text>
                    <Text>{profile?.phone || 'Not provided'}</Text>
                  </div>

                  <div>
                    <Text size="sm" fw={500} c="dimmed">User ID</Text>
                    <Text size="sm" c="dimmed">{user.id}</Text>
                  </div>
                  
                  <div>
                    <Text size="sm" fw={500} c="dimmed">Account Created</Text>
                    <Text size="sm" c="dimmed">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </div>

                  {profile && (
                    <>
                      <div>
                        <Text size="sm" fw={500} c="dimmed">Role</Text>
                        <Text size="sm" c="dimmed">
                          {profile.role === 'admin' ? 'Administrator' : 'User'}
                        </Text>
                      </div>
                      
                      <div>
                        <Text size="sm" fw={500} c="dimmed">Server Status</Text>
                        <Text size="sm" c="dimmed">
                          {profile.is_server ? 'Server' : 'Not a server'}
                        </Text>
                      </div>
                    </>
                  )}
                </Stack>
              )}

              <Group justify="flex-end">
                {isEditing ? (
                  <>
                    <Button variant="light" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} loading={isSaving}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Navigation>
  )
} 