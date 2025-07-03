'use client'

import { useState } from 'react'
import { 
  AppShell, 
  Group, 
  NavLink, 
  Stack, 
  Text, 
  Button, 
  Avatar, 
  Container, 
  Burger,
  Menu,
  ActionIcon,
  Divider,
  Box
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { 
  IconHome, 
  IconBook, 
  IconCalendar, 
  IconUser, 
  IconLogout, 
  IconLogin, 
  IconDashboard, 
  IconUsers,
  IconSettings,
  IconChevronDown
} from '@tabler/icons-react'
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
  ]

  const adminItems = [
    { label: 'Dashboard', href: '/admin', icon: IconDashboard },
    { label: 'Manage Devotionals', href: '/admin/devotionals', icon: IconBook },
    { label: 'Manage Rota', href: '/admin/rota', icon: IconCalendar },
    { label: 'Manage Users', href: '/admin/users', icon: IconUsers },
    { label: 'Settings', href: '/admin/settings', icon: IconSettings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%" gap="md">
            {/* Logo/Brand */}
            <Group>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Group gap="xs">
                  <IconBook size={24} color="var(--mantine-color-blue-6)" />
                  <Text size="lg" fw={700} c="blue">
                    Church Hub
                  </Text>
                </Group>
              </Link>
            </Group>

            {/* Desktop Navigation */}
            <Group gap="sm" visibleFrom="md" style={{ flex: 1, justifyContent: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant={pathname === item.href ? "light" : "subtle"}
                  leftSection={<item.icon size={16} />}
                  size="sm"
                >
                  {item.label}
                </Button>
              ))}
            </Group>

            {/* Right side - User menu or Sign in */}
            <Group gap="sm" style={{ flexShrink: 0 }}>
              {/* Admin dropdown for desktop */}
              <Box visibleFrom="md">
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button 
                      variant="subtle" 
                      rightSection={<IconChevronDown size={14} />}
                      leftSection={<IconDashboard size={16} />}
                      size="sm"
                    >
                      Admin
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {adminItems.map((item) => (
                      <Menu.Item
                        key={item.href}
                        component={Link}
                        href={item.href}
                        leftSection={<item.icon size={16} />}
                      >
                        {item.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </Box>

              {/* User menu or Sign in button */}
              {user ? (
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button 
                      variant="subtle" 
                      rightSection={<IconChevronDown size={14} />}
                      leftSection={
                        <Avatar size="sm" color="blue">
                          {profile?.name?.charAt(0) || user.email?.charAt(0)}
                        </Avatar>
                      }
                      size="sm"
                    >
                      {profile?.name || user.email}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      component={Link}
                      href="/profile"
                      leftSection={<IconUser size={16} />}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={16} />}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button 
                  component={Link} 
                  href="/auth" 
                  leftSection={<IconLogin size={16} />}
                  variant="light"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="md"
                size="sm"
              />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      {/* Mobile Navigation */}
      {opened && (
        <Box hiddenFrom="md" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap="xs">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<item.icon size={16} />}
                component={Link}
                href={item.href}
                active={pathname === item.href}
                onClick={() => toggle()}
              />
            ))}
            
            <Divider my="xs" />
            
            <Text size="xs" c="dimmed" mb="xs">Admin</Text>
            {adminItems.map((item) => (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<item.icon size={16} />}
                component={Link}
                href={item.href}
                active={pathname === item.href}
                variant="filled"
                onClick={() => toggle()}
              />
            ))}
          </Stack>
        </Box>
      )}

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
} 