'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { 
  Title, Text, Button, Card, Stack, Group, Badge, TextInput, 
  Textarea, NumberInput, Select, Grid, ActionIcon, Skeleton, Alert, Tabs,
  Collapse, Divider, Modal, Switch
} from '@mantine/core'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconUsers, IconChevronDown, IconChevronUp, IconCopy } from '@tabler/icons-react'
import { Ministry, RotaSlot, ServerAssignment, Rota } from '@/lib'
import { createClient } from '@/utils/supabase/client'
import { notifications } from '@mantine/notifications'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function AdminRotaPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const supabaseClient = createClient()
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [rotas, setRotas] = useState<Rota[]>([])
  const [assignments, setAssignments] = useState<ServerAssignment[]>([])
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({})
  const [ministriesLoading, setMinistriesLoading] = useState(false)
  const [rotasLoading, setRotasLoading] = useState(false)
  
  // Ministry form state
  const [showMinistryForm, setShowMinistryForm] = useState(false)
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null)
  const [ministryName, setMinistryName] = useState('')
  const [ministryDescription, setMinistryDescription] = useState('')
  
  // Rota form state
  const [showRotaForm, setShowRotaForm] = useState(false)
  const [editingRota, setEditingRota] = useState<Rota | null>(null)
  const [rotaDate, setRotaDate] = useState('')
  const [rotaTitle, setRotaTitle] = useState('')
  const [rotaDescription, setRotaDescription] = useState('')
  
  // Slot form state
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [selectedRota, setSelectedRota] = useState<string>('')
  const [editingSlot, setEditingSlot] = useState<RotaSlot | null>(null)
  const [selectedMinistry, setSelectedMinistry] = useState<string>('')
  const [serversNeeded, setServersNeeded] = useState<number>(1)
  
  // Duplicate rota state
  const [showDuplicateForm, setShowDuplicateForm] = useState(false)
  const [duplicatingRota, setDuplicatingRota] = useState<Rota | null>(null)
  const [targetDate, setTargetDate] = useState('')
  
  // Confirmation modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'ministry' | 'rota' | 'slot', id: string, name: string} | null>(null)
  
  // Form refs for smooth scrolling
  const ministryFormRef = useRef<HTMLDivElement>(null)
  const rotaFormRef = useRef<HTMLDivElement>(null)
  const slotFormRef = useRef<HTMLDivElement>(null)
  const duplicateFormRef = useRef<HTMLDivElement>(null)

  const fetchMinistriesData = useCallback(async () => {
    setMinistriesLoading(true)
    try {
      const { data: ministriesData } = await supabaseClient
        .from('ministries')
        .select('*')
        .order('name')

      setMinistries(ministriesData || [])
    } catch (error) {
      console.error('Error fetching ministries data:', error)
    } finally {
      setMinistriesLoading(false)
    }
  }, [supabaseClient])

  const fetchRotasData = useCallback(async () => {
    setRotasLoading(true)
    try {
      // Fetch rotas with slots
      const { data: rotasData } = await supabaseClient
        .from('rotas')
        .select(`
          *,
          slots:rota_slots(
            *,
            ministry:ministries(*)
          )
        `)
        .order('date', { ascending: false })

      setRotas(rotasData || [])

      // Fetch assignments
      const { data: assignmentsData } = await supabaseClient
        .from('server_assignments')
        .select('*')
        .eq('is_assigned', true)

      setAssignments(assignmentsData || [])

      // Fetch user profiles for assigned servers
      if (assignmentsData && assignmentsData.length > 0) {
        const userIds = Array.from(new Set(assignmentsData.map(a => a.user_id)))
        const { data: profilesData } = await supabaseClient
          .from('user_profiles')
          .select('id, name, email')
          .in('id', userIds)
        
        const profilesMap: {[key: string]: any} = {}
        profilesData?.forEach(profile => {
          profilesMap[profile.id] = profile
        })
        setUserProfiles(profilesMap)
      }
    } catch (error) {
      console.error('Error fetching rotas data:', error)
    } finally {
      setRotasLoading(false)
    }
  }, [supabaseClient])

  useEffect(() => {
    // Load both rotas and ministries data initially since ministries are needed for slot creation
    fetchRotasData()
    fetchMinistriesData()
  }, [fetchRotasData, fetchMinistriesData])

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
        const { error } = await supabaseClient
          .from('ministries')
          .update(ministryData)
          .eq('id', editingMinistry.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('ministries')
          .insert(ministryData)

        if (error) throw error
      }

      notifications.show({
        title: 'Success',
        message: `Ministry ${editingMinistry ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      closeAllForms()
      fetchMinistriesData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save ministry',
        color: 'red',
      })
    }
  }

  const handleRotaSubmit = async () => {
    if (!rotaDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select a date',
        color: 'red',
      })
      return
    }

    try {
      const rotaData = {
        date: rotaDate,
        title: rotaTitle || null,
        description: rotaDescription || null,
      }

      if (editingRota) {
        const { error } = await supabaseClient
          .from('rotas')
          .update(rotaData)
          .eq('id', editingRota.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('rotas')
          .insert(rotaData)

        if (error) throw error
      }

      notifications.show({
        title: 'Success',
        message: `Rota ${editingRota ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      closeAllForms()
      fetchRotasData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save rota',
        color: 'red',
      })
    }
  }

  const handleSlotSubmit = async () => {
    if (!selectedRota || !selectedMinistry || serversNeeded < 1) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    // Check if ministry already exists in this rota (excluding current slot if editing)
    if (checkMinistryExistsInRota(selectedRota, selectedMinistry, editingSlot?.id)) {
      const ministryName = ministries.find(m => m.id === selectedMinistry)?.name || 'this ministry'
      notifications.show({
        title: 'Error',
        message: `${ministryName} is already assigned to this rota. Each ministry can only be assigned once per rota.`,
        color: 'red',
      })
      return
    }

    try {
      const slotData = {
        rota_id: selectedRota,
        ministry_id: selectedMinistry,
        servers_needed: serversNeeded,
      }

      if (editingSlot) {
        const { error } = await supabaseClient
          .from('rota_slots')
          .update(slotData)
          .eq('id', editingSlot.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('rota_slots')
          .insert(slotData)

        if (error) throw error
      }

      notifications.show({
        title: 'Success',
        message: `Slot ${editingSlot ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      closeAllForms()
      fetchRotasData()
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
      const { error } = await supabaseClient
        .from('ministries')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Ministry deleted successfully',
        color: 'green',
      })

      fetchMinistriesData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete ministry',
        color: 'red',
      })
    }
  }

  const handleRotaDelete = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('rotas')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Rota deleted successfully',
        color: 'green',
      })

      fetchRotasData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete rota',
        color: 'red',
      })
    }
  }

  const handleSlotDelete = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('rota_slots')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Slot deleted successfully',
        color: 'green',
      })

      fetchRotasData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete slot',
        color: 'red',
      })
    }
  }

  const handleDuplicateRota = async () => {
    if (!duplicatingRota || !targetDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select a target date',
        color: 'red',
      })
      return
    }

    try {
      const { data, error } = await supabaseClient
        .rpc('duplicate_rota', {
          source_rota_uuid: duplicatingRota.id,
          target_date: targetDate
        })

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: `Rota duplicated successfully to ${format(new Date(targetDate), 'MMM d, yyyy')}`,
        color: 'green',
      })

      closeAllForms()
      fetchRotasData()
    } catch (error: any) {
      console.error('Error duplicating rota:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to duplicate rota',
        color: 'red',
      })
    }
  }

  const handleToggleRotaStatus = async (rotaId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('rotas')
        .update({ is_active: !currentStatus })
        .eq('id', rotaId)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: `Rota ${currentStatus ? 'disabled' : 'enabled'} successfully`,
        color: 'green',
      })

      fetchRotasData()
    } catch (error) {
      console.error('Error toggling rota status:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to update rota status',
        color: 'red',
      })
    }
  }

  // Calculate slot assignment status
  const getSlotAssignmentStatus = (slot: RotaSlot) => {
    const assignedCount = getAssignedCount(slot.id)
    const availableSpots = slot.servers_needed - assignedCount

    if (assignedCount >= slot.servers_needed) {
      return { status: 'complete', color: 'green', label: `Volunteers (${assignedCount}/${slot.servers_needed})` }
    } else if (assignedCount > 0) {
      return { status: 'partial', color: 'yellow', label: `Volunteers (${assignedCount}/${slot.servers_needed})` }
    } else {
      return { status: 'empty', color: 'yellow', label: `Volunteers (0/${slot.servers_needed})` }
    }
  }

  const resetMinistryForm = () => {
    setMinistryName('')
    setMinistryDescription('')
    setEditingMinistry(null)
    setShowMinistryForm(false)
  }

  const resetRotaForm = () => {
    setRotaDate('')
    setRotaTitle('')
    setRotaDescription('')
    setEditingRota(null)
    setShowRotaForm(false)
  }

  const resetSlotForm = () => {
    setSelectedRota('')
    setSelectedMinistry('')
    setServersNeeded(1)
    setEditingSlot(null)
    setShowSlotForm(false)
  }

  const resetDuplicateForm = () => {
    setTargetDate('')
    setDuplicatingRota(null)
    setShowDuplicateForm(false)
  }

  // Form state management - ensure only one form is open at a time
  const closeAllForms = () => {
    setShowMinistryForm(false)
    setShowRotaForm(false)
    setShowSlotForm(false)
    setShowDuplicateForm(false)
    setEditingMinistry(null)
    setEditingRota(null)
    setEditingSlot(null)
    setDuplicatingRota(null)
  }

  const scrollToForm = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
      // Focus the first input in the form
      const firstInput = ref.current?.querySelector('input, textarea, select')
      if (firstInput instanceof HTMLElement) {
        firstInput.focus()
      }
    }, 100)
  }

  const openMinistryForm = () => {
    closeAllForms()
    setShowMinistryForm(true)
    scrollToForm(ministryFormRef)
  }

  const openRotaForm = () => {
    closeAllForms()
    setShowRotaForm(true)
    scrollToForm(rotaFormRef)
  }

  const openSlotForm = () => {
    closeAllForms()
    setShowSlotForm(true)
    scrollToForm(slotFormRef)
  }

  const openDuplicateForm = (rota: Rota) => {
    closeAllForms()
    setDuplicatingRota(rota)
    setShowDuplicateForm(true)
    scrollToForm(duplicateFormRef)
  }

  // Confirmation handlers
  const confirmDelete = (type: 'ministry' | 'rota' | 'slot', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteModalOpen(true)
  }

  const handleConfirmedDelete = async () => {
    if (!deleteTarget) return

    try {
      switch (deleteTarget.type) {
        case 'ministry':
          await handleMinistryDelete(deleteTarget.id)
          break
        case 'rota':
          await handleRotaDelete(deleteTarget.id)
          break
        case 'slot':
          await handleSlotDelete(deleteTarget.id)
          break
      }
    } catch (error) {
      console.error('Error during confirmed delete:', error)
    } finally {
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    }
  }

  const openMinistryEdit = (ministry: Ministry) => {
    closeAllForms()
    setEditingMinistry(ministry)
    setMinistryName(ministry.name)
    setMinistryDescription(ministry.description || '')
    setShowMinistryForm(true)
  }

  const openRotaEdit = (rota: Rota) => {
    closeAllForms()
    setEditingRota(rota)
    setRotaDate(rota.date)
    setRotaTitle(rota.title || '')
    setRotaDescription(rota.description || '')
    setShowRotaForm(true)
  }

  const openSlotEdit = (slot: RotaSlot) => {
    closeAllForms()
    setEditingSlot(slot)
    setSelectedRota(slot.rota_id)
    setSelectedMinistry(slot.ministry_id)
    setServersNeeded(slot.servers_needed)
    setShowSlotForm(true)
  }

  const getAssignedCount = (slotId: string) => {
    return assignedServersMap[slotId]?.length || 0
  }

  // Memoize assigned servers to prevent unnecessary re-renders
  const assignedServersMap = useMemo(() => {
    const map: { [slotId: string]: any[] } = {}
    
    assignments.forEach((assignment: ServerAssignment) => {
      const profile = userProfiles[assignment.user_id]
      if (profile) {
        const serverData = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          displayName: profile.name || profile.email || 'Unknown User'
        }
        
        if (!map[assignment.slot_id]) {
          map[assignment.slot_id] = []
        }
        map[assignment.slot_id].push(serverData)
      }
    })
    
    return map
  }, [assignments, userProfiles])

  const getAssignedServers = (slotId: string) => {
    return assignedServersMap[slotId] || []
  }

  const checkMinistryExistsInRota = (rotaId: string, ministryId: string, excludeSlotId?: string) => {
    const rota = rotas.find(r => r.id === rotaId)
    if (!rota || !rota.slots) return false
    
    return rota.slots.some(slot => 
      slot.ministry_id === ministryId && 
      (!excludeSlotId || slot.id !== excludeSlotId)
    )
  }

  if (authLoading) {
    return <LoadingSpinner />
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <Stack gap="xl">
        <Title order={1}>Manage Rota</Title>
        <Alert color="red" title="Access Denied">
          You must be an administrator to access this page.
        </Alert>
      </Stack>
    )
  }

  return (
    <Stack gap="xl">
      <Title order={1}>Manage Rota</Title>

      <Tabs defaultValue="rotas">
        <Tabs.List>
          <Tabs.Tab value="rotas" leftSection={<IconCalendar size={16} />}>
            Rotas
          </Tabs.Tab>
          <Tabs.Tab value="ministries" leftSection={<IconUsers size={16} />}>
            Ministries
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="ministries" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Manage church ministries and serving areas.</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={openMinistryForm}
              >
                New Ministry
              </Button>
            </Group>

            {ministriesLoading && (
              <Skeleton height={200} />
            )}

            {/* Ministry Form */}
            <Collapse in={showMinistryForm}>
              <Card 
                ref={ministryFormRef} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderColor: showMinistryForm ? 'var(--mantine-color-blue-4)' : undefined,
                  borderWidth: showMinistryForm ? '2px' : undefined
                }}
              >
                <Stack gap="md">
                  <Title order={3}>{editingMinistry ? 'Edit Ministry' : 'New Ministry'}</Title>
                  
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
                    <Button variant="light" onClick={closeAllForms}>
                      Cancel
                    </Button>
                    <Button onClick={handleMinistrySubmit}>
                      {editingMinistry ? 'Update' : 'Create'} Ministry
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Collapse>

            {!ministriesLoading && (
              <>
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
                                  onClick={() => confirmDelete('ministry', ministry.id, ministry.name)}
                                  title="Delete Ministry"
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
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="rotas" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">Manage rotas and their slots.</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={openRotaForm}
              >
                New Rota
              </Button>
            </Group>

            {rotasLoading && (
              <Skeleton height={400} />
            )}

            {/* Rota Form */}
            <Collapse in={showRotaForm}>
              <Card 
                ref={rotaFormRef} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderColor: showRotaForm ? 'var(--mantine-color-blue-4)' : undefined,
                  borderWidth: showRotaForm ? '2px' : undefined
                }}
              >
                <Stack gap="md">
                  <Title order={3}>{editingRota ? 'Edit Rota' : 'New Rota'}</Title>
                  
                  <TextInput
                    label="Date"
                    type="date"
                    value={rotaDate}
                    onChange={(e) => setRotaDate(e.target.value)}
                    required
                  />

                  <TextInput
                    label="Title (Optional)"
                    placeholder="Enter rota title"
                    value={rotaTitle}
                    onChange={(e) => setRotaTitle(e.target.value)}
                  />

                  <Textarea
                    label="Description (Optional)"
                    placeholder="Enter rota description"
                    value={rotaDescription}
                    onChange={(e) => setRotaDescription(e.target.value)}
                    rows={3}
                  />

                  <Group justify="flex-end">
                    <Button variant="light" onClick={closeAllForms}>
                      Cancel
                    </Button>
                    <Button onClick={handleRotaSubmit}>
                      {editingRota ? 'Update' : 'Create'} Rota
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Collapse>

            {/* Slot Form */}
            <Collapse in={showSlotForm}>
              <Card 
                ref={slotFormRef} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderColor: showSlotForm ? 'var(--mantine-color-blue-4)' : undefined,
                  borderWidth: showSlotForm ? '2px' : undefined
                }}
              >
                <Stack gap="md">
                  <Title order={3}>{editingSlot ? 'Edit Slot' : 'New Slot'}</Title>
                  
                  <Select
                    label="Rota"
                    placeholder="Select rota"
                    value={selectedRota}
                    onChange={(value) => setSelectedRota(value || '')}
                    data={rotas.map(r => ({ value: r.id, label: `${r.title || 'Untitled'} - ${format(new Date(r.date), 'MMM d, yyyy')}` }))}
                    required
                  />

                  <Select
                    label="Ministry"
                    placeholder="Select ministry"
                    value={selectedMinistry}
                    onChange={(value) => setSelectedMinistry(value || '')}
                    data={ministries.map(m => {
                      const isAssigned = selectedRota ? checkMinistryExistsInRota(selectedRota, m.id, editingSlot?.id) : false
                      return {
                        value: m.id,
                        label: m.name,
                        disabled: isAssigned,
                        ...(isAssigned && { 
                          label: `${m.name} (Already assigned)`,
                          color: 'dimmed'
                        })
                      }
                    })}
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
                    <Button variant="light" onClick={closeAllForms}>
                      Cancel
                    </Button>
                    <Button onClick={handleSlotSubmit}>
                      {editingSlot ? 'Update' : 'Create'} Slot
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Collapse>

            {/* Duplicate Rota Form */}
            <Collapse in={showDuplicateForm}>
              <Card 
                ref={duplicateFormRef} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ 
                  borderColor: showDuplicateForm ? 'var(--mantine-color-blue-4)' : undefined,
                  borderWidth: showDuplicateForm ? '2px' : undefined
                }}
              >
                <Stack gap="md">
                  <Title order={3}>Duplicate Rota</Title>
                  
                  {duplicatingRota && (
                    <div>
                      <Text size="sm" fw={500} c="dimmed">Source Rota:</Text>
                      <Text>{duplicatingRota.title || 'Untitled'} - {format(new Date(duplicatingRota.date), 'MMM d, yyyy')}</Text>
                      {duplicatingRota.slots && (
                        <Text size="sm" c="dimmed">
                          {duplicatingRota.slots.length} slot{duplicatingRota.slots.length !== 1 ? 's' : ''} will be duplicated
                        </Text>
                      )}
                    </div>
                  )}

                  <TextInput
                    label="Target Date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />

                  <Group justify="flex-end">
                    <Button variant="light" onClick={closeAllForms}>
                      Cancel
                    </Button>
                    <Button onClick={handleDuplicateRota} color="blue">
                      Duplicate Rota
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Collapse>

            {!rotasLoading && (
              <>
                {rotas.length === 0 ? (
                  <Alert color="blue" title="No Rotas">
                    Create your first rota to get started.
                  </Alert>
                ) : (
              <Stack gap="lg">
                {rotas.map((rota) => (
                  <Card key={rota.id} shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Stack gap="xs">
                          <Group align="center" gap="sm">
                            <Title order={3}>
                              {rota.title || 'Untitled Rota'}
                            </Title>
                          </Group>
                          <Group>
                            <Badge color="blue">
                              {format(new Date(rota.date), 'MMM d, yyyy')}
                            </Badge>
                            {rota.description && (
                              <Text size="sm" c="dimmed">
                                {rota.description}
                              </Text>
                            )}
                          </Group>
                        </Stack>
                        <Group>
                          <Switch
                            size="sm"
                            checked={rota.is_active}
                            onChange={() => handleToggleRotaStatus(rota.id, rota.is_active)}
                            label={rota.is_active ? 'Active' : 'Inactive'}
                            styles={{
                              track: {
                                cursor: 'pointer',
                              },
                              thumb: {
                                cursor: 'pointer',
                              },
                            }}
                          />
                          <Button
                            variant="light"
                            size="sm"
                            leftSection={<IconPlus size={16} />}
                            onClick={() => {
                              setSelectedRota(rota.id)
                              openSlotForm()
                            }}
                          >
                            Add Slot
                          </Button>
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => openDuplicateForm(rota)}
                            title="Duplicate Rota"
                          >
                            <IconCopy size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => openRotaEdit(rota)}
                            title="Edit Rota"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => confirmDelete('rota', rota.id, rota.title || 'Untitled Rota')}
                            title="Delete Rota"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      {rota.slots && rota.slots.length > 0 ? (
                        <Stack gap="sm">
                          <Text size="sm" fw={500}>Slots:</Text>
                          <Grid>
                            {rota.slots.map((slot) => {
                              const assignedCount = getAssignedCount(slot.id)
                              const availableSpots = slot.servers_needed - assignedCount

                              return (
                                <Grid.Col key={slot.id} span={{ base: 12, md: 6, lg: 4 }}>
                                  <Card shadow="xs" padding="md" radius="sm" withBorder>
                                    <Stack gap="sm">
                                      <Group justify="space-between">
                                        <Title order={4}>{slot.ministry?.name}</Title>
                                        <Group>
                                          <ActionIcon
                                            variant="light"
                                            color="blue"
                                            size="sm"
                                            onClick={() => openSlotEdit(slot)}
                                          >
                                            <IconEdit size={14} />
                                          </ActionIcon>
                                          <ActionIcon
                                            variant="light"
                                            color="red"
                                            size="sm"
                                            onClick={() => confirmDelete('slot', slot.id, slot.ministry?.name || 'Slot')}
                                            title="Delete Slot"
                                          >
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>
                                      </Group>

                                      <Badge color={getSlotAssignmentStatus(slot).color}>
                                        {getSlotAssignmentStatus(slot).label}
                                      </Badge>

                                      {assignedCount > 0 && (
                                        <Stack gap="xs">
                                          <Text size="xs" fw={500} c="dimmed">Assigned Servers:</Text>
                                          {getAssignedServers(slot.id).map((server, index) => (
                                            <Text key={index} size="xs" c="dimmed">
                                              • {server.displayName}
                                            </Text>
                                          ))}
                                        </Stack>
                                      )}

                                      {slot.ministry?.description && (
                                        <Text size="xs" c="dimmed">
                                          {slot.ministry.description}
                                        </Text>
                                      )}
                                    </Stack>
                                  </Card>
                                </Grid.Col>
                              )
                            })}
                          </Grid>
                        </Stack>
                      ) : (
                        <Alert color="blue" title="No Slots">
                          Add slots to this rota to get started.
                        </Alert>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this {deleteTarget?.type}?
          </Text>
          {deleteTarget && (
            <Text fw={500} c="red">
              "{deleteTarget.name}"
            </Text>
          )}
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleConfirmedDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
} 