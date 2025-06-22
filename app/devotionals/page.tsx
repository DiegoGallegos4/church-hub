'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Card, Stack, Badge, Group, Divider, Alert, Skeleton } from '@mantine/core'
import { IconBook, IconBulb, IconPray, IconCalendar } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { supabase, Devotional, BibleReading, DevotionalIdea } from '@/lib/supabase'
import { format } from 'date-fns'

export default function DevotionalsPage() {
  const { user } = useAuth()
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [bibleReadings, setBibleReadings] = useState<BibleReading[]>([])
  const [devotionalIdeas, setDevotionalIdeas] = useState<DevotionalIdea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCurrentDevotional()
    }
  }, [user])

  const fetchCurrentDevotional = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch current devotional
      const { data: devotionalData, error: devotionalError } = await supabase
        .from('devotionals')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .single()

      if (devotionalError && devotionalError.code !== 'PGRST116') {
        console.error('Error fetching devotional:', devotionalError)
        return
      }

      if (devotionalData) {
        setDevotional(devotionalData)
        
        // Fetch bible readings
        const { data: readingsData } = await supabase
          .from('bible_readings')
          .select('*')
          .eq('devotional_id', devotionalData.id)
          .order('created_at')

        setBibleReadings(readingsData || [])

        // Fetch devotional ideas
        const { data: ideasData } = await supabase
          .from('devotional_ideas')
          .select('*')
          .eq('devotional_id', devotionalData.id)
          .order('created_at')

        setDevotionalIdeas(ideasData || [])
      }
    } catch (error) {
      console.error('Error fetching devotional data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Alert color="red" title="Access Denied">
            You must be signed in to view devotionals.
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
            <Skeleton height={150} />
            <Skeleton height={150} />
          </Stack>
        </Container>
      </Navigation>
    )
  }

  if (!devotional) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Stack gap="xl">
            <div>
              <Title order={1}>Devotionals</Title>
              <Text c="dimmed">Daily spiritual nourishment for your walk with God.</Text>
            </div>
            
            <Alert color="blue" title="No Active Devotional">
              There is no active devotional for today. Check back later or contact an administrator.
            </Alert>
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
            <Title order={1}>Daily Devotional</Title>
            <Text c="dimmed">Spiritual nourishment for {format(new Date(devotional.start_date), 'MMMM d, yyyy')}</Text>
          </div>

          {/* Devotional Header */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={2}>{devotional.title}</Title>
              <Badge color="blue" leftSection={<IconCalendar size={12} />}>
                {format(new Date(devotional.start_date), 'MMM d')}
                {devotional.end_date && ` - ${format(new Date(devotional.end_date), 'MMM d')}`}
              </Badge>
            </Group>
          </Card>

          {/* Bible Readings */}
          {bibleReadings.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconBook size={20} />
                <Title order={3}>Bible Reading</Title>
              </Group>
              <Stack gap="md">
                {bibleReadings.map((reading) => (
                  <div key={reading.id}>
                    <Text fw={600} mb="xs">{reading.verse_reference}</Text>
                    <Text mb="xs" style={{ fontStyle: 'italic' }}>
                      "{reading.verse_text}"
                    </Text>
                    {reading.commentary && (
                      <Text size="sm" c="dimmed">
                        {reading.commentary}
                      </Text>
                    )}
                  </div>
                ))}
              </Stack>
            </Card>
          )}

          {/* Prayer Points */}
          {devotional.prayer_points && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconPray size={20} />
                <Title order={3}>Prayer Points</Title>
              </Group>
              <Text style={{ whiteSpace: 'pre-line' }}>
                {devotional.prayer_points}
              </Text>
            </Card>
          )}

          {/* Devotional Ideas */}
          {devotionalIdeas.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconBulb size={20} />
                <Title order={3}>Devotional Ideas</Title>
              </Group>
              <Stack gap="md">
                {devotionalIdeas.map((idea) => (
                  <div key={idea.id}>
                    <Text fw={600} mb="xs">{idea.title}</Text>
                    {idea.description && (
                      <Text size="sm" c="dimmed" mb="xs">
                        {idea.description}
                      </Text>
                    )}
                    {idea.content_type === 'link' ? (
                      <Text component="a" href={idea.content} target="_blank" rel="noopener noreferrer" c="blue">
                        {idea.content}
                      </Text>
                    ) : idea.content_type === 'video' ? (
                      <Text component="a" href={idea.content} target="_blank" rel="noopener noreferrer" c="blue">
                        Watch Video
                      </Text>
                    ) : (
                      <Text>{idea.content}</Text>
                    )}
                  </div>
                ))}
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </Navigation>
  )
} 