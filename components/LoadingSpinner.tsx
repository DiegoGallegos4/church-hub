import { Container, Stack, Skeleton } from '@mantine/core'
import { Navigation } from './Navigation/Navigation'

interface LoadingSpinnerProps {
  title?: string
  subtitle?: string
  showNavigation?: boolean
}

export function LoadingSpinner({ 
  title = "Loading...", 
  subtitle = "Please wait while we fetch your data.",
  showNavigation = true 
}: LoadingSpinnerProps) {
  const content = (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Skeleton height={40} width={200} />
        <Skeleton height={20} width={300} />
        <Skeleton height={200} />
        <Skeleton height={200} />
      </Stack>
    </Container>
  )

  if (showNavigation) {
    return <Navigation>{content}</Navigation>
  }

  return content
} 