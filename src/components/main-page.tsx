"use client"

import { useState, useEffect, useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Github,
  GitBranch,
  FileCode,
  LogOut,
  Loader2,
  Wand2,
  Star,
  Search,
  BookUser
} from "lucide-react"
import type { User, GithubRepo, GithubBranch, GithubFile } from "@/lib/github"
import { performModification, logout, getRepos, getBranches, getFiles } from "@/app/actions"
import { GitAutomatorIcon } from './icons'

const IGNORED_PATHS = [
    'node_modules/',
    '.next/',
    '.vercel/',
    'package-lock.json',
    '.DS_Store',
    '.vscode/'
];

export default function MainPage({ token, user }: { token: string, user: User }) {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [branches, setBranches] = useState<GithubBranch[]>([])
  const [files, setFiles] = useState<GithubFile[]>([])
  const [bookmarkedRepos, setBookmarkedRepos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRepo, setSelectedRepo] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedFile, setSelectedFile] = useState("")
  const [fileSha, setFileSha] = useState("")

  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState({ repos: true, branches: false, files: false })
  const { toast } = useToast()

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedRepos');
    if (savedBookmarks) {
      setBookmarkedRepos(JSON.parse(savedBookmarks));
    }

    getRepos(token).then(data => {
      setRepos(data)
      setIsLoading(prev => ({ ...prev, repos: false }))
    }).catch(err => {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch repositories." })
      setIsLoading(prev => ({ ...prev, repos: false }))
    })
  }, [token, toast])

  const toggleBookmark = (repoFullName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent dropdown from closing or card from being clicked
    const newBookmarkedRepos = bookmarkedRepos.includes(repoFullName)
      ? bookmarkedRepos.filter(r => r !== repoFullName)
      : [...bookmarkedRepos, repoFullName];
    
    setBookmarkedRepos(newBookmarkedRepos);
    localStorage.setItem('bookmarkedRepos', JSON.stringify(newBookmarkedRepos));
  }

  const handleRepoChange = async (repoFullName: string) => {
    if (!repoFullName) return;
    setSelectedRepo(repoFullName)
    setSelectedBranch("")
    setSelectedFile("")
    setBranches([])
    setFiles([])
    setFileSha("")
    setIsLoading(prev => ({ ...prev, branches: true }))
    try {
      const branchData = await getBranches(token, repoFullName)
      setBranches(branchData)
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch branches." })
    } finally {
      setIsLoading(prev => ({ ...prev, branches: false }))
    }
  }

  const handleBranchChange = async (branchName: string) => {
    setSelectedBranch(branchName)
    setSelectedFile("")
    setFiles([])
    setFileSha("")
    setIsLoading(prev => ({ ...prev, files: true }))
    try {
      const fileData = await getFiles(token, selectedRepo, branchName)
      const filteredFiles = fileData.filter(file =>
        file.type === 'blob' && !IGNORED_PATHS.some(p => file.path.startsWith(p))
      )
      setFiles(filteredFiles)
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch files." })
    } finally {
      setIsLoading(prev => ({ ...prev, files: false }))
    }
  }

  const handleFileChange = async (filePath: string) => {
    setSelectedFile(filePath)
    const file = files.find(f => f.path === filePath);
    if(file) {
      setFileSha(file.sha)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await performModification(formData)
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })
        // Optionally reset form
        setSelectedFile("")
        const requestTextarea = document.getElementById('request') as HTMLTextAreaElement;
        if (requestTextarea) requestTextarea.value = '';
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: result.message,
        })
      }
    })
  }
  
  const favoriteRepos = repos.filter(repo => bookmarkedRepos.includes(repo.full_name));
  const otherRepos = repos.filter(repo => !bookmarkedRepos.includes(repo.full_name));

  const filteredFavoriteRepos = favoriteRepos.filter(repo =>
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <GitAutomatorIcon className="h-8 w-8 text-primary" />
          <h1 className="text-lg md:text-xl font-bold">GitAutomator</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback>{user.login.charAt(0).toUpperCase()} </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline font-medium">{user.name || user.login}</span>
          </div>
          <form action={handleLogout}>
            <Button type="submit" variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center gap-6 md:gap-8">
        
        {/* Bookmarked Repositories Section */}
        <div className="w-full max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 self-start sm:self-center">
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                Bookmarked Repositories
              </h2>
               <div className="relative w-full sm:max-w-xs">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search bookmarks..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          {filteredFavoriteRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavoriteRepos.map(repo => (
                <Card 
                  key={repo.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary ${selectedRepo === repo.full_name ? 'border-primary shadow-lg' : ''}`}
                  onClick={() => handleRepoChange(repo.full_name)}
                >
                  <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
                     <div className="space-y-1">
                        <CardTitle className="text-base">{repo.name}</CardTitle>
                        <CardDescription className="text-xs">{repo.full_name}</CardDescription>
                     </div>
                     <button onClick={(e) => toggleBookmark(repo.full_name, e)} aria-label={`Bookmark ${repo.name}`}>
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                     </button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <BookUser className="h-3 w-3" />
                       {repo.private ? 'Private' : 'Public'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No bookmarked repositories found.</p>
              <p className="text-sm">Click the star icon in the repository list to add one.</p>
            </div>
          )}
        </div>

        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Create a New Code Modification</CardTitle>
            <CardDescription>Select a repository, branch, and file, then describe the changes you want to make.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="fileSha" value={fileSha} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Repository Select */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><Github className="h-4 w-4" />Repository</label>
                   <Select name="repo" onValueChange={handleRepoChange} value={selectedRepo} disabled={isPending}>
                    <SelectTrigger disabled={isLoading.repos}>
                      <SelectValue placeholder={isLoading.repos ? "Loading repos..." : "Select a repository"} />
                    </SelectTrigger>
                    <SelectContent>
                      {favoriteRepos.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Favorites</SelectLabel>
                          {favoriteRepos.map(repo => (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center justify-between w-full">
                                <span>{repo.full_name}</span>
                                <Star
                                  className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-2 cursor-pointer"
                                  onClick={(e) => toggleBookmark(repo.full_name, e)}
                                />
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {otherRepos.length > 0 && (
                      <SelectGroup>
                        {favoriteRepos.length > 0 && <SelectLabel>All Repositories</SelectLabel>}
                        {otherRepos.map(repo => (
                          <SelectItem key={repo.id} value={repo.full_name}>
                             <div className="flex items-center justify-between w-full">
                                <span>{repo.full_name}</span>
                                <Star
                                  className="h-4 w-4 text-gray-400 hover:fill-yellow-400 hover:text-yellow-400 ml-2 cursor-pointer"
                                  onClick={(e) => toggleBookmark(repo.full_name, e)}
                                />
                              </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Branch Select */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><GitBranch className="h-4 w-4" />Branch</label>
                  <Select name="branch" onValueChange={handleBranchChange} value={selectedBranch} disabled={!selectedRepo || isPending}>
                    <SelectTrigger disabled={isLoading.branches}>
                       <SelectValue placeholder={isLoading.branches ? "Loading..." : "Select a branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.name} value={branch.name}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* File Select */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium"><FileCode className="h-4 w-4" />File</label>
                  <Select name="file" onValueChange={handleFileChange} value={selectedFile} disabled={!selectedBranch || isPending}>
                    <SelectTrigger disabled={isLoading.files}>
                      <SelectValue placeholder={isLoading.files ? "Loading..." : "Select a file"} />
                    </SelectTrigger>
                    <SelectContent>
                      {files.map(file => (
                        <SelectItem key={file.sha} value={file.path}>{file.path}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Request Textarea */}
              <div className="space-y-2">
                <label htmlFor="request" className="flex items-center gap-2 text-sm font-medium"><Wand2 className="h-4 w-4" />Modification Request</label>
                <Textarea
                  id="request"
                  name="request"
                  placeholder="e.g., 'Add a new function that sorts an array in descending order'"
                  rows={4}
                  disabled={!selectedFile || isPending}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!selectedFile || isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : "Generate & Commit Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
