import {NextRequest, NextResponse} from 'next/server';
import {redirect} from 'next/navigation';

export async function GET(req: NextRequest) {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  if (!githubClientId) {
    // This is not a real page, but a server-side route.
    // We can't render a nice component here directly, but we can redirect
    // to an error page or return a JSON response. For now, a simple
    // text response is better than a crash.
    return new NextResponse(
      'GITHUB_CLIENT_ID is not set in environment variables. Please configure it in your .env file.',
      {
        status: 500,
        headers: {'Content-Type': 'text/plain'},
      }
    );
  }

  const scope = 'repo,user';
  // Note: The callback URL is defined in your GitHub OAuth App settings.
  // It should match `/api/auth/callback/github`.
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=${scope}`;

  redirect(redirectUri);
}
