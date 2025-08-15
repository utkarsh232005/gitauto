'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as github from '@/lib/github'
import { modifyCode } from '@/ai/flows/modify-code-with-ai'

export async function logout() {
  cookies().set('github_access_token', '', { expires: new Date(0) })
  revalidatePath('/')
  redirect('/')
}

export async function getRepos(token: string) {
    return github.getRepos(token);
}

export async function getBranches(token: string, repoFullName: string) {
    return github.getBranches(token, repoFullName);
}

export async function getFiles(token: string, repoFullName: string, branchName: string) {
    const { tree } = await github.getRepoTree(token, repoFullName, branchName);
    return tree;
}

export async function performModification(formData: FormData) {
  const token = formData.get('token') as string
  const repo = formData.get('repo') as string
  const branch = formData.get('branch') as string
  const file = formData.get('file') as string
  const request = formData.get('request') as string
  
  if (!token || !repo || !branch || !file || !request) {
    return { success: false, message: "Missing required fields." }
  }

  try {
    // 1. Get current file content
    const { content: currentContent, sha: fileSha } = await github.getFileRawContent(token, repo, file)

    // 2. Call AI to get modified content and commit message
    const aiResult = await modifyCode({
      request: request,
      fileContent: currentContent,
    })

    if (!aiResult.modifiedContent || !aiResult.commitMessage) {
        return { success: false, message: "AI failed to generate valid modifications or a commit message." }
    }
    
    // 3. Commit and push changes
    await github.createCommitAndPush({
      token,
      repo,
      branch,
      filePath: file,
      newContent: aiResult.modifiedContent,
      commitMessage: aiResult.commitMessage,
      fileSha
    });

    revalidatePath('/')
    return { success: true, message: `Successfully committed changes to ${file} in ${repo}.` }
  } catch (error: any) {
    console.error("Modification failed:", error)
    return { success: false, message: error.message || 'An unknown error occurred.' }
  }
}
