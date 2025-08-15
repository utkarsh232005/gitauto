import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { GitAutomatorIcon } from "./icons"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GitAutomatorIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">GitAutomator</CardTitle>
          <CardDescription className="text-muted-foreground">
            Automate code modifications with the power of AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Sign in with your GitHub account to get started. We'll need access to your repositories to read files and commit changes.
          </p>
          <Button asChild size="lg" className="w-full">
            <a href="/api/auth/github" target="_top">
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </a>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            By signing in, you agree to allow GitAutomator to access your repositories.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
