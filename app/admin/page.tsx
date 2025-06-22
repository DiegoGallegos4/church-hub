'use client'

import { useState, useEffect } from 'react'
import { Title, Text, Grid, Card, Stack, Group, Badge, Button, Skeleton } from '@mantine/core'
import { IconUsers, IconBook, IconCalendar, IconSettings } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalDevotionals: number
  totalRotaSlots: number
  activeServers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total devotionals
      const { count: totalDevotionals } = await supabase
        .from('devotionals')
        .select('*', { count: 'exact', head: true })

      // Fetch total rota slots
      const { count: totalRotaSlots } = await supabase
        .from('rota_slots')
        .select('*', { count: 'exact', head: true })

      // Fetch active servers
      const { count: activeServers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_server', true)

      setStats({
        totalUsers: totalUsers || 0,
        totalDevotionals: totalDevotionals || 0,
        totalRotaSlots: totalRotaSlots || 0,
        activeServers: activeServers || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Stack gap="xl">
        <div>
          <Title order={1}>Admin Dashboard</Title>
          <Text c="dimmed">Manage your church community.</Text>
        </div>
        
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
              <Skeleton height={120} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={1}>Admin Dashboard</Title>
        <Text c="dimmed">Manage your church community.</Text>
      </div>

      {/* Stats Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IconUsers size={32} color="var(--mantine-color-blue-6)" />
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Users
                </Text>
                <Text size="xl" fw={700}>
                  {stats?.totalUsers}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IconBook size={32} color="var(--mantine-color-green-6)" />
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Devotionals
                </Text>
                <Text size="xl" fw={700}>
                  {stats?.totalDevotionals}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IconCalendar size={32} color="var(--mantine-color-orange-6)" />
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Rota Slots
                </Text>
                <Text size="xl" fw={700}>
                  {stats?.totalRotaSlots}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IconUsers size={32} color="var(--mantine-color-purple-6)" />
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Active Servers
                </Text>
                <Text size="xl" fw={700}>
                  {stats?.activeServers}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">Quick Actions</Title>
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
              leftSection={<IconUsers size={16} />}
            >
              Manage Users
            </Button>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Button
              component={Link}
              href="/admin/settings"
              variant="light"
              fullWidth
              leftSection={<IconSettings size={16} />}
            >
              Settings
            </Button>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  )
} 