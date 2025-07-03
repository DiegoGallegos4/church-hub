'use client'

import { useState } from 'react'
import { Title, Text, Card, Stack, Group, Switch, Button, Alert } from '@mantine/core'
import { IconSettings, IconDeviceFloppy } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { AdminNavigation } from '@/components/AdminNavigation/AdminNavigation'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    enableNotifications: true,
    autoAssignServers: false,
    requireApproval: true,
    enableBibleAPI: true,
  })

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    notifications.show({
      title: 'Success',
      message: 'Settings saved successfully',
      color: 'green',
    })
  }

  return (
    <Stack gap="xl">
      <AdminNavigation />
      
      <div>
        <Title order={1}>Settings</Title>
        <Text c="dimmed">Configure your church hub settings.</Text>
      </div>

      <Alert color="blue" title="Settings">
        Settings are currently stored locally. In a production environment, these would be saved to the database.
      </Alert>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          <Group>
            <IconSettings size={20} />
            <Title order={3}>General Settings</Title>
          </Group>

          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={500}>Enable Notifications</Text>
                <Text size="sm" c="dimmed">
                  Send email notifications for rota assignments and updates
                </Text>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onChange={(event) => handleSettingChange('enableNotifications', event.currentTarget.checked)}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Auto-assign Servers</Text>
                <Text size="sm" c="dimmed">
                  Automatically assign servers to available slots
                </Text>
              </div>
              <Switch
                checked={settings.autoAssignServers}
                onChange={(event) => handleSettingChange('autoAssignServers', event.currentTarget.checked)}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Require Approval</Text>
                <Text size="sm" c="dimmed">
                  Require admin approval for new user registrations
                </Text>
              </div>
              <Switch
                checked={settings.requireApproval}
                onChange={(event) => handleSettingChange('requireApproval', event.currentTarget.checked)}
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Enable Bible API</Text>
                <Text size="sm" c="dimmed">
                  Use external Bible API for verse lookups in devotionals
                </Text>
              </div>
              <Switch
                checked={settings.enableBibleAPI}
                onChange={(event) => handleSettingChange('enableBibleAPI', event.currentTarget.checked)}
              />
            </Group>
          </Stack>

          <Group justify="flex-end">
            <Button 
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  )
} 