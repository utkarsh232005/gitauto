import { cookies } from 'next/headers'
import LoginPage from '@/components/login-page'
import MainPage from '@/components/main-page'
import { getAuthenticatedUser } from '@/lib/github'
import { GitAutomatorIcon } from '@/components/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('github_access_token')?.value

  let user = null
  if (token) {
    try {
      user = await getAuthenticatedUser(token)
    } catch (error) {
      console.error('Failed to authenticate user with token:', error)
      // Token is likely invalid or expired, proceed to show login page.
    }
  }

  if (!user || !token) {
    if (token) {
       // Clear invalid token
      cookies().set('github_access_token', '', { expires: new Date(0) })
    }
    return <LoginPage />
  }

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <GitAutomatorIcon className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-destructive">
              GitHub OAuth credentials are not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables.
            </p>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Refer to the <code>.env.example</code> file for more details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <MainPage token={token} user={user} />
}
