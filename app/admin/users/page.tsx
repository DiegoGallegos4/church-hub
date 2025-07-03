'use client'

import { useState, useEffect } from 'react'
import { 
  Title, Text, Button, Card, Stack, Group, Badge, Modal, TextInput, 
  Select, Grid, ActionIcon, Skeleton, Alert, Switch 
} from '@mantine/core'
import { IconEdit, IconTrash, IconUsers, IconCrown, IconUserCheck } from '@tabler/icons-react'
import { profileClient, UserProfile } from '@/lib'
import { notifications } from '@mantine/notifications'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [isServer, setIsServer] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const users = await profileClient.getAllProfiles()
      setUsers(users)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    try {
      const userData = {
        name: fullName,
        email,
        role,
        is_server: isServer,
      }

      if (editingUser) {
        const updatedUser = await profileClient.updateProfile(editingUser.id, userData)
        if (!updatedUser) throw new Error('Failed to update user')
      } else {
        // For creating new users, we need to generate a UUID and create the profile
        const newUserId = crypto.randomUUID()
        const newUser = await profileClient.createProfile(newUserId, {
          id: newUserId,
          ...userData,
          is_server: false
        })
        if (!newUser) throw new Error('Failed to create user')
      }

      notifications.show({
        title: 'Success',
        message: `User ${editingUser ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      resetForm()
      fetchUsers()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save user',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      })

      fetchUsers()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete user',
        color: 'red',
      })
    }
  }

  const handleRoleToggle = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const updatedUser = await profileClient.updateProfileRole(userId, newRole)
      if (!updatedUser) throw new Error('Failed to update user role')

      notifications.show({
        title: 'Success',
        message: 'User role updated successfully',
        color: 'green',
      })

      fetchUsers()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update user role',
        color: 'red',
      })
    }
  }

  const handleServerToggle = async (userId: string, isServer: boolean) => {
    try {
      const updatedUser = await profileClient.updateProfile(userId, { is_server: isServer })
      if (!updatedUser) throw new Error('Failed to update server status')

      notifications.show({
        title: 'Success',
        message: `User ${isServer ? 'marked as' : 'removed from'} server`,
        color: 'green',
      })

      fetchUsers()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update server status',
        color: 'red',
      })
    }
  }

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setRole('user')
    setIsServer(false)
    setEditingUser(null)
    setModalOpen(false)
  }

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user)
    setFullName(user.name || '')
    setEmail(user.email || '')
    setRole(user.role || 'user')
    setIsServer(user.is_server || false)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <Stack gap="xl">
        <Title order={1}>Manage Users</Title>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 4 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={1}>Manage Users</Title>
          <Text c="dimmed">Manage church members and their roles.</Text>
        </div>
        <Button
          leftSection={<IconUsers size={16} />}
          onClick={() => setModalOpen(true)}
        >
          New User
        </Button>
      </Group>

      {users.length === 0 ? (
        <Alert color="blue" title="No Users">
          No users found. Create your first user to get started.
        </Alert>
      ) : (
        <Grid>
          {users.map((user) => (
            <Grid.Col key={user.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>{user.name}</Title>
                    <Group>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => openEditModal(user)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(user.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>

                  <Group>
                    <Badge 
                      color={user.role === 'admin' ? 'red' : 'blue'}
                      leftSection={user.role === 'admin' ? <IconCrown size={12} /> : <IconUsers size={12} />}
                    >
                      {user.role}
                    </Badge>
                    {user.is_server && (
                      <Badge 
                        color="green"
                        leftSection={<IconUserCheck size={12} />}
                      >
                        Server
                      </Badge>
                    )}
                  </Group>

                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm">Admin Role</Text>
                      <Switch
                        checked={user.role === 'admin'}
                        onChange={(event) => handleRoleToggle(user.id, event.currentTarget.checked ? 'admin' : 'user')}
                        size="sm"
                      />
                    </Group>
                    
                    <Group justify="space-between">
                      <Text size="sm">Server Status</Text>
                      <Switch
                        checked={user.is_server || false}
                        onChange={(event) => handleServerToggle(user.id, event.currentTarget.checked)}
                        size="sm"
                      />
                    </Group>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={resetForm}
        title={editingUser ? 'Edit User' : 'New User'}
      >
        <Stack gap="md">
          <TextInput
            label="Full Name"
            placeholder="Enter full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <TextInput
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />

          <Select
            label="Role"
            value={role}
            onChange={(value) => setRole(value as 'user' | 'admin')}
            data={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
          />

          <Switch
            label="Server Status"
            checked={isServer}
            onChange={(event) => setIsServer(event.currentTarget.checked)}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
} 