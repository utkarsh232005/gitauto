import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const githubClientId = process.env.GITHUB_CLIENT_ID
  if (!githubClientId) {
    throw new Error("GITHUB_CLIENT_ID is not set in environment variables.")
  }

  const scope = "repo,user"
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=${scope}`

  redirect(redirectUri)
}
