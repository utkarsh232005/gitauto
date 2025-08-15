export interface User {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

export interface GithubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'blob' | 'tree';
}

const GITHUB_API_BASE = "https://api.github.com";

async function githubApi(endpoint: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`GitHub API Error on ${endpoint}: ${errorBody.message || 'Unknown error'}`);
  }

  // Handle no content response
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getAuthenticatedUser(token: string): Promise<User> {
  return githubApi("/user", token);
}

export async function getRepos(token: string): Promise<GithubRepo[]> {
  // Fetch repos user has push access to, sorted by recent push activity
  const repos = await githubApi(`/user/repos?type=owner&sort=pushed&per_page=100`, token);
  return repos;
}


export async function getBranches(token: string, repoFullName: string): Promise<GithubBranch[]> {
  return githubApi(`/repos/${repoFullName}/branches`, token);
}

export async function getRepoTree(token: string, repoFullName: string, branchName: string): Promise<{tree: GithubFile[]}> {
    const branch = await githubApi(`/repos/${repoFullName}/branches/${branchName}`, token);
    const commitSha = branch.commit.sha;
    return githubApi(`/repos/${repoFullName}/git/trees/${commitSha}?recursive=1`, token);
}

export async function getFileRawContent(token: string, repoFullName: string, filePath: string): Promise<{content: string, sha: string}> {
    const response = await githubApi(`/repos/${repoFullName}/contents/${filePath}`, token, {
        headers: { Accept: "application/vnd.github.raw+json" }
    });
    
    // The raw content call doesn't return sha, so we make another call.
    // This is inefficient but necessary for now.
    const metaResponse = await githubApi(`/repos/${repoFullName}/contents/${filePath}`, token);

    const contentInBase64 = Buffer.from(response).toString('base64');
    const content = Buffer.from(contentInBase64, 'base64').toString('utf-8');
    
    return { content, sha: metaResponse.sha };
}

export async function createCommitAndPush(options: {
  token: string,
  repo: string,
  branch: string,
  filePath: string,
  newContent: string,
  commitMessage: string,
  fileSha: string
}) {
    const { token, repo, branch, filePath, newContent, commitMessage, fileSha } = options;

    return await githubApi(`/repos/${repo}/contents/${filePath}`, token, {
        method: 'PUT',
        body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(newContent).toString('base64'),
            sha: fileSha,
            branch: branch,
        }),
    });
}
