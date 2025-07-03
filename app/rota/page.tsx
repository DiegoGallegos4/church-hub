'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Card, Stack, Badge, Group, Button, Alert, Grid } from '@mantine/core'
import { IconCalendar, IconUsers, IconCheck, IconX } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { supabaseClient, Rota, RotaSlot, Ministry, ServerAssignment } from '@/lib'
import { format } from 'date-fns'
import { notifications } from '@mantine/notifications'

export default function RotaPage() {
  const { user, profile } = useAuth()
  const [rotas, setRotas] = useState<Rota[]>([])
  const [userAssignments, setUserAssignments] = useState<ServerAssignment[]>([])
  const [allAssignments, setAllAssignments] = useState<ServerAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRotaData()
    }
  }, [user])

  const fetchRotaData = async () => {
    try {
      // Use the new rota structure
      const rotaData = await supabaseClient.getRotas()
      setRotas(rotaData)
      
      // Fetch assignments for the current user
      if (user) {
        const userAssignmentsData = await supabaseClient.getUserAssignments(user.id)
        setUserAssignments(userAssignmentsData)
      }
      
      // Fetch all assignments for counting
      const allAssignmentsData = await supabaseClient.getServerAssignments()
      setAllAssignments(allAssignmentsData)
    } catch (error) {
      console.error('Error fetching rota data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (slotId: string) => {
    if (!user) return

    try {
      // Check if user is already assigned to this slot
      const existingAssignment = userAssignments.find((a: ServerAssignment) => a.slot_id === slotId)
      if (existingAssignment) {
        notifications.show({
          title: 'Already Assigned',
          message: 'You are already assigned to this slot.',
          color: 'yellow',
        })
        return
      }

      // Create new assignment
      const assignment = await supabaseClient.createServerAssignment({
        slot_id: slotId,
        user_id: user.id,
        is_assigned: true,
      })

      if (assignment) {
        notifications.show({
          title: 'Success',
          message: 'You have been assigned to this slot.',
          color: 'green',
        })
        
        // Refresh data
        fetchRotaData()
      } else {
        throw new Error('Failed to create assignment')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to sign up for this slot.',
        color: 'red',
      })
    }
  }

  const handleRemove = async (slotId: string) => {
    if (!user) return

    try {
      // Find the assignment for this user and slot
      const assignment = userAssignments.find((a: ServerAssignment) => a.slot_id === slotId && a.user_id === user.id)
      
      if (!assignment) {
        notifications.show({
          title: 'Not Assigned',
          message: 'You are not assigned to this slot.',
          color: 'yellow',
        })
        return
      }

      // Delete the assignment
      const success = await supabaseClient.deleteServerAssignment(assignment.id)

      if (success) {
        notifications.show({
          title: 'Success',
          message: 'You have been removed from this slot.',
          color: 'green',
        })
        
        // Refresh data
        fetchRotaData()
      } else {
        throw new Error('Failed to remove assignment')
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to remove from this slot.',
        color: 'red',
      })
    }
  }

  const isAssignedToSlot = (slotId: string) => {
    return userAssignments.some((assignment: ServerAssignment) => assignment.slot_id === slotId)
  }

  const getAssignedCount = (slotId: string) => {
    return allAssignments.filter((assignment: ServerAssignment) => assignment.slot_id === slotId).length
  }

  const getAssignedUsers = (slotId: string) => {
    return allAssignments.filter((assignment: ServerAssignment) => assignment.slot_id === slotId)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Alert color="red" title="Access Denied">
            You must be signed in to view the rota.
          </Alert>
        </Container>
      </Navigation>
    )
  }

  return (
    <Navigation>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <div>
            <Title order={1}>Church Rota</Title>
            <Text c="dimmed">View and manage your serving schedule.</Text>
          </div>



          {!profile?.is_server && (
            <Alert color="blue" title="Not a Server">
              You are not marked as a server. Update your profile to enable serving opportunities.
            </Alert>
          )}

          {rotas.length === 0 ? (
            <Alert color="blue" title="No Upcoming Rotas">
              There are no upcoming rotas. Check back later or contact an administrator.
            </Alert>
          ) : (
            <Stack gap="xl">
              {rotas.map((rota) => (
                <Card key={rota.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="lg">
                    <div>
                      <Group justify="space-between">
                        <div>
                          <Title order={2}>{rota.title || `Sunday Service - ${format(new Date(rota.date), 'MMM d, yyyy')}`}</Title>
                          <Text c="dimmed">{rota.description}</Text>
                        </div>
                        <Badge color="blue" leftSection={<IconCalendar size={12} />}>
                          {format(new Date(rota.date), 'MMM d, yyyy')}
                        </Badge>
                      </Group>
                    </div>

                    {rota.slots && rota.slots.length > 0 ? (
                      <Grid>
                        {rota.slots.map((slot) => {
                          const isAssigned = isAssignedToSlot(slot.id)
                          const assignedCount = getAssignedCount(slot.id)
                          const availableSpots = slot.servers_needed - assignedCount

                          return (
                            <Grid.Col key={slot.id} span={{ base: 12, md: 6, lg: 4 }}>
                              <Card shadow="sm" padding="md" radius="md" withBorder>
                                <Stack gap="md">
                                  <Group justify="space-between">
                                    <Badge color={availableSpots > 0 ? 'green' : 'red'}>
                                      {availableSpots} spots left
                                    </Badge>
                                  </Group>

                                  <div>
                                    <Text fw={600} size="lg">
                                      {slot.ministry?.name}
                                    </Text>
                                    {slot.ministry?.description && (
                                      <Text size="sm" c="dimmed">
                                        {slot.ministry.description}
                                      </Text>
                                    )}
                                  </div>

                                  <Group>
                                    <IconUsers size={14} />
                                    <Text size="sm" c="dimmed">
                                      {assignedCount}/{slot.servers_needed} assigned
                                    </Text>
                                  </Group>

                                  {assignedCount > 0 && (
                                    <Text size="xs" c="dimmed">
                                      {getAssignedUsers(slot.id).length} people signed up
                                    </Text>
                                  )}

                                  {profile?.is_server && (
                                    <Group>
                                      {isAssigned ? (
                                        <Button 
                                          variant="outline" 
                                          color="red" 
                                          leftSection={<IconX size={16} />}
                                          onClick={() => handleRemove(slot.id)}
                                          fullWidth
                                        >
                                          Remove Me
                                        </Button>
                                      ) : (
                                        <Button 
                                          leftSection={<IconCheck size={16} />}
                                          onClick={() => handleSignUp(slot.id)}
                                          disabled={availableSpots <= 0}
                                          fullWidth
                                        >
                                          Sign Up
                                        </Button>
                                      )}
                                    </Group>
                                  )}
                                </Stack>
                              </Card>
                            </Grid.Col>
                          )
                        })}
                      </Grid>
                    ) : (
                      <Alert color="blue" title="No Slots">
                        No ministry slots have been created for this rota yet.
                      </Alert>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Navigation>
  )
} 