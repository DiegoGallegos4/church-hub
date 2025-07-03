'use client'

import { Container, Title, Text, Card, Stack, Group, Button, Grid, Alert, Badge } from '@mantine/core'
import { IconBook, IconCalendar, IconUser, IconArrowRight, IconHeart, IconUsers, IconPray } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation/Navigation'
import Link from 'next/link'

export default function HomePage() {
  const { user, profile } = useAuth()

  const isAuthenticated = user !== null
  const displayName = profile?.name || user?.email || 'Church Member'

  if (!isAuthenticated) {
    return (
      <Navigation>
        <Container size="lg" py="xl">
          <Stack gap="xl" align="center" ta="center">
            {/* Hero Section */}
            <div>
              <Badge size="lg" variant="light" color="blue" mb="md">
                Welcome to Church Hub
              </Badge>
              <Title order={1} size="3.5rem" mb="lg" style={{ lineHeight: 1.2 }}>
                Your Digital Church
                <Text component="span" c="blue" inherit> Community</Text>
              </Title>
              <Text size="xl" c="dimmed" maw={600} mb="xl">
                Connect with your church family, grow spiritually through daily devotionals, 
                and serve together with our comprehensive church management platform.
              </Text>
              
              {/* Feature highlights */}
              <Grid gutter="md" justify="center" mb="xl">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group justify="center" gap="xs">
                    <IconBook size={20} color="var(--mantine-color-blue-6)" />
                    <Text size="sm" fw={500}>Daily Devotionals</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group justify="center" gap="xs">
                    <IconCalendar size={20} color="var(--mantine-color-green-6)" />
                    <Text size="sm" fw={500}>Serving Schedule</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group justify="center" gap="xs">
                    <IconUsers size={20} color="var(--mantine-color-purple-6)" />
                    <Text size="sm" fw={500}>Community</Text>
                  </Group>
                </Grid.Col>
              </Grid>
            </div>
            
            {/* Sign In Card */}
            <Card shadow="lg" padding="xl" radius="lg" withBorder maw={400} style={{ background: 'var(--mantine-color-body)' }}>
              <Stack gap="lg">
                <div>
                  <Title order={2} ta="center" mb="xs">
                    Get Started
                  </Title>
                  <Text c="dimmed" ta="center">
                    Sign in to access your church community
                  </Text>
                </div>
                
                <Button 
                  component={Link} 
                  href="/auth" 
                  size="lg" 
                  fullWidth
                  leftSection={<IconUser size={20} />}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Sign In
                </Button>
                
                <Text size="xs" c="dimmed" ta="center">
                  Secure email-based authentication
                </Text>
              </Stack>
            </Card>

            {/* Additional info */}
            <Card variant="light" p="md" radius="md" withBorder>
              <Group justify="center" gap="lg">
                <Group gap="xs">
                  <IconHeart size={16} color="var(--mantine-color-red-6)" />
                  <Text size="sm">Spiritual Growth</Text>
                </Group>
                <Group gap="xs">
                  <IconPray size={16} color="var(--mantine-color-blue-6)" />
                  <Text size="sm">Community Service</Text>
                </Group>
                <Group gap="xs">
                  <IconUsers size={16} color="var(--mantine-color-green-6)" />
                  <Text size="sm">Fellowship</Text>
                </Group>
              </Group>
            </Card>
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
            <Title order={1}>
              Welcome back, {displayName}!
            </Title>
            <Text c="dimmed">
              Here's what's happening in your church community today.
            </Text>
          </div>

          {profile?.role === 'admin' && (
            <Alert color="blue" title="Admin Access">
              You have administrator privileges. Use the admin menu to manage devotionals, rota, and users.
            </Alert>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconBook size={32} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Title order={3}>Daily Devotional</Title>
                      <Text size="sm" c="dimmed">
                        Read today's spiritual nourishment
                      </Text>
                    </div>
                  </Group>
                  <Button 
                    component={Link} 
                    href="/devotionals" 
                    variant="light" 
                    rightSection={<IconArrowRight size={16} />}
                    fullWidth
                  >
                    View Devotional
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconCalendar size={32} color="var(--mantine-color-green-6)" />
                    <div>
                      <Title order={3}>Church Rota</Title>
                      <Text size="sm" c="dimmed">
                        View and manage serving schedule
                      </Text>
                    </div>
                  </Group>
                  <Button 
                    component={Link} 
                    href="/rota" 
                    variant="light" 
                    rightSection={<IconArrowRight size={16} />}
                    fullWidth
                  >
                    View Rota
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconUser size={32} color="var(--mantine-color-orange-6)" />
                    <div>
                      <Title order={3}>Your Profile</Title>
                      <Text size="sm" c="dimmed">
                        Update your information and preferences
                      </Text>
                    </div>
                  </Group>
                  <Button 
                    component={Link} 
                    href="/profile" 
                    variant="light" 
                    rightSection={<IconArrowRight size={16} />}
                    fullWidth
                  >
                    View Profile
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {profile?.role === 'admin' && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Quick Admin Actions</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <Button 
                      component={Link} 
                      href="/admin/devotionals" 
                      variant="light" 
                      fullWidth
                      leftSection={<IconBook size={16} />}
                    >
                      Manage Devotionals
                    </Button>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <Button 
                      component={Link} 
                      href="/admin/rota" 
                      variant="light" 
                      fullWidth
                      leftSection={<IconCalendar size={16} />}
                    >
                      Manage Rota
                    </Button>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <Button 
                      component={Link} 
                      href="/admin/users" 
                      variant="light" 
                      fullWidth
                      leftSection={<IconUser size={16} />}
                    >
                      Manage Users
                    </Button>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <Button 
                      component={Link} 
                      href="/admin" 
                      variant="light" 
                      fullWidth
                      leftSection={<IconArrowRight size={16} />}
                    >
                      Admin Dashboard
                    </Button>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </Navigation>
  )
}
