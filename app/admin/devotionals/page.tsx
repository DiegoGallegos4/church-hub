'use client'

import { useState, useEffect } from 'react'
import { 
  Title, Text, Button, Card, Stack, Group, Badge, Modal, TextInput, 
  Textarea, Select, Grid, ActionIcon, Skeleton, Alert, Divider 
} from '@mantine/core'
import { IconPlus, IconEdit, IconTrash, IconBook, IconBulb } from '@tabler/icons-react'
import { devotionalClient, Devotional, BibleReading, DevotionalIdea, CreateDevotionalData } from '@/lib'
import { notifications } from '@mantine/notifications'
import { format } from 'date-fns'
import Link from 'next/link'



export default function AdminDevotionalsPage() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevotionals()
  }, [])

  const fetchDevotionals = async () => {
    try {
      const devotionals = await devotionalClient.getDevotionals()
      setDevotionals(devotionals)
    } catch (error) {
      console.error('Error fetching devotionals:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleDelete = async (id: string) => {
    try {
      const success = await devotionalClient.deleteDevotional(id)
      if (!success) throw new Error('Failed to delete devotional')

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
          component={Link}
          href="/admin/devotionals/create"
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
                        component={Link}
                        href={`/admin/devotionals/create?edit=${devotional.id}`}
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

                  {/* Content Summary */}
                  <Group gap="xs">
                    {devotional.bible_readings && devotional.bible_readings.length > 0 && (
                      <Badge color="blue" variant="light" leftSection={<IconBook size={12} />}>
                        {devotional.bible_readings.length} {devotional.bible_readings.length === 1 ? 'Verse' : 'Verses'}
                      </Badge>
                    )}
                    {devotional.devotional_ideas && devotional.devotional_ideas.length > 0 && (
                      <Badge color="purple" variant="light" leftSection={<IconBulb size={12} />}>
                        {devotional.devotional_ideas.length} {devotional.devotional_ideas.length === 1 ? 'Idea' : 'Ideas'}
                      </Badge>
                    )}
                    {devotional.prayer_points && (
                      <Badge color="yellow" variant="light">
                        Prayer Points
                      </Badge>
                    )}
                  </Group>

                  {/* Bible Verses Preview */}
                  {devotional.bible_readings && devotional.bible_readings.length > 0 && (
                    <div>
                      <Text size="xs" c="dimmed" mb="xs" fw={500}>Bible Readings:</Text>
                      <Stack gap="xs">
                        {devotional.bible_readings.slice(0, 2).map((reading, index) => (
                          <div key={index} style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '8px', 
                            borderRadius: '4px',
                            borderLeft: '2px solid #228be6'
                          }}>
                            <Text size="xs" fw={600} c="blue">
                              {reading.verse_reference}
                            </Text>
                            <Text size="xs" lineClamp={2} style={{ fontStyle: 'italic' }}>
                              "{reading.verse_text}"
                            </Text>
                          </div>
                        ))}
                        {devotional.bible_readings.length > 2 && (
                          <Text size="xs" c="dimmed">
                            +{devotional.bible_readings.length - 2} more verses...
                          </Text>
                        )}
                      </Stack>
                    </div>
                  )}

                  {/* Prayer Points Preview */}
                  {devotional.prayer_points && (
                    <div>
                      <Text size="xs" c="dimmed" mb="xs" fw={500}>Prayer Points:</Text>
                      <div style={{ 
                        backgroundColor: '#fff3cd', 
                        border: '1px solid #ffeaa7', 
                        borderRadius: '4px', 
                        padding: '8px',
                        maxHeight: '80px',
                        overflow: 'hidden'
                      }}>
                        <Text size="xs" style={{ 
                          color: '#856404',
                          whiteSpace: 'pre-line',
                          lineHeight: 1.4
                        }}>
                          {devotional.prayer_points}
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Devotional Ideas Preview */}
                  {devotional.devotional_ideas && devotional.devotional_ideas.length > 0 && (
                    <div>
                      <Text size="xs" c="dimmed" mb="xs" fw={500}>Devotional Ideas:</Text>
                      <Stack gap="xs">
                        {devotional.devotional_ideas.slice(0, 2).map((idea, index) => (
                          <div key={index} style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '8px', 
                            borderRadius: '4px',
                            borderLeft: '2px solid #7950f2'
                          }}>
                            <Text size="xs" fw={600} c="purple">
                              {idea.title}
                            </Text>
                            {idea.description && (
                              <Text size="xs" lineClamp={1} c="dimmed">
                                {idea.description}
                              </Text>
                            )}
                          </div>
                        ))}
                        {devotional.devotional_ideas.length > 2 && (
                          <Text size="xs" c="dimmed">
                            +{devotional.devotional_ideas.length - 2} more ideas...
                          </Text>
                        )}
                      </Stack>
                    </div>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}


    </Stack>
  )
} 