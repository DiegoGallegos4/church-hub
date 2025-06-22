'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Card, Stack, Badge, Group, Button, Alert, Skeleton, Grid } from '@mantine/core'
import { IconCalendar, IconUsers, IconCheck, IconX } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { supabase, RotaSlot, Ministry, ServerAssignment } from '@/lib/supabase'
import { format } from 'date-fns'
import { notifications } from '@mantine/notifications'

export default function RotaPage() {
  const { user, profile } = useAuth()
  const [rotaSlots, setRotaSlots] = useState<RotaSlot[]>([])
  const [assignments, setAssignments] = useState<ServerAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRotaData()
    }
  }, [user])

  const fetchRotaData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch upcoming rota slots
      const { data: slotsData } = await supabase
        .from('rota_slots')
        .select(`
          *,
          ministry:ministries(*)
        `)
        .gte('date', today)
        .order('date')

      setRotaSlots(slotsData || [])

      // Fetch user's assignments
      const { data: assignmentsData } = await supabase
        .from('server_assignments')
        .select(`
          *,
          slot:rota_slots(*)
        `)
        .eq('user_id', user?.id)
        .eq('is_assigned', true)

      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error fetching rota data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('server_assignments')
        .insert({
          slot_id: slotId,
          user_id: user?.id,
          is_assigned: true
        })

      if (error) {
        throw error
      }

      notifications.show({
        title: 'Success',
        message: 'You have been assigned to this slot.',
        color: 'green',
      })

      fetchRotaData() // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to sign up for this slot.',
        color: 'red',
      })
    }
  }

  const handleRemove = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('server_assignments')
        .update({ is_assigned: false })
        .eq('slot_id', slotId)
        .eq('user_id', user?.id)

      if (error) {
        throw error
      }

      notifications.show({
        title: 'Success',
        message: 'You have been removed from this slot.',
        color: 'green',
      })

      fetchRotaData() // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove from this slot.',
        color: 'red',
      })
    }
  }

  const isAssignedToSlot = (slotId: string) => {
    return assignments.some(assignment => assignment.slot_id === slotId)
  }

  const getAssignedCount = (slotId: string) => {
    return assignments.filter(assignment => assignment.slot_id === slotId).length
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

  if (loading) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Stack gap="lg">
            <Skeleton height={40} width={200} />
            <Skeleton height={20} width={300} />
            <Skeleton height={200} />
            <Skeleton height={200} />
          </Stack>
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

          {rotaSlots.length === 0 ? (
            <Alert color="blue" title="No Upcoming Slots">
              There are no upcoming rota slots. Check back later or contact an administrator.
            </Alert>
          ) : (
            <Grid>
              {rotaSlots.map((slot) => {
                const isAssigned = isAssignedToSlot(slot.id)
                const assignedCount = getAssignedCount(slot.id)
                const availableSpots = slot.servers_needed - assignedCount

                return (
                  <Grid.Col key={slot.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Badge color="blue" leftSection={<IconCalendar size={12} />}>
                            {format(new Date(slot.date), 'MMM d, yyyy')}
                          </Badge>
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
          )}
        </Stack>
      </Container>
    </Navigation>
  )
} 