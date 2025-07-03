'use client'

import { useState, useEffect } from 'react'
import { 
  Container, Title, Text, Card, Stack, Group, Button, TextInput, 
  Textarea, Select, Grid, ActionIcon, Alert, Divider, Badge,
  Paper, Box
} from '@mantine/core'
import { 
  IconPlus, IconTrash, IconBook, IconBulb, IconPray, IconArrowLeft,
  IconLink, IconVideo, IconFileText
} from '@tabler/icons-react'
import { devotionalClient, Devotional, BibleReading, DevotionalIdea, CreateDevotionalData } from '@/lib'
import { notifications } from '@mantine/notifications'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BibleVerse {
  reference: string
  text: string
  version: string // This is just for UI, not stored in DB
  commentary?: string
}

interface DevotionalIdeaForm {
  title: string
  content_type: 'text' | 'link' | 'video'
  content: string
  description: string
}

export default function CreateDevotionalPage() {
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  
  // Get edit ID from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('edit')
    setEditId(id)
  }, [])
  
  // Main devotional form state
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [prayerPoints, setPrayerPoints] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Auto-calculate end date when start date changes (only for new devotionals)
  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    
    // Only auto-calculate end date if not editing and start date is valid
    if (!isEditing && value) {
      const start = new Date(value)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      
      // Format as YYYY-MM-DD
      const endDateString = end.toISOString().split('T')[0]
      setEndDate(endDateString)
    }
  }

  // Bible readings state
  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>([])
  const [bibleLoading, setBibleLoading] = useState(false)
  const [bibleReference, setBibleReference] = useState('')
  const [bibleVersion, setBibleVersion] = useState('NIV')
  const [bibleCommentary, setBibleCommentary] = useState('')

  // Devotional ideas state
  const [devotionalIdeas, setDevotionalIdeas] = useState<DevotionalIdeaForm[]>([])
  const [ideaForm, setIdeaForm] = useState<DevotionalIdeaForm>({
    title: '',
    content_type: 'text',
    content: '',
    description: ''
  })

  // Loading state
  const [loading, setLoading] = useState(false)

  // Load devotional data if editing
  useEffect(() => {
    if (editId) {
      loadDevotionalForEdit()
    } else {
      // If not editing, ensure loading is false
      setLoading(false)
    }
  }, [editId])

  const loadDevotionalForEdit = async () => {
    if (!editId) return
    
    setLoading(true)
    try {
      const devotional = await devotionalClient.getDevotional(editId)
      if (devotional) {
        setIsEditing(true)
        setTitle(devotional.title)
        setStartDate(devotional.start_date)
        setEndDate(devotional.end_date || '')
        setPrayerPoints(devotional.prayer_points || '')
        
        // Load Bible readings
        if (devotional.bible_readings && devotional.bible_readings.length > 0) {
          const verses = devotional.bible_readings.map(reading => ({
            reference: reading.verse_reference,
            text: reading.verse_text,
            version: 'NIV', // Default version since it's not stored in DB
            commentary: reading.commentary || ''
          }))
          setBibleVerses(verses)
        }
        
        // Load devotional ideas
        console.log('Devotional ideas from DB:', devotional.devotional_ideas)
        if (devotional.devotional_ideas && devotional.devotional_ideas.length > 0) {
          const ideas = devotional.devotional_ideas.map(idea => ({
            title: idea.title,
            content_type: idea.content_type,
            content: idea.content,
            description: idea.description || ''
          }))
          console.log('Processed ideas:', ideas)
          setDevotionalIdeas(ideas)
        } else {
          console.log('No devotional ideas found')
          setDevotionalIdeas([])
        }
      }
    } catch (error) {
      console.error('Error loading devotional for edit:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to load devotional for editing',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBibleVerse = async () => {
    if (!bibleReference.trim()) return

    setBibleLoading(true)
    try {
      // Try multiple Bible APIs for better reliability
      let verseData = null
      
      // First try: Bible API (more reliable)
      try {
        const response = await fetch(`https://bible-api.com/${bibleReference}?formatting=plain`)
        if (response.ok) {
          const data = await response.json()
          if (data.text) {
            // Fix the reference formatting
            const reference = data.reference || bibleReference
            verseData = {
              reference: reference,
              text: data.text,
              version: bibleVersion,
              commentary: bibleCommentary
            }
          }
        }
      } catch (error) {
        console.log('Bible API failed, trying alternative...')
      }

      // Fallback: Create a placeholder verse if API fails
      if (!verseData) {
        verseData = {
          reference: bibleReference,
          text: `[Verse text for ${bibleReference} - you can edit this manually]`,
          version: bibleVersion,
          commentary: bibleCommentary
        }
      }

      const newVerse: BibleVerse = verseData
      setBibleVerses([...bibleVerses, newVerse])
      setBibleReference('')
      setBibleCommentary('')
      
      notifications.show({
        title: 'Success',
        message: `Added verse: ${verseData.reference}`,
        color: 'green',
      })
    } catch (error) {
      console.error('Error fetching Bible verse:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch Bible verse. You can add it manually.',
        color: 'red',
      })
    } finally {
      setBibleLoading(false)
    }
  }

  const removeBibleVerse = (index: number) => {
    console.log('Removing bible verse at index:', index)
    console.log('Current bible verses:', bibleVerses)
    const updatedVerses = bibleVerses.filter((_, i) => i !== index)
    console.log('Updated bible verses:', updatedVerses)
    setBibleVerses(updatedVerses)
    notifications.show({
      title: 'Removed',
      message: 'Bible verse removed',
      color: 'blue',
    })
  }

  const addDevotionalIdea = () => {
    if (!ideaForm.title.trim() || !ideaForm.content.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in title and content for the devotional idea',
        color: 'red',
      })
      return
    }

    setDevotionalIdeas([...devotionalIdeas, { ...ideaForm }])
    setIdeaForm({
      title: '',
      content_type: 'text',
      content: '',
      description: ''
    })

    notifications.show({
      title: 'Success',
      message: 'Devotional idea added',
      color: 'green',
    })
  }

  const removeDevotionalIdea = (index: number) => {
    const updatedIdeas = devotionalIdeas.filter((_, i) => i !== index)
    setDevotionalIdeas(updatedIdeas)
    notifications.show({
      title: 'Removed',
      message: 'Devotional idea removed',
      color: 'blue',
    })
  }

  const handleSubmit = async () => {
    if (loading) return // Prevent multiple submissions
    
    if (!title || !startDate) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      })
      return
    }

    setLoading(true)
    try {
      // Convert Bible verses to BibleReading format
      console.log('Current bibleVerses state before conversion:', bibleVerses)
      const bibleReadings: BibleReading[] = bibleVerses.map(verse => ({
        verse_reference: verse.reference,
        verse_text: verse.text,
        commentary: verse.commentary || undefined
      }))
      console.log('Converted bibleReadings:', bibleReadings)

      if (isEditing && editId) {
        // Update existing devotional
        const devotionalData = {
          title,
          start_date: startDate,
          end_date: endDate || undefined,
          prayer_points: prayerPoints || undefined
        }

        const updatedDevotional = await devotionalClient.updateDevotional(editId, devotionalData)
        if (!updatedDevotional) throw new Error('Failed to update devotional')

        // Handle Bible readings separately
        console.log('Editing bible readings:', bibleReadings)
        // Always delete existing Bible readings first
        console.log('Deleting existing bible readings...')
        await devotionalClient.deleteBibleReadings(editId)
        
        if (bibleReadings.length > 0) {
          // Then create new ones
          console.log('Creating new bible readings...')
          for (const reading of bibleReadings) {
            console.log('Creating reading:', reading)
            const result = await devotionalClient.createBibleReading({
              devotional_id: editId,
              verse_reference: reading.verse_reference,
              verse_text: reading.verse_text,
              commentary: reading.commentary
            })
            console.log('Reading creation result:', result)
          }
        } else {
          console.log('No bible readings to create')
        }

        // Handle devotional ideas separately
        console.log('Editing devotional ideas:', devotionalIdeas)
        if (devotionalIdeas.length > 0) {
          // First, delete existing devotional ideas
          console.log('Deleting existing devotional ideas...')
          await devotionalClient.deleteDevotionalIdeas(editId)
          
          // Then create new ones
          console.log('Creating new devotional ideas...')
          for (const idea of devotionalIdeas) {
            console.log('Creating idea:', idea)
            const result = await devotionalClient.createDevotionalIdea({
              devotional_id: editId,
              title: idea.title,
              content_type: idea.content_type,
              content: idea.content,
              description: idea.description
            })
            console.log('Idea creation result:', result)
          }
        } else {
          // If no ideas, delete existing ones
          console.log('No ideas provided, deleting existing ones...')
          await devotionalClient.deleteDevotionalIdeas(editId)
        }

        notifications.show({
          title: 'Success',
          message: 'Devotional updated successfully!',
          color: 'green',
        })
      } else {
        // Create new devotional
        console.log('Creating devotional with ideas:', devotionalIdeas)
        const devotionalData: CreateDevotionalData = {
          title,
          start_date: startDate,
          end_date: endDate || undefined,
          prayer_points: prayerPoints || undefined,
          bible_readings: bibleReadings.length > 0 ? bibleReadings : undefined,
          devotional_ideas: devotionalIdeas.length > 0 ? devotionalIdeas : undefined
        }
        console.log('Devotional data being sent:', devotionalData)

        const newDevotional = await devotionalClient.createDevotionalWithIdeas(devotionalData)
        if (!newDevotional) throw new Error('Failed to create devotional')

        notifications.show({
          title: 'Success',
          message: 'Devotional created successfully!',
          color: 'green',
        })
      }

      // Redirect to the devotionals list
      router.push('/admin/devotionals')
    } catch (error) {
      console.error('Error saving devotional:', error)
      notifications.show({
        title: 'Error',
        message: `Failed to ${isEditing ? 'update' : 'create'} devotional`,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Group gap="xs" mb="xs">
              <Button
                component={Link}
                href="/admin/devotionals"
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                size="sm"
              >
                Back to Devotionals
              </Button>
            </Group>
            <Title order={1}>{isEditing ? 'Edit Devotional' : 'Create New Devotional'}</Title>
            <Text c="dimmed">
              {isEditing ? 'Update your devotional with Bible readings and ideas.' : 'Create a comprehensive daily devotional with Bible readings and ideas.'}
            </Text>
          </div>
        </Group>

        {/* Main Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {loading && (
            <Alert color="blue" title="Loading..." mb="md">
              {isEditing ? 'Loading devotional for editing...' : 'Processing...'}
            </Alert>
          )}
          <Stack gap="xl">
            {/* Basic Devotional Information */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">Devotional Information</Title>
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Title"
                    placeholder="Enter devotional title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Start Date"
                    type="date"
                    placeholder="Select start date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                    description="Required field"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="End Date (Optional)"
                    type="date"
                    placeholder="Select end date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    description={!isEditing ? "Auto-calculated as 7 days after start date" : undefined}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Prayer Points"
                    placeholder="Enter prayer points for this devotional"
                    value={prayerPoints}
                    onChange={(e) => setPrayerPoints(e.target.value)}
                    rows={4}
                  />
                </Grid.Col>
              </Grid>
            </Card>

            {/* Bible Readings */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3}>Bible Readings</Title>
                <Badge color="blue">{bibleVerses.length} verses</Badge>
              </Group>
              
              <Stack gap="md">
                {/* Add Bible Verse Form */}
                <Paper p="md" withBorder>
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Bible Reference"
                        placeholder="e.g., John 3:16, Psalm 23:1-6"
                        value={bibleReference}
                        onChange={(e) => setBibleReference(e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Select
                        label="Version"
                        value={bibleVersion}
                        onChange={(value) => setBibleVersion(value || 'NIV')}
                        data={[
                          { value: 'NIV', label: 'New International Version' },
                          { value: 'KJV', label: 'King James Version' },
                          { value: 'ESV', label: 'English Standard Version' },
                          { value: 'NKJV', label: 'New King James Version' }
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Button
                        leftSection={<IconBook size={16} />}
                        onClick={fetchBibleVerse}
                        loading={bibleLoading}
                        disabled={!bibleReference.trim()}
                        style={{ marginTop: '24px' }}
                      >
                        Add Verse
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Textarea
                        label="Commentary (Optional)"
                        placeholder="Add your own commentary or notes about this verse"
                        value={bibleCommentary}
                        onChange={(e) => setBibleCommentary(e.target.value)}
                        rows={3}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>

                {/* Bible Verses List */}
                {bibleVerses.length > 0 && (
                  <Stack gap="sm">
                    {bibleVerses.map((verse, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="sm">{verse.reference}</Text>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => removeBibleVerse(index)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                        <Text size="sm" style={{ fontStyle: 'italic' }}>
                          "{verse.text}"
                        </Text>
                        <Group gap="xs" mt="xs">
                          <Text size="xs" c="dimmed">
                            {verse.version}
                          </Text>
                          {verse.commentary && (
                            <>
                              <Text size="xs" c="dimmed">•</Text>
                              <Text size="xs" c="blue">
                                Commentary: {verse.commentary}
                              </Text>
                            </>
                          )}
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Devotional Ideas */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={3}>Devotional Ideas</Title>
                <Badge color="purple">{devotionalIdeas.length} ideas</Badge>
              </Group>
              
              <Stack gap="md">
                {/* Add Devotional Idea Form */}
                <Paper p="md" withBorder>
                  <Grid>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Title"
                        placeholder="Enter idea title"
                        value={ideaForm.title}
                        onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Textarea
                        label="Description (Optional)"
                        placeholder="Brief description of the idea"
                        value={ideaForm.description}
                        onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                        rows={2}
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Select
                        label="Content Type"
                        value={ideaForm.content_type}
                        onChange={(value) => setIdeaForm({ ...ideaForm, content_type: value as 'text' | 'link' | 'video' })}
                        data={[
                          { value: 'text', label: 'Text' },
                          { value: 'link', label: 'Link' },
                          { value: 'video', label: 'Video' }
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={8}>
                      {ideaForm.content_type === 'text' ? (
                        <Textarea
                          label="Content"
                          placeholder="Enter your devotional content"
                          value={ideaForm.content}
                          onChange={(e) => setIdeaForm({ ...ideaForm, content: e.target.value })}
                          rows={4}
                        />
                      ) : (
                        <TextInput
                          label="Content"
                          placeholder={
                            ideaForm.content_type === 'link' ? 'Enter URL' :
                            ideaForm.content_type === 'video' ? 'Enter video URL' :
                            'Enter content'
                          }
                          value={ideaForm.content}
                          onChange={(e) => setIdeaForm({ ...ideaForm, content: e.target.value })}
                        />
                      )}
                    </Grid.Col>
                  </Grid>
                  <Button
                    leftSection={<IconBulb size={16} />}
                    onClick={addDevotionalIdea}
                    mt="md"
                    disabled={!ideaForm.title.trim() || !ideaForm.content.trim()}
                  >
                    Add Devotional Idea
                  </Button>
                </Paper>

                {/* Devotional Ideas List */}
                {devotionalIdeas.length > 0 && (
                  <Stack gap="sm">
                    {devotionalIdeas.map((idea, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="sm">{idea.title}</Text>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => removeDevotionalIdea(index)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                        {idea.description && (
                          <Text size="sm" c="dimmed" mb="xs">
                            {idea.description}
                          </Text>
                        )}
                        <Group gap="xs">
                          {idea.content_type === 'text' && <IconFileText size={14} />}
                          {idea.content_type === 'link' && <IconLink size={14} />}
                          {idea.content_type === 'video' && <IconVideo size={14} />}
                          <Text size="sm" style={{ flex: 1 }}>
                            {idea.content}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Submit Button */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">
                    Ready to create your devotional with:
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge color="blue">{bibleVerses.length} Bible verses</Badge>
                    <Badge color="purple">{devotionalIdeas.length} devotional ideas</Badge>
                    {prayerPoints && <Badge color="green">Prayer points</Badge>}
                  </Group>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={!title || !startDate || loading}
                >
                  {isEditing ? 'Update Devotional' : 'Create Devotional'}
                </Button>
              </Group>
            </Card>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
} 