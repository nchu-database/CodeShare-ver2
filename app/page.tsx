"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Building2,
  Inbox,
  Code2,
  Calendar,
  UserPlus,
  Edit3,
  Save,
  X,
  Trash2,
  Settings,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
// Remove this line: import { UserMenu } from "@/components/user-menu"

const getPermissionBadge = (permission: string) => {
  const permissionConfig = {
    owner: { label: "Owner", variant: "default" as const, color: "bg-green-500" },
    admin: { label: "Admin", variant: "secondary" as const, color: "bg-blue-500" },
    write: { label: "Write", variant: "outline" as const, color: "bg-yellow-500" },
    read: { label: "Read", variant: "outline" as const, color: "bg-gray-500" },
  }

  const config = permissionConfig[permission as keyof typeof permissionConfig] || permissionConfig.read
  return (
    <Badge variant={config.variant} className="text-xs">
      <div className={`w-2 h-2 rounded-full mr-1 ${config.color}`}></div>
      {config.label}
    </Badge>
  )
}

const canEdit = (permission: string) => {
  return permission === "owner" || permission === "write"
}

const SnippetEditor = ({
  snippet,
  onSave,
  onCancel,
}: { snippet: any; onSave: (snippet: any) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState(snippet.title)
  const [description, setDescription] = useState(snippet.description)
  const [content, setContent] = useState(snippet.content)
  const [language, setLanguage] = useState(snippet.language)

  const handleSave = () => {
    onSave({
      ...snippet,
      title,
      description,
      content,
      language,
    })
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-4 border-2 border-blue-200">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm text-blue-800">Editing Snippet</h5>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="snippet-title" className="text-xs">
            Title
          </Label>
          <Input id="snippet-title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
        </div>
        <div>
          <Label htmlFor="snippet-language" className="text-xs">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JavaScript">JavaScript</SelectItem>
              <SelectItem value="TypeScript">TypeScript</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
              <SelectItem value="Swift">Swift</SelectItem>
              <SelectItem value="React">React</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="snippet-description" className="text-xs">
          Description
        </Label>
        <Input
          id="snippet-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-sm"
        />
      </div>
      <div>
        <Label htmlFor="snippet-content" className="text-xs">
          Code
        </Label>
        <Textarea
          id="snippet-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-sm font-mono min-h-[120px]"
        />
      </div>
    </div>
  )
}

const NewSnippetForm = ({ onSave, onCancel }: { onSave: (snippet: any) => void; onCancel: () => void }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("JavaScript")

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return

    onSave({
      id: Date.now(), // Simple ID generation for demo
      title,
      description,
      content,
      language,
      view_count: 0,
      expires_at: null,
      created_at: new Date().toISOString(),
    })

    // Reset form
    setTitle("")
    setDescription("")
    setContent("")
    setLanguage("JavaScript")
  }

  return (
    <div className="bg-green-50 p-4 rounded-lg space-y-4 border-2 border-green-200">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm text-green-800">New Snippet</h5>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave} disabled={!title.trim() || !content.trim()}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-snippet-title" className="text-xs">
            Title
          </Label>
          <Input
            id="new-snippet-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter snippet title"
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="new-snippet-language" className="text-xs">
            Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JavaScript">JavaScript</SelectItem>
              <SelectItem value="TypeScript">TypeScript</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
              <SelectItem value="Swift">Swift</SelectItem>
              <SelectItem value="React">React</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="new-snippet-description" className="text-xs">
          Description
        </Label>
        <Input
          id="new-snippet-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter snippet description"
          className="text-sm"
        />
      </div>
      <div>
        <Label htmlFor="new-snippet-content" className="text-xs">
          Code
        </Label>
        <Textarea
          id="new-snippet-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your code here..."
          className="text-sm font-mono min-h-[120px]"
        />
      </div>
    </div>
  )
}

const RepositorySettingsDialog = ({
  repository,
  onSave,
  onDelete,
}: { repository: any; onSave: (settings: any) => void; onDelete: () => void }) => {
  const [settings, setSettings] = useState({
    accessRole: repository.accessRole || "none",
    friendPermission: repository.friendPermission || "read",
    organizationPermission: repository.organizationPermission || "read",
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Repository Settings - {repository.name}</DialogTitle>
          <DialogDescription>Configure access permissions and settings for this repository</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Access Role Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Access Control</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="access-role">Permission Role</Label>
                <Select
                  value={settings.accessRole}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, accessRole: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Private)</SelectItem>
                    <SelectItem value="friend">Friends</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="both">Friends & Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(settings.accessRole === "friend" || settings.accessRole === "both") && (
                <div>
                  <Label htmlFor="friend-permission">Friends Permission Level</Label>
                  <Select
                    value={settings.friendPermission}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, friendPermission: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(settings.accessRole === "organization" || settings.accessRole === "both") && (
                <div>
                  <Label htmlFor="org-permission">Organization Permission Level</Label>
                  <Select
                    value={settings.organizationPermission}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, organizationPermission: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-red-600">Danger Zone</h4>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Repository
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => onSave(settings)}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Delete Repository
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{repository.name}"? This action cannot be undone and will permanently
              delete all snippets in this repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              Delete Repository
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const NewRepositoryDialog = ({ onSave }: { onSave: (repo: any) => void }) => {
  const [repoName, setRepoName] = useState("")
  const [settings, setSettings] = useState({
    accessRole: "none",
    friendPermission: "read",
    organizationPermission: "read",
  })

  const handleSave = () => {
    if (!repoName.trim()) return

    const newRepo = {
      id: Date.now(),
      name: repoName,
      created_at: new Date().toISOString(),
      organization: null,
      permission: "owner",
      owner: { id: 12345, name: "John Doe" }, // Current user
      snippets: [],
      accessRole: settings.accessRole,
      friendPermission: settings.friendPermission,
      organizationPermission: settings.organizationPermission,
    }

    onSave(newRepo)
    setRepoName("")
    setSettings({ accessRole: "none", friendPermission: "read", organizationPermission: "read" })
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create New Repository</DialogTitle>
        <DialogDescription>Create a new repository and configure access permissions</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div>
          <Label htmlFor="repo-name">Repository Name</Label>
          <Input
            id="repo-name"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="Enter repository name"
          />
        </div>

        {/* Access Role Selection */}
        <div className="space-y-3">
          <h4 className="font-medium">Access Control</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="access-role">Permission Role</Label>
              <Select
                value={settings.accessRole}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, accessRole: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Private)</SelectItem>
                  <SelectItem value="friend">Friends</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="both">Friends & Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(settings.accessRole === "friend" || settings.accessRole === "both") && (
              <div>
                <Label htmlFor="friend-permission">Friends Permission Level</Label>
                <Select
                  value={settings.friendPermission}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, friendPermission: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read & Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(settings.accessRole === "organization" || settings.accessRole === "both") && (
              <div>
                <Label htmlFor="org-permission">Organization Permission Level</Label>
                <Select
                  value={settings.organizationPermission}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, organizationPermission: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Read & Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={!repoName.trim()}>
            Create Repository
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

const RepositoryCard = ({
  repository,
  onUpdateRepository,
  onDeleteRepository,
}: { repository: any; onUpdateRepository: (repo: any) => void; onDeleteRepository: (repoId: number) => void }) => {
  const [showSnippets, setShowSnippets] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<number | null>(null)
  const [addingSnippet, setAddingSnippet] = useState(false)
  const [snippets, setSnippets] = useState(repository.snippets)

  const userCanEdit = canEdit(repository.permission)
  const isOwner = repository.permission === "owner"

  const handleSaveSnippet = (updatedSnippet: any) => {
    const updatedSnippets = snippets.map((s: any) => (s.id === updatedSnippet.id ? updatedSnippet : s))
    setSnippets(updatedSnippets)
    onUpdateRepository({ ...repository, snippets: updatedSnippets })
    setEditingSnippet(null)
  }

  const handleAddSnippet = (newSnippet: any) => {
    const updatedSnippets = [...snippets, newSnippet]
    setSnippets(updatedSnippets)
    onUpdateRepository({ ...repository, snippets: updatedSnippets })
    setAddingSnippet(false)
  }

  const handleDeleteSnippet = (snippetId: number) => {
    const updatedSnippets = snippets.filter((s: any) => s.id !== snippetId)
    setSnippets(updatedSnippets)
    onUpdateRepository({ ...repository, snippets: updatedSnippets })
  }

  const handleSaveSettings = (settings: any) => {
    const updatedRepo = {
      ...repository,
      accessRole: settings.accessRole,
      friendPermission: settings.friendPermission,
      organizationPermission: settings.organizationPermission,
    }
    onUpdateRepository(updatedRepo)
  }

  const handleDeleteRepository = () => {
    onDeleteRepository(repository.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getAccessRoleDisplay = () => {
    switch (repository.accessRole) {
      case "friend":
        return (
          <Badge variant="outline" className="text-xs">
            Friends ({repository.friendPermission || "read"})
          </Badge>
        )
      case "organization":
        return (
          <Badge variant="outline" className="text-xs">
            Organization ({repository.organizationPermission || "read"})
          </Badge>
        )
      case "both":
        return (
          <Badge variant="outline" className="text-xs">
            Friends & Org
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Private
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-blue-600">{repository.name}</h3>
                {getPermissionBadge(repository.permission)}
                {getAccessRoleDisplay()}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(repository.created_at)}
                </span>
                {repository.organization && (
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {repository.organization}
                  </span>
                )}
                <span className="flex items-center">
                  <Code2 className="h-4 w-4 mr-1" />
                  {snippets.length} snippets
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>Owner: {repository.owner?.name || "Unknown"}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowSnippets(!showSnippets)}>
                <Code2 className="h-4 w-4 mr-1" />
                {showSnippets ? "Hide" : "Show"} Snippets
              </Button>
              {isOwner && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <RepositorySettingsDialog
                    repository={repository}
                    onSave={handleSaveSettings}
                    onDelete={handleDeleteRepository}
                  />
                </Dialog>
              )}
            </div>
          </div>

          {showSnippets && (
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-gray-700">Code Snippets</h4>
                {userCanEdit && (
                  <Button size="sm" variant="outline" onClick={() => setAddingSnippet(true)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Snippet
                  </Button>
                )}
              </div>

              {addingSnippet && <NewSnippetForm onSave={handleAddSnippet} onCancel={() => setAddingSnippet(false)} />}

              {snippets.map((snippet: any) => (
                <div key={snippet.id}>
                  {editingSnippet === snippet.id ? (
                    <SnippetEditor
                      snippet={snippet}
                      onSave={handleSaveSnippet}
                      onCancel={() => setEditingSnippet(null)}
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{snippet.title}</h5>
                          <p className="text-xs text-gray-600">{snippet.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {userCanEdit && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingSnippet(snippet.id)}>
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteSnippet(snippet.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded text-xs font-mono border">
                        <pre className="whitespace-pre-wrap">{snippet.content}</pre>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                          {snippet.language}
                        </span>
                        <span>{formatDate(snippet.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {snippets.length === 0 && !addingSnippet && (
                <div className="text-center py-8 text-gray-500">
                  <Code2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No snippets in this repository yet</p>
                  {userCanEdit && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setAddingSnippet(true)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add your first snippet
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data
const sampleFriends = [
  { id: 23456, name: "Alice Smith", email: "alice@example.com", created_at: "2024-01-10T00:00:00Z" },
  { id: 34567, name: "Bob Johnson", email: "bob@example.com", created_at: "2024-01-12T00:00:00Z" },
  { id: 45678, name: "Carol Wilson", email: "carol@example.com", created_at: "2024-01-14T00:00:00Z" },
]

const sampleOrganizations = [
  { id: 1, name: "TechCorp", created_at: "2024-01-01T00:00:00Z", member_count: 25 },
  { id: 2, name: "DevTeam", created_at: "2024-01-05T00:00:00Z", member_count: 12 },
]

const sampleOrgRequests = [
  { id: 1, organization: "NewOrg", requester: "Alice Smith", created_at: "2024-01-10T00:00:00Z" },
  { id: 2, organization: "AnotherOrg", requester: "Bob Johnson", created_at: "2024-01-12T00:00:00Z" },
]

export default function Dashboard() {
  const [newOrgName, setNewOrgName] = useState("")
  const [showInviteError, setShowInviteError] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [friends, setFriends] = useState(sampleFriends)

  const handleDeleteFriend = (friendId: number) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== friendId))
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user)

      // Update repositories with current user data
      setRepositoriesOwnedByMe((prev) =>
        prev.map((repo) => ({
          ...repo,
          owner: repo.owner?.id === 12345 ? user : repo.owner,
        })),
      )
    }
  }, [])

  // Repositories with embedded snippets and permission levels
  const [repositoriesOwnedByMe, setRepositoriesOwnedByMe] = useState([
    {
      id: 1,
      name: "awesome-project",
      created_at: "2024-01-10T00:00:00Z",
      organization: null,
      permission: "owner",
      owner: { id: 12345, name: "Loading...", email: "loading@example.com" },
      accessRole: "friend",
      friendPermission: "write",
      organizationPermission: "read",
      snippets: [
        {
          id: 1,
          title: "React Hook for API calls",
          description: "Custom hook for handling API requests with loading states",
          content:
            "const useApi = (url) => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(false);\n  // implementation\n}",
          language: "JavaScript",
          expires_at: "2024-12-31T23:59:59Z",
          created_at: "2024-01-12T00:00:00Z",
        },
        {
          id: 2,
          title: "Component State Manager",
          description: "Utility for managing complex component state",
          content: "const useStateManager = (initialState) => {\n  // state management logic\n}",
          language: "JavaScript",
          expires_at: null,
          created_at: "2024-01-14T00:00:00Z",
        },
      ],
    },
    {
      id: 2,
      name: "personal-blog",
      created_at: "2024-01-15T00:00:00Z",
      organization: null,
      permission: "owner",
      owner: currentUser,
      accessRole: "none",
      friendPermission: "read",
      organizationPermission: "read",
      snippets: [
        {
          id: 3,
          title: "Blog Post Template",
          description: "Template for creating new blog posts",
          content: "interface BlogPost {\n  title: string;\n  content: string;\n  publishedAt: Date;\n}",
          language: "TypeScript",
          expires_at: null,
          created_at: "2024-01-16T00:00:00Z",
        },
      ],
    },
  ])

  const [repositoriesOwnedByFriends, setRepositoriesOwnedByFriends] = useState([
    {
      id: 3,
      name: "data-visualization",
      created_at: "2024-01-08T00:00:00Z",
      organization: null,
      permission: "read",
      owner: sampleFriends[0],
      accessRole: "friend",
      organizationPermission: "read",
      friendPermission: "read",
      snippets: [
        {
          id: 4,
          title: "Chart Generator",
          description: "Python script for generating interactive charts",
          content:
            "import matplotlib.pyplot as plt\nimport pandas as pd\n\ndef create_chart(data):\n    # chart creation logic",
          language: "Python",
          expires_at: null,
          created_at: "2024-01-09T00:00:00Z",
        },
      ],
    },
    {
      id: 4,
      name: "mobile-app-utils",
      created_at: "2024-01-12T00:00:00Z",
      organization: null,
      permission: "write",
      owner: sampleFriends[1],
      accessRole: "organization",
      organizationPermission: "write",
      friendPermission: "read",
      snippets: [
        {
          id: 5,
          title: "Network Helper",
          description: "Swift utilities for network requests",
          content:
            "import Foundation\n\nclass NetworkHelper {\n    static func fetchData(from url: URL) {\n        // network logic\n    }\n}",
          language: "Swift",
          expires_at: "2024-06-30T23:59:59Z",
          created_at: "2024-01-13T00:00:00Z",
        },
      ],
    },
  ])

  const [repositoriesOwnedByOrganization, setRepositoriesOwnedByOrganization] = useState([
    {
      id: 5,
      name: "company-website",
      created_at: "2024-01-05T00:00:00Z",
      organization: "TechCorp",
      permission: "write",
      owner: { id: 5, name: "TechCorp", email: "admin@techcorp.com" },
      accessRole: "organization",
      organizationPermission: "write",
      friendPermission: "read",
      snippets: [
        {
          id: 6,
          title: "Header Component",
          description: "Reusable header component for the website",
          content:
            'const Header = ({ title, navigation }) => {\n  return (\n    <header className="header">\n      <h1>{title}</h1>\n      <nav>{navigation}</nav>\n    </header>\n  );\n};',
          language: "React",
          expires_at: null,
          created_at: "2024-01-06T00:00:00Z",
        },
        {
          id: 7,
          title: "API Integration",
          description: "Service layer for API communications",
          content:
            "const apiService = {\n  baseURL: process.env.API_URL,\n  async get(endpoint) {\n    // GET request logic\n  }\n};",
          language: "JavaScript",
          expires_at: null,
          created_at: "2024-01-07T00:00:00Z",
        },
      ],
    },
    {
      id: 6,
      name: "internal-tools",
      created_at: "2024-01-03T00:00:00Z",
      organization: "DevTeam",
      permission: "read",
      owner: { id: 6, name: "DevTeam", email: "team@devteam.com" },
      accessRole: "none",
      organizationPermission: "read",
      friendPermission: "read",
      snippets: [
        {
          id: 8,
          title: "Database Migration",
          description: "Go script for database migrations",
          content:
            'package main\n\nimport (\n    "database/sql"\n    "fmt"\n)\n\nfunc migrate() {\n    // migration logic\n}',
          language: "Go",
          expires_at: null,
          created_at: "2024-01-04T00:00:00Z",
        },
      ],
    },
  ])

  const handleCreateOrganization = () => {
    console.log("Creating organization:", { name: newOrgName })
    setNewOrgName("")
  }

  const handleInviteToOrganization = () => {
    if (!currentUser.organization_id) {
      setShowInviteError(true)
      return
    }
    // Handle invitation logic here
  }

  const handleCreateRepository = (newRepo: any) => {
    setRepositoriesOwnedByMe((prev) => [...prev, newRepo])
  }

  const handleDeleteRepository = (repoId: number, section: string) => {
    switch (section) {
      case "me":
        setRepositoriesOwnedByMe((repos) => repos.filter((repo) => repo.id !== repoId))
        break
      case "friends":
        setRepositoriesOwnedByFriends((repos) => repos.filter((repo) => repo.id !== repoId))
        break
      case "organization":
        setRepositoriesOwnedByOrganization((repos) => repos.filter((repo) => repo.id !== repoId))
        break
    }
  }

  const updateRepositoryInSection = (updatedRepo: any, section: string) => {
    switch (section) {
      case "me":
        setRepositoriesOwnedByMe((repos) => repos.map((repo) => (repo.id === updatedRepo.id ? updatedRepo : repo)))
        break
      case "friends":
        setRepositoriesOwnedByFriends((repos) => repos.map((repo) => (repo.id === updatedRepo.id ? updatedRepo : repo)))
        break
      case "organization":
        setRepositoriesOwnedByOrganization((repos) =>
          repos.map((repo) => (repo.id === updatedRepo.id ? updatedRepo : repo)),
        )
        break
    }
  }

  if (!currentUser) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600">Loading user data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Simplified Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">DevHub</h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("authToken")
                localStorage.removeItem("user")
                window.location.href = "/auth/login"
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-64 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt={currentUser.name} />
                      <AvatarFallback>
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{currentUser.name}</CardTitle>
                      <CardDescription className="text-xs">
                        ID: {currentUser.id} • {currentUser.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1 mr-2">
                          <Plus className="h-4 w-4 mr-2" />
                          New Repository
                        </Button>
                      </DialogTrigger>
                      <NewRepositoryDialog onSave={handleCreateRepository} />
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Friends</DialogTitle>
                          <DialogDescription>Search for users by their ID</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="friend-id">User ID</Label>
                            <Input id="friend-id" placeholder="Enter user ID (e.g., 12345)" type="number" />
                          </div>
                          <Button className="w-full">Search User</Button>
                          <div className="space-y-2">
                            {friends.slice(0, 2).map((friend) => (
                              <div
                                key={friend.id}
                                className="flex items-center justify-between p-2 border rounded mb-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {friend.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{friend.name}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteFriend(friend.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Building2 className="h-4 w-4 mr-2" />
                          New Organization
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Organization</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                              id="org-name"
                              value={newOrgName}
                              onChange={(e) => setNewOrgName(e.target.value)}
                              placeholder="Enter organization name"
                            />
                          </div>
                          <Button onClick={handleCreateOrganization} className="w-full">
                            Create Organization
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Current Organization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentUser.organization_id ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-sm font-medium">TechCorp</p>
                        <p className="text-xs text-gray-500">Member since Jan 2024</p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Opt Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 text-center py-2">You don't belong to any organization</p>
                      <div className="space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <Building2 className="h-4 w-4 mr-2" />
                              Create Organization
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Organization</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="org-name">Organization Name</Label>
                                <Input
                                  id="org-name"
                                  value={newOrgName}
                                  onChange={(e) => setNewOrgName(e.target.value)}
                                  placeholder="Enter organization name"
                                />
                              </div>
                              <Button onClick={handleCreateOrganization} className="w-full">
                                Create Organization
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={handleInviteToOrganization}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Inbox className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Organization Invitations</DialogTitle>
                                <DialogDescription>Pending organization invitations</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3">
                                {sampleOrgRequests.map((request) => (
                                  <div
                                    key={request.id}
                                    className="flex items-center justify-between p-3 border rounded"
                                  >
                                    <div>
                                      <p className="font-medium">{request.organization}</p>
                                      <p className="text-sm text-gray-500">Invited by {request.requester}</p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(request.created_at).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button size="sm">Accept</Button>
                                      <Button size="sm" variant="outline">
                                        Decline
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Friends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Friends ({friends.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {friends.slice(0, 3).map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-2 border rounded mb-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {friend.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{friend.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFriend(friend.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>

            {/* Main Content - Only Repositories */}
            <main className="flex-1 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Repositories</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Repository
                    </Button>
                  </DialogTrigger>
                  <NewRepositoryDialog onSave={handleCreateRepository} />
                </Dialog>
              </div>

              {/* Owned by Me Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">Owned by Me</h3>
                  <Badge variant="secondary">{repositoriesOwnedByMe.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {repositoriesOwnedByMe.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repository={repo}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "me")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "me")}
                    />
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Owned by Friends Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">Owned by Friends</h3>
                  <Badge variant="secondary">{repositoriesOwnedByFriends.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {repositoriesOwnedByFriends.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repository={repo}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "friends")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "friends")}
                    />
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Owned by Organization Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">Owned by Organization</h3>
                  <Badge variant="secondary">{repositoriesOwnedByOrganization.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {repositoriesOwnedByOrganization.map((repo) => (
                    <RepositoryCard
                      key={repo.id}
                      repository={repo}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "organization")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "organization")}
                    />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Error Dialog for Organization Invite */}
        <AlertDialog open={showInviteError} onOpenChange={setShowInviteError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                Cannot Send Invitation
              </AlertDialogTitle>
              <AlertDialogDescription>
                You must be a member of an organization to invite other users. Please create or join an organization
                first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Understood</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  )
}
