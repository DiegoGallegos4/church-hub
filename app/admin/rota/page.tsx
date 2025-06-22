'use client'

import { useState, useEffect } from 'react'
import { 
  Title, Text, Button, Card, Stack, Group, Badge, Modal, TextInput, 
  Textarea, NumberInput, Select, Grid, ActionIcon, Skeleton, Alert, Tabs 
} from '@mantine/core'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconUsers } from '@tabler/icons-react'
import { supabase, Ministry, RotaSlot, ServerAssignment } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { format } from 'date-fns'

export default function AdminRotaPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [rotaSlots, setRotaSlots] = useState<RotaSlot[]>([])
  const [assignments, setAssignments] = useState<ServerAssignment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Ministry modal state
  const [ministryModalOpen, setMinistryModalOpen] = useState(false)
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [ministryName, setMinistryName] = useState('')
  const [ministryDescription, setMinistryDescription] = useState('')
  
  // Slot modal state
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<RotaSlot | null>(null)
  const [selectedMinistry, setSelectedMinistry] = useState<string>('')
  const [slotDate, setSlotDate] = useState('')
  const [serversNeeded, setServersNeeded] = useState<number>(1)

  useEffect(() => {
    fetchRotaData()
  }, [])

  const fetchRotaData = async () => {
    try {
      // Fetch ministries
      const { data: ministriesData } = await supabase
        .from('ministries')
        .select('*')
        .order('name')

      setMinistries(ministriesData || [])

      // Fetch rota slots
      const { data: slotsData } = await supabase
        .from('rota_slots')
        .select(`
          *,
          ministry:ministries(*)
        `)
        .order('date', { ascending: false })

      setRotaSlots(slotsData || [])

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('server_assignments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('is_assigned', true)

      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error fetching rota data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMinistrySubmit = async () => {
    if (!ministryName.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a ministry name',
        color: 'red',
      })
      return
    }

    try {
      const ministryData = {
        name: ministryName,
        description: ministryDescription || null,
      }

      if (editingMinistry) {
        const { error } = await supabase
          .from('ministries')
          .update(ministryData)
          .eq('id', editingMinistry.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ministries')
          .insert(ministryData)

        if (error) throw error
      }

      notifications.show({
        title: 'Success',
        message: `Ministry ${editingMinistry ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      resetMinistryForm()
      fetchRotaData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save ministry',
        color: 'red',
      })
    }
  }

  const handleSlotSubmit = async () => {
    if (!selectedMinistry || !slotDate || serversNeeded < 1) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    try {
      const slotData = {
        ministry_id: selectedMinistry,
        date: slotDate,
        servers_needed: serversNeeded,
      }

      if (editingSlot) {
        const { error } = await supabase
          .from('rota_slots')
          .update(slotData)
          .eq('id', editingSlot.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('rota_slots')
          .insert(slotData)

        if (error) throw error
      }

      notifications.show({
        title: 'Success',
        message: `Slot ${editingSlot ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      resetSlotForm()
      fetchRotaData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save slot',
        color: 'red',
      })
    }
  }

  const handleMinistryDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Ministry deleted successfully',
        color: 'green',
      })

      fetchRotaData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete ministry',
        color: 'red',
      })
    }
  }

  const handleSlotDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rota_slots')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Slot deleted successfully',
        color: 'green',
      })

      fetchRotaData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete slot',
        color: 'red',
      })
    }
  }

  const resetMinistryForm = () => {
    setMinistryName('')
    setMinistryDescription('')
    setEditingMinistry(null)
    setMinistryModalOpen(false)
  }

  const resetSlotForm = () => {
    setSelectedMinistry('')
    setSlotDate('')
    setServersNeeded(1)
    setEditingSlot(null)
    setSlotModalOpen(false)
  }

  const openMinistryEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry)
    setMinistryName(ministry.name)
    setMinistryDescription(ministry.description || '')
    setMinistryModalOpen(true)
  }

  const openSlotEdit = (slot: RotaSlot) => {
    setEditingSlot(slot)
    setSelectedMinistry(slot.ministry_id)
    setSlotDate(slot.date)
    setServersNeeded(slot.servers_needed)
    setSlotModalOpen(true)
  }

  const getAssignedCount = (slotId: string) => {
    return assignments.filter(assignment => assignment.slot_id === slotId).length
  }

  if (loading) {
    return (
      <Stack gap="xl">
        <Title order={1}>Manage Rota</Title>
        <Skeleton height={400} />
      </Stack>
    )
  }

  return (
    <Stack gap="xl">
      <Title order={1}>Manage Rota</Title>

      <Tabs defaultValue="ministries">
        <Tabs.List>
          <Tabs.Tab value="ministries" leftSection={<IconUsers size={16} />}>
            Ministries
          </Tabs.Tab>
          <Tabs.Tab value="slots" leftSection={<IconCalendar size={16} />}>
            Rota Slots
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ministries" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Manage church ministries and serving areas.</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setMinistryModalOpen(true)}
              >
                New Ministry
              </Button>
            </Group>

            {ministries.length === 0 ? (
              <Alert color="blue" title="No Ministries">
                Create your first ministry to get started.
              </Alert>
            ) : (
              <Grid>
                {ministries.map((ministry) => (
                  <Grid.Col key={ministry.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={3}>{ministry.name}</Title>
                          <Group>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => openMinistryEdit(ministry)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleMinistryDelete(ministry.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Group>

                        {ministry.description && (
                          <Text size="sm" c="dimmed">
                            {ministry.description}
                          </Text>
                        )}
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="slots" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Manage rota slots and assignments.</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setSlotModalOpen(true)}
              >
                New Slot
              </Button>
            </Group>

            {rotaSlots.length === 0 ? (
              <Alert color="blue" title="No Rota Slots">
                Create your first rota slot to get started.
              </Alert>
            ) : (
              <Grid>
                {rotaSlots.map((slot) => {
                  const assignedCount = getAssignedCount(slot.id)
                  const availableSpots = slot.servers_needed - assignedCount

                  return (
                    <Grid.Col key={slot.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Title order={3}>{slot.ministry?.name}</Title>
                            <Group>
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => openSlotEdit(slot)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleSlotDelete(slot.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Group>

                          <Group>
                            <Badge color="blue">
                              {format(new Date(slot.date), 'MMM d, yyyy')}
                            </Badge>
                            <Badge color={availableSpots > 0 ? 'green' : 'red'}>
                              {assignedCount}/{slot.servers_needed} assigned
                            </Badge>
                          </Group>

                          {slot.ministry?.description && (
                            <Text size="sm" c="dimmed">
                              {slot.ministry.description}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  )
                })}
              </Grid>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Ministry Modal */}
      <Modal
        opened={ministryModalOpen}
        onClose={resetMinistryForm}
        title={editingMinistry ? 'Edit Ministry' : 'New Ministry'}
      >
        <Stack gap="md">
          <TextInput
            label="Ministry Name"
            placeholder="Enter ministry name"
            value={ministryName}
            onChange={(e) => setMinistryName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter ministry description"
            value={ministryDescription}
            onChange={(e) => setMinistryDescription(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={resetMinistryForm}>
              Cancel
            </Button>
            <Button onClick={handleMinistrySubmit}>
              {editingMinistry ? 'Update' : 'Create'} Ministry
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Slot Modal */}
      <Modal
        opened={slotModalOpen}
        onClose={resetSlotForm}
        title={editingSlot ? 'Edit Slot' : 'New Slot'}
      >
        <Stack gap="md">
          <Select
            label="Ministry"
            placeholder="Select ministry"
            value={selectedMinistry}
            onChange={(value) => setSelectedMinistry(value || '')}
            data={ministries.map(m => ({ value: m.id, label: m.name }))}
            required
          />

          <TextInput
            label="Date"
            type="date"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            required
          />

          <NumberInput
            label="Servers Needed"
            placeholder="Number of servers needed"
            value={serversNeeded}
            onChange={(value) => setServersNeeded(typeof value === 'number' ? value : 1)}
            min={1}
            required
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={resetSlotForm}>
              Cancel
            </Button>
            <Button onClick={handleSlotSubmit}>
              {editingSlot ? 'Update' : 'Create'} Slot
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
} 