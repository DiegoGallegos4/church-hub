'use client'

import { useState, useEffect } from 'react'
import { Container, Title, Text, Card, Stack, Badge, Group, Divider, Alert, Skeleton } from '@mantine/core'
import { IconBook, IconBulb, IconPray, IconCalendar } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import { devotionalClient, Devotional, BibleReading, DevotionalIdea } from '@/lib'
import { format } from 'date-fns'

export default function DevotionalsPage() {
  const { user } = useAuth()
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [bibleReadings, setBibleReadings] = useState<BibleReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      console.warn('AuthContext user is null. This may indicate a session/auth issue.');
      setLoading(false)
    } else if (user) {
      fetchCurrentDevotional()
    }
  }, [user])

  const fetchCurrentDevotional = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch current devotional using the client method
      const devotionals = await devotionalClient.getDevotionals()
      const currentDevotional = devotionals.find((d: Devotional) => 
        d.start_date <= today && (!d.end_date || d.end_date >= today)
      )

      if (currentDevotional) {
        console.log('Current devotional:', currentDevotional)
        console.log('Bible readings:', currentDevotional.bible_readings)
        console.log('Devotional ideas:', currentDevotional.devotional_ideas)
        console.log('Bible readings length:', currentDevotional.bible_readings?.length)
        console.log('Devotional ideas length:', currentDevotional.devotional_ideas?.length)
        
        setDevotional(currentDevotional)
        
        // Set Bible readings from the devotional data
        const readings = currentDevotional.bible_readings || []
        console.log('Setting bible readings:', readings)
        setBibleReadings(readings)
      }
    } catch (error) {
      console.error('Error fetching devotional data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user && !loading) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Stack gap="xl">
            <Title order={1}>Devotionals</Title>
            <Alert color="red" title="Not signed in">
              You are not signed in. If you believe this is an error, check your authentication setup or try logging in again.<br/>
              <pre style={{ fontSize: '12px', marginTop: '1em' }}>Debug: user is null</pre>
            </Alert>
          </Stack>
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
          {bibleReadings.length > 0 ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group>
                  <IconBook size={20} />
                  <Title order={3}>Bible Readings</Title>
                </Group>
                <Badge color="blue" variant="light">
                  {bibleReadings.length} {bibleReadings.length === 1 ? 'verse' : 'verses'}
                </Badge>
              </Group>
              <Stack gap="lg">
                {bibleReadings.map((reading, index) => (
                  <div key={index} style={{ borderLeft: '3px solid #228be6', paddingLeft: '16px' }}>
                    <Text fw={600} mb="xs" size="lg" c="blue">
                      {reading.verse_reference}
                    </Text>
                    <Text mb="xs" style={{ fontStyle: 'italic', fontSize: '16px', lineHeight: 1.6 }}>
                      "{reading.verse_text}"
                    </Text>
                    {reading.commentary && (
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '12px', 
                        borderRadius: '6px',
                        borderLeft: '3px solid #dee2e6'
                      }}>
                        <Text fw={500} size="sm" mb="xs">Commentary:</Text>
                        <Text size="sm" c="dimmed">{reading.commentary}</Text>
                      </div>
                    )}
                  </div>
                ))}
              </Stack>
            </Card>
          ) : (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconBook size={20} />
                <Title order={3}>Bible Readings</Title>
              </Group>
              <Text c="dimmed" style={{ fontStyle: 'italic' }}>
                No Bible readings available for this devotional.
              </Text>
            </Card>
          )}

          {/* Prayer Points */}
          {devotional.prayer_points && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconPray size={20} />
                <Title order={3}>Prayer Points</Title>
              </Group>
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <Text style={{ 
                  whiteSpace: 'pre-line', 
                  lineHeight: 1.6,
                  color: '#856404'
                }}>
                  {devotional.prayer_points}
                </Text>
              </div>
            </Card>
          )}

          {/* Devotional Ideas */}
          {devotional.devotional_ideas && devotional.devotional_ideas.length > 0 ? (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Group>
                  <IconBulb size={20} />
                  <Title order={3}>Devotional Ideas</Title>
                </Group>
                <Badge color="purple" variant="light">
                  {devotional.devotional_ideas.length} {devotional.devotional_ideas.length === 1 ? 'idea' : 'ideas'}
                </Badge>
              </Group>
              <Stack gap="lg">
                {devotional.devotional_ideas.map((idea, index) => (
                  <div key={idea.id} style={{ 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px', 
                    padding: '16px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <Text fw={600} mb="xs" size="lg" c="purple">
                      {idea.title}
                    </Text>
                    {idea.description && (
                      <Text size="sm" c="dimmed" mb="md" style={{ fontStyle: 'italic' }}>
                        {idea.description}
                      </Text>
                    )}
                    <div style={{ 
                      backgroundColor: 'white', 
                      padding: '12px', 
                      borderRadius: '6px',
                      border: '1px solid #dee2e6'
                    }}>
                      {idea.content_type === 'link' ? (
                        <Text component="a" href={idea.content} target="_blank" rel="noopener noreferrer" c="blue" style={{ textDecoration: 'underline' }}>
                          🔗 {idea.content}
                        </Text>
                      ) : idea.content_type === 'video' ? (
                        <Text component="a" href={idea.content} target="_blank" rel="noopener noreferrer" c="blue" style={{ textDecoration: 'underline' }}>
                          🎥 Watch Video
                        </Text>
                      ) : (
                        <Text style={{ lineHeight: 1.6 }}>{idea.content}</Text>
                      )}
                    </div>
                  </div>
                ))}
              </Stack>
            </Card>
          ) : (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconBulb size={20} />
                <Title order={3}>Devotional Ideas</Title>
              </Group>
              <Text c="dimmed" style={{ fontStyle: 'italic' }}>
                No devotional ideas available for this devotional.
              </Text>
            </Card>
          )}
        </Stack>
      </Container>
    </Navigation>
  )
} 