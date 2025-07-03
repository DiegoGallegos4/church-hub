'use client'

import { Group, Button, Divider } from '@mantine/core'
import { 
  IconDashboard, 
  IconBook, 
  IconCalendar, 
  IconUsers, 
  IconSettings 
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminItems = [
  { label: 'Dashboard', href: '/admin', icon: IconDashboard },
  { label: 'Devotionals', href: '/admin/devotionals', icon: IconBook },
  { label: 'Rota', href: '/admin/rota', icon: IconCalendar },
  { label: 'Users', href: '/admin/users', icon: IconUsers },
  { label: 'Settings', href: '/admin/settings', icon: IconSettings },
]

export function AdminNavigation() {
  const pathname = usePathname()

  return (
    <Group gap="xs" mb="lg">
      {adminItems.map((item) => (
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
  )
} 