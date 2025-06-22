'use client'

import { useState, useEffect } from 'react'
import { 
  Title, Text, Button, Card, Stack, Group, Badge, Modal, TextInput, 
  Textarea, Select, Grid, ActionIcon, Skeleton, Alert 
} from '@mantine/core'
import { IconPlus, IconEdit, IconTrash, IconBook } from '@tabler/icons-react'
import { supabase, Devotional, BibleReading, DevotionalIdea } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { format } from 'date-fns'

interface BibleVerse {
  reference: string
  text: string
  version: string
}

export default function AdminDevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null)
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([])
  const [bibleLoading, setBibleLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [prayerPoints, setPrayerPoints] = useState('')
  const [bibleReference, setBibleReference] = useState('')
  const [bibleVersion, setBibleVersion] = useState('KJV')

  useEffect(() => {
    fetchDevotionals()
  }, [])

  const fetchDevotionals = async () => {
    try {
      const { data } = await supabase
        .from('devotionals')
        .select('*')
        .order('start_date', { ascending: false })

      setDevotionals(data || [])
    } catch (error) {
      console.error('Error fetching devotionals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBibleVerse = async () => {
    if (!bibleReference.trim()) return

    setBibleLoading(true)
    try {
      const response = await fetch(`https://bible-api.deno.dev/verses/${bibleVersion}/${bibleReference}`)
      const data = await response.json()

      if (data.verses && data.verses.length > 0) {
        const newVerse: BibleVerse = {
          reference: data.verses[0].reference,
          text: data.verses[0].text,
          version: bibleVersion
        }
        setBibleVerses([...bibleVerses, newVerse])
        setBibleReference('')
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch Bible verse',
        color: 'red',
      })
    } finally {
      setBibleLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!title || !startDate) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    try {
      const devotionalData = {
        title,
        start_date: startDate,
        end_date: endDate || null,
        prayer_points: prayerPoints || null,
      }

      let devotionalId: string

      if (editingDevotional) {
        const { error } = await supabase
          .from('devotionals')
          .update(devotionalData)
          .eq('id', editingDevotional.id)

        if (error) throw error
        devotionalId = editingDevotional.id
      } else {
        const { data, error } = await supabase
          .from('devotionals')
          .insert(devotionalData)
          .select()
          .single()

        if (error) throw error
        devotionalId = data.id
      }

      // Add Bible readings
      for (const verse of bibleVerses) {
        await supabase
          .from('bible_readings')
          .insert({
            devotional_id: devotionalId,
            verse_reference: verse.reference,
            verse_text: verse.text,
            bible_version: verse.version,
          })
      }

      notifications.show({
        title: 'Success',
        message: `Devotional ${editingDevotional ? 'updated' : 'created'} successfully`,
        color: 'green',
      })

      resetForm()
      fetchDevotionals()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save devotional',
        color: 'red',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', id)

      if (error) throw error

      notifications.show({
        title: 'Success',
        message: 'Devotional deleted successfully',
        color: 'green',
      })

      fetchDevotionals()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete devotional',
        color: 'red',
      })
    }
  }

  const resetForm = () => {
    setTitle('')
    setStartDate('')
    setEndDate('')
    setPrayerPoints('')
    setBibleReference('')
    setBibleVerses([])
    setEditingDevotional(null)
    setModalOpen(false)
  }

  const openEditModal = (devotional: Devotional) => {
    setEditingDevotional(devotional)
    setTitle(devotional.title)
    setStartDate(devotional.start_date)
    setEndDate(devotional.end_date || '')
    setPrayerPoints(devotional.prayer_points || '')
    setModalOpen(true)
  }

  if (loading) {
    return (
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>Manage Devotionals</Title>
            <Text c="dimmed">Create and manage daily devotionals.</Text>
          </div>
          <Skeleton height={40} width={150} />
        </Group>
        
        <Grid>
          {[1, 2, 3].map((i) => (
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
          <Title order={1}>Manage Devotionals</Title>
          <Text c="dimmed">Create and manage daily devotionals.</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setModalOpen(true)}
        >
          New Devotional
        </Button>
      </Group>

      {devotionals.length === 0 ? (
        <Alert color="blue" title="No Devotionals">
          Create your first devotional to get started.
        </Alert>
      ) : (
        <Grid>
          {devotionals.map((devotional) => (
            <Grid.Col key={devotional.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>{devotional.title}</Title>
                    <Group>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => openEditModal(devotional)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(devotional.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Group>
                    <Badge color="blue">
                      {format(new Date(devotional.start_date), 'MMM d, yyyy')}
                    </Badge>
                    {devotional.end_date && (
                      <Badge color="green">
                        {format(new Date(devotional.end_date), 'MMM d, yyyy')}
                      </Badge>
                    )}
                  </Group>

                  {devotional.prayer_points && (
                    <Text size="sm" lineClamp={3}>
                      {devotional.prayer_points}
                    </Text>
                  )}
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
        title={editingDevotional ? 'Edit Devotional' : 'New Devotional'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter devotional title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Start Date"
                type="date"
                placeholder="Select start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="End Date (Optional)"
                type="date"
                placeholder="Select end date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Prayer Points"
            placeholder="Enter prayer points"
            value={prayerPoints}
            onChange={(e) => setPrayerPoints(e.target.value)}
            rows={3}
          />

          <Card withBorder p="md">
            <Group mb="md">
              <IconBook size={20} />
              <Title order={4}>Bible Readings</Title>
            </Group>
            
            <Group>
              <Select
                label="Bible Version"
                value={bibleVersion}
                onChange={(value) => setBibleVersion(value || 'KJV')}
                data={[
                  { value: 'KJV', label: 'King James Version' },
                  { value: 'NIV', label: 'New International Version' },
                  { value: 'ESV', label: 'English Standard Version' },
                ]}
              />
              <TextInput
                label="Bible Reference"
                placeholder="e.g., John 3:16"
                value={bibleReference}
                onChange={(e) => setBibleReference(e.target.value)}
              />
              <Button
                onClick={fetchBibleVerse}
                loading={bibleLoading}
                style={{ alignSelf: 'end' }}
              >
                Add Verse
              </Button>
            </Group>

            {bibleVerses.length > 0 && (
              <Stack gap="sm" mt="md">
                {bibleVerses.map((verse, index) => (
                  <Card key={index} withBorder p="sm">
                    <Text fw={600} size="sm">{verse.reference}</Text>
                    <Text size="sm" style={{ fontStyle: 'italic' }}>
                      "{verse.text}"
                    </Text>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>

          <Group justify="flex-end">
            <Button variant="light" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingDevotional ? 'Update' : 'Create'} Devotional
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
} 