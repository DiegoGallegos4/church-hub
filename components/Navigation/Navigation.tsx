'use client'

import { useState } from 'react'
import { AppShell, Burger, Group, NavLink, Stack, Text, Button, Avatar } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconHome, IconBook, IconCalendar, IconUser, IconLogout, IconLogin, IconDashboard, IconUsers } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure()
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/', icon: IconHome },
    { label: 'Devotionals', href: '/devotionals', icon: IconBook },
    { label: 'Rota', href: '/rota', icon: IconCalendar },
    { label: 'Profile', href: '/profile', icon: IconUser },
  ]

  const adminItems = [
    { label: 'Dashboard', href: '/admin', icon: IconDashboard },
    { label: 'Manage Devotionals', href: '/admin/devotionals', icon: IconBook },
    { label: 'Manage Rota', href: '/admin/rota', icon: IconCalendar },
    { label: 'Manage Users', href: '/admin/users', icon: IconUsers },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // If user is not logged in, show just the content without any navigation
  if (!user) {
    return (
      <div>
        {children}
      </div>
    )
  }

  // If user is logged in, show the sidebar navigation
  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Stack gap="md">
          {/* User info at top of sidebar */}
          <Group>
            <Avatar size="md" color="blue">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                {profile?.full_name || user.email}
              </Text>
              <Text size="xs" c="dimmed">
                {profile?.role === 'admin' ? 'Administrator' : 'Member'}
              </Text>
            </div>
          </Group>

          <Button 
            variant="subtle" 
            size="sm" 
            onClick={handleSignOut} 
            leftSection={<IconLogout size={16} />}
            fullWidth
          >
            Sign Out
          </Button>

          <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '1rem' }}>
            <Text size="xs" c="dimmed" mb="xs">Navigation</Text>
            <Stack gap="xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  label={item.label}
                  leftSection={<item.icon size={16} />}
                  component={Link}
                  href={item.href}
                  active={pathname === item.href}
                />
              ))}
            </Stack>
          </div>
          
          {profile?.role === 'admin' && (
            <div>
              <Text size="xs" c="dimmed" mb="xs">Admin</Text>
              <Stack gap="xs">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.href}
                    label={item.label}
                    leftSection={<item.icon size={16} />}
                    component={Link}
                    href={item.href}
                    active={pathname === item.href}
                    variant="filled"
                  />
                ))}
              </Stack>
            </div>
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
} 