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
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Search,
  UserMinus,
  CheckCircle,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { friendshipAPI, invitationAPI, organizationAPI, repositoryAPI } from "@/lib/auth"
import { set } from "date-fns"
import dayjs from 'dayjs';

interface Friend {
  id: number
  name: string
  email: string
  friendship_created_at?: string
}

interface Organization {
  id: number,
  name: string,
  created_at: string,
  updated_at: string,
  deleted_at?: string,
}

interface Invitation {
  user_id: number,
  organization_id: number,
  created_at: string,
  organization: Organization
}

interface SearchUser {
  id: number
  name: string
  email: string
  is_friend?: boolean
}

interface InvitationSearchUser {
  id: number
  name: string
  email: string
  is_invited?: boolean
}

interface Snippet {
  id: number
  user_id: number
  repository_id: number
  language_id: number
  title: string
  description: string
  content: string
  view_count: number
  expires_at: string | null
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface Permission {
  repository_id: number
  permission_type_id: number
  writable: number
  created_at: string
}

interface Owner {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_confirmed_at: string | null
  created_at: string
  updated_at: string
  organization_id: number
  deleted_at: string | null
}

interface Repository {
  id: number
  user_id: number
  name: string
  view_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  snippets: Snippet[]
  owner: Owner
  friend_permission: Permission | null
  organization_permission: Permission | null
  public_permission: Permission | null
}

interface FriendshipStats {
  total_friends: number
  recent_friends: Friend[]
}
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
  onClose,
}: { repository: any; onSave: (settings: any) => void; onDelete: () => void; onClose?: () => void }) => {
  const [settings, setSettings] = useState({
    friendPermission: repository.friendPermission || "none",
    organizationPermission: repository.organizationPermission || "none",
    publicPermission: repository.publicPermission || "none",
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
          {/* Friends Section */}
          <div>
            <Label htmlFor="friends-permission">Friends</Label>
            <Select
              value={settings.friendPermission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, friendPermission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations Section */}
          <div>
            <Label htmlFor="orgs-permission">Organizations</Label>
            <Select
              value={settings.organizationPermission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, organizationPermission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public Section */}
          <div>
            <Label htmlFor="public-permission">Public</Label>
            <Select
              value={settings.publicPermission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, publicPermission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
     

              {/*(settings.accessRole === "friend" || settings.accessRole === "both") && (
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
              )*/}
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
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={async () => {
              try {
                await onSave(settings)
                if (onClose) onClose()
              } catch (error) {
                // Error is already handled in onSave, just prevent dialog from closing
                console.error("Settings save failed, keeping dialog open")
              }
            }}>Save Settings</Button>
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
  const [open, setOpen] = useState(false)
  const [repoName, setRepoName] = useState("")
  const [settings, setSettings] = useState({
    friend_permission: "none",
    organization_permission: "none",
    public_permission: "none"
  })

  const handleSave = async () => {
    if (!repoName.trim()) return

    const newRepo = {
      name: repoName,
      friend_permission: settings.friend_permission,
      organization_permission: settings.organization_permission,
      public_permission: settings.public_permission,
    }

    await onSave(newRepo)
    setRepoName("")
    setSettings({ friend_permission: "none", organization_permission: "none", public_permission: "none" })
    setOpen(false) // Close the dialog after successful creation
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Repository
        </Button>
      </DialogTrigger>
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
          {/* Friends Section */}
          <div>
            <Label htmlFor="friends-permission">Friends</Label>
            <Select
              value={settings.friend_permission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, friend_permission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations Section */}
          <div>
            <Label htmlFor="orgs-permission">Organizations</Label>
            <Select
              value={settings.organization_permission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, organization_permission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public Section */}
          <div>
            <Label htmlFor="public-permission">Public</Label>
            <Select
              value={settings.public_permission}
              onValueChange={(value) =>
                setSettings(prev => ({ ...prev, public_permission: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="write">Write</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!repoName.trim()}>
            Create Repository
          </Button>
        </div>
      </div>
    </DialogContent>
    </Dialog>
  )
}

const RepositoryCard = ({
  repository,
  onUpdateRepository,
  onDeleteRepository,
  currentUser,
  onReloadRepositories,
}: { 
  repository: Repository; 
  onUpdateRepository: (repo: Repository) => void; 
  onDeleteRepository: (repoId: number) => void;
  currentUser: any;
  onReloadRepositories?: () => void;
}) => {
  const [showSnippets, setShowSnippets] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<number | null>(null)
  const [addingSnippet, setAddingSnippet] = useState(false)
  const [snippets, setSnippets] = useState(repository.snippets)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // 判斷當前用戶是否為擁有者
  const isOwner = currentUser && repository.user_id === currentUser.id
  
  // 判斷權限類型
  const getPermissionType = () => {
    if (isOwner) return "owner"
    if (repository.organization_permission?.writable === 1) return "write"
    if (repository.organization_permission?.writable === 0) return "read"
    if (repository.friend_permission?.writable === 1) return "write"
    if (repository.friend_permission?.writable === 0) return "read"
    if (repository.public_permission?.writable === 1) return "write"
    if (repository.public_permission?.writable === 0) return "read"
    return "read"
  }

  const permissionType = getPermissionType()
  const userCanEdit = permissionType === "owner" || permissionType === "write"

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

  const handleSaveSettings = async (settings: any) => {
    try {
      console.log("Updating repository settings:", { repositoryId: repository.id, settings })
      await repositoryAPI.updateRepository(
        repository.id,
        repository.name,
        settings.friendPermission || "none",
        settings.organizationPermission || "none", 
        settings.publicPermission || "none"
      )
      
      // Update the repository locally after successful API call
      const updatedRepo = {
        ...repository,
        friendPermission: settings.friendPermission,
        organizationPermission: settings.organizationPermission,
        publicPermission: settings.publicPermission,
      }
      onUpdateRepository(updatedRepo)
      
      // Reload repositories from server to get fresh data
      if (onReloadRepositories) {
        onReloadRepositories()
      }
      
      console.log("Repository settings updated successfully")
    } catch (error: any) {
      console.error("Failed to update repository settings:", error)
      // TODO: Show error toast or alert to user
      alert(`Failed to update repository settings: ${error.message}`)
      throw error // Re-throw to prevent dialog from closing
    }
  }

  const handleDeleteRepository = async () => {
    try {
      console.log("Deleting repository:", repository.id)
      await repositoryAPI.destroyRepository(repository.id)
      onDeleteRepository(repository.id)
      console.log("Repository deleted successfully")
    } catch (error: any) {
      console.error("Failed to delete repository:", error)
      // TODO: Show error toast or alert to user
      alert(`Failed to delete repository: ${error.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getAccessRoleDisplay = () => {
    // 根據權限類型顯示訪問角色
    if (repository.friend_permission && repository.organization_permission) {
      return (
        <Badge variant="outline" className="text-xs">
          Friends & Org
        </Badge>
      )
    } else if (repository.friend_permission) {
      const permission = repository.friend_permission.writable === 1 ? "write" : "read"
      return (
        <Badge variant="outline" className="text-xs">
          Friends ({permission})
        </Badge>
      )
    } else if (repository.organization_permission) {
      const permission = repository.organization_permission.writable === 1 ? "write" : "read"
      return (
        <Badge variant="outline" className="text-xs">
          Organization ({permission})
        </Badge>
      )
    } else if (repository.public_permission) {
      const permission = repository.public_permission.writable === 1 ? "write" : "read"
      return (
        <Badge variant="outline" className="text-xs">
          Public ({permission})
        </Badge>
      )
    } else {
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
                {getPermissionBadge(permissionType)}
                {getAccessRoleDisplay()}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(repository.created_at)}
                </span>
                {repository.owner?.organization_id && (
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    Org ID: {repository.owner?.organization_id}
                  </span>
                )}
                {/* <span className="flex items-center">
                  <Code2 className="h-4 w-4 mr-1" />
                  {snippets.length} snippets
                </span> */}
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
                <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
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
                    onClose={() => setSettingsDialogOpen(false)}
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

const FriendsModalContent = ({
  friends,
  friendsLoading,
  friendsError,
  friendsSuccess,
  actionLoading,
  searchQuery,
  searchResults,
  searchLoading,
  hasSearched,
  onDeleteFriend,
  onSearchQueryChange,
  onSearchSubmit,
  onAddFriend
}: {
  friends: Friend[]
  friendsLoading: boolean
  friendsError: string
  friendsSuccess: string
  actionLoading: boolean
  searchQuery: string
  searchResults: SearchUser[]
  searchLoading: boolean
  hasSearched: boolean
  onDeleteFriend: (id: number) => void
  onSearchQueryChange: (query: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  onAddFriend: (userId: number) => void
}) => {
  return (
    <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>Find Friends</DialogTitle>
        <DialogDescription>Search for users to add as friends</DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-hidden">
        <FindFriendsTab 
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
          hasSearched={hasSearched}
          friendsError={friendsError}
          friendsSuccess={friendsSuccess}
          actionLoading={actionLoading}
          onSearchQueryChange={onSearchQueryChange}
          onSearchSubmit={onSearchSubmit}
          onAddFriend={onAddFriend}
        />
      </div>
    </DialogContent>
  )
}

const FindFriendsTab = ({
  searchQuery,
  searchResults,
  searchLoading,
  hasSearched,
  friendsError,
  friendsSuccess,
  actionLoading,
  onSearchQueryChange,
  onSearchSubmit,
  onAddFriend
}: {
  searchQuery: string
  searchResults: SearchUser[]
  searchLoading: boolean
  hasSearched: boolean
  friendsError: string
  friendsSuccess: string
  actionLoading: boolean
  onSearchQueryChange: (query: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  onAddFriend: (userId: number) => void
}) => {
  return (
    <div className="space-y-4">
      {friendsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{friendsError}</AlertDescription>
        </Alert>
      )}
      
      {friendsSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{friendsSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search Users
          </label>
          <div className="flex space-x-3 px-1">
            <Input
              id="search"
              placeholder="Enter name or email..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button 
              type="button"
              onClick={(e) => onSearchSubmit(e)}
              disabled={searchLoading || !searchQuery.trim()}
              className="shrink-0"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {searchResults.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.is_friend ? (
                    <Badge variant="secondary">Already Friends</Badge>
                  ) : (
                    <Button
                      onClick={() => onAddFriend(user.id)}
                      disabled={actionLoading}
                      size="sm"
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Add Friend
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hasSearched && searchResults.length === 0 && !searchLoading && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No users found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Start typing to search for users</p>
            <p className="text-sm">Click the Search button to find users</p>
          </div>
        )}
      </div>
    </div>
  )
}

const InvitationModalContent = ({
  invitationError,
  invitationSuccess,
  invitationActionLoading,
  invitationSearchQuery,
  invitationSearchResults,
  invitationSearchLoading,
  hasInvitationSearched,
  onInvitationSearchQueryChange,
  onInvitationSearchSubmit,
  onSendInvitation
}: {
  invitationError: string
  invitationSuccess: string
  invitationActionLoading: boolean
  invitationSearchQuery: string
  invitationSearchResults: InvitationSearchUser[]
  invitationSearchLoading: boolean
  hasInvitationSearched: boolean
  onInvitationSearchQueryChange: (query: string) => void
  onInvitationSearchSubmit: (e: React.FormEvent) => void
  onSendInvitation: (userId: number) => void
}) => {
  return (
    <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>Invite Users to Organization</DialogTitle>
        <DialogDescription>Search for users to invite to your organization</DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-hidden">
        <FindInvitationTab 
          invitationSearchQuery={invitationSearchQuery}
          invitationSearchResults={invitationSearchResults}
          invitationSearchLoading={invitationSearchLoading}
          hasInvitationSearched={hasInvitationSearched}
          invitationError={invitationError}
          invitationSuccess={invitationSuccess}
          invitationActionLoading={invitationActionLoading}
          onInvitationSearchQueryChange={onInvitationSearchQueryChange}
          onInvitationSearchSubmit={onInvitationSearchSubmit}
          onSendInvitation={onSendInvitation}
        />
      </div>
    </DialogContent>
  )
}

const FindInvitationTab = ({
  invitationSearchQuery,
  invitationSearchResults,
  invitationSearchLoading,
  hasInvitationSearched,
  invitationError,
  invitationSuccess,
  invitationActionLoading,
  onInvitationSearchQueryChange,
  onInvitationSearchSubmit,
  onSendInvitation
}: {
  invitationSearchQuery: string
  invitationSearchResults: InvitationSearchUser[]
  invitationSearchLoading: boolean
  hasInvitationSearched: boolean
  invitationError: string
  invitationSuccess: string
  invitationActionLoading: boolean
  onInvitationSearchQueryChange: (query: string) => void
  onInvitationSearchSubmit: (e: React.FormEvent) => void
  onSendInvitation: (userId: number) => void
}) => {
  return (
    <div className="space-y-4">
      {invitationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{invitationError}</AlertDescription>
        </Alert>
      )}
      
      {invitationSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{invitationSuccess}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="invitation-search" className="block text-sm font-medium mb-2">
            Search Users
          </label>
          <div className="flex space-x-3 px-1">
            <Input
              id="invitation-search"
              placeholder="Enter name or email..."
              value={invitationSearchQuery}
              onChange={(e) => onInvitationSearchQueryChange(e.target.value)}
              className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button 
              type="button"
              onClick={(e) => onInvitationSearchSubmit(e)}
              disabled={invitationSearchLoading || !invitationSearchQuery.trim()}
              className="shrink-0"
            >
              {invitationSearchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {invitationSearchResults.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.is_invited ? (
                    <Badge variant="secondary">Already Invited</Badge>
                  ) : (
                    <Button
                      onClick={() => onSendInvitation(user.id)}
                      disabled={invitationActionLoading}
                      size="sm"
                    >
                      {invitationActionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Send Invite
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hasInvitationSearched && invitationSearchResults.length === 0 && !invitationSearchLoading && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No users found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {!hasInvitationSearched && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Start typing to search for users</p>
            <p className="text-sm">Click the Search button to find users</p>
          </div>
        )}
      </div>
    </div>
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
  const [friends, setFriends] = useState<Friend[]>([])
  const [currentUserOrganization, setCurrentUserOrganization] = useState<Organization | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  
  // Friends functionality state
  const [friendsModalOpen, setFriendsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [friendsError, setFriendsError] = useState("")
  const [friendsSuccess, setFriendsSuccess] = useState("")

  // Invitation functionality state
  const [invitationModalOpen, setInvitationModalOpen] = useState(false)
  const [invitationSearchQuery, setInvitationSearchQuery] = useState("")
  const [invitationSearchResults, setInvitationSearchResults] = useState<InvitationSearchUser[]>([])
  const [hasInvitationSearched, setHasInvitationSearched] = useState(false)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const [invitationSearchLoading, setInvitationSearchLoading] = useState(false)
  const [invitationActionLoading, setInvitationActionLoading] = useState(false)
  const [invitationError, setInvitationError] = useState("")
  const [invitationSuccess, setInvitationSuccess] = useState("")

  // Friends functionality
  const loadFriends = async () => {
    setFriendsLoading(true)
    setFriendsError("")
    try {
      const response = await friendshipAPI.getFriends()
      if (response.friends) {
        setFriends(response.friends)
      }
    } catch (error: any) {
      setFriendsError(error.message || "Failed to load friends list")
    } finally {
      setFriendsLoading(false)
    }
  }

  const loadOrganization = async () => {
    try {
      const response = await organizationAPI.getOrganization()
      if (response.organization) {
        setCurrentUserOrganization(response.organization)
      }
    } catch (error: any) {
      setCurrentUserOrganization(null)
    }
  }

  const loadInvitation = async () => {
    try {
      const response = await invitationAPI.getInvitation()
      console.log("Loaded invitations:", response)
      if (response.invitations) {
        setInvitations(response.invitations)
      }
    } catch (error: any) {
      console.error("Failed to load invitations:", error)
      setInvitations([])
    }
  }

  const loadRepository = async () => {
    try {
      const response = await repositoryAPI.getRepository()
      console.log("Loaded repositories:", response)
      if (response.repositories) {
        setRepositoriesOwnedByMe(response.repositories)
      }
    } catch (error: any) {
      console.error("Failed to load repositories:", error)
      setRepositoriesOwnedByMe([])
    }
  }

  const loadRepositoryFromFriend = async () => {
    try {
      const response = await repositoryAPI.getRepositoryFromFriend()
      console.log("Loaded friends' repositories:", response)
      if (response.repositories) {
        setRepositoriesOwnedByFriends(response.repositories)
      }
    } catch (error: any) {
      console.error("Failed to load friends' repositories:", error)
      setRepositoriesOwnedByFriends([])
    }
  }

  const loadRepositoryFromOrganization = async () => {
    try {
      const response = await repositoryAPI.getRepositoryFromOrganization()
      console.log("Loaded organization repositories:", response)
      if (response.repositories) {
        setRepositoriesOwnedByOrganization(response.repositories)
      }
    } catch (error: any) {
      console.error("Failed to load organization repositories:", error)
      setRepositoriesOwnedByOrganization([])
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setSearchLoading(true)
    setFriendsError("")
    setHasSearched(true)
    try {
      const response = await friendshipAPI.searchUsers(searchQuery.trim(), 20)
      if (response.users) {
        setSearchResults(response.users)
      }
    } catch (error: any) {
      setFriendsError(error.message || "Failed to search users")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchUsers()
    }
  }

  const addFriend = async (userId: number) => {
    setActionLoading(true)
    setFriendsError("")
    setFriendsSuccess("")

    try {
      const response = await friendshipAPI.addFriend(userId)
      if (response.message) {
        setFriendsSuccess(response.message || "Friend added successfully!")
        loadFriends()
        // 重新搜尋以更新 is_friend 狀態
        if (searchQuery.trim()) {
          searchUsers()
        }
      }
    } catch (error: any) {
      setFriendsError(error.message || "Failed to add friend")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteFriend = async (friendId: number) => {
    setActionLoading(true)
    setFriendsError("")
    setFriendsSuccess("")

    try {
      const response = await friendshipAPI.removeFriend(friendId)
      if (response.message) {
        setFriendsSuccess(response.message || "Friend removed successfully!")
        loadFriends()
        // 重新搜尋以更新 is_friend 狀態
        if (searchQuery.trim()) {
          searchUsers()
        }
      }
    } catch (error: any) {
      setFriendsError(error.message || "Failed to remove friend")
    } finally {
      setActionLoading(false)
    }
  }

  const clearFriendsMessages = () => {
    setFriendsError("")
    setFriendsSuccess("")
    setSearchResults([])
    setHasSearched(false)
  }

  // Invitation functionality
  const searchUsersForInvitation = async () => {
    if (!invitationSearchQuery.trim()) {
      setInvitationSearchResults([])
      setHasInvitationSearched(false)
      return
    }

    setInvitationSearchLoading(true)
    setInvitationError("")
    setHasInvitationSearched(true)
    try {
      const response = await invitationAPI.searchUsers(invitationSearchQuery.trim())
      if (response.users) {
        setInvitationSearchResults(response.users)
      }
    } catch (error: any) {
      setInvitationError(error.message || "Failed to search users")
      setInvitationSearchResults([])
    } finally {
      setInvitationSearchLoading(false)
    }
  }

  const handleInvitationSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (invitationSearchQuery.trim()) {
      searchUsersForInvitation()
    }
  }

  const sendInvitation = async (userId: number) => {
    setInvitationActionLoading(true)
    setInvitationError("")
    setInvitationSuccess("")

    try {
      const response = await invitationAPI.sendInvitation(userId)
      if (response.message) {
        setInvitationSuccess(response.message || "Invitation sent successfully!")
        // 重新搜尋以更新 is_invited 狀態
        if (invitationSearchQuery.trim()) {
          searchUsersForInvitation()
        }
      }
    } catch (error: any) {
      setInvitationError(error.message || "Failed to send invitation")
    } finally {
      setInvitationActionLoading(false)
    }
  }

  const clearInvitationMessages = () => {
    setInvitationError("")
    setInvitationSuccess("")
    setInvitationSearchResults([])
    setHasInvitationSearched(false)
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      console.log("Current user data loaded:", user)
      setCurrentUser(user)
      // Update repositories with current user data
      
      // Load friends when component mounts
      loadRepository()
      loadRepositoryFromFriend()
      loadRepositoryFromOrganization()
      loadFriends()
      loadOrganization()
      loadInvitation()
    }
  }, [])

  // Repositories with embedded snippets and permission levels
  const [repositoriesOwnedByMe, setRepositoriesOwnedByMe] = useState<Repository[]>([])
  const [repositoriesOwnedByFriends, setRepositoriesOwnedByFriends] = useState<Repository[]>([])
  const [repositoriesOwnedByOrganization, setRepositoriesOwnedByOrganization] = useState<Repository[]>([])

  const handleCreateOrganization = async () => {
    try {
      const response = await organizationAPI.createOrganization(newOrgName)
      console.log("Organization created:", response.organization)
      setCurrentUserOrganization(response.organization)
    } catch (error: any) {
      console.error("Failed to create organization:", error.message)
    } finally {
      setNewOrgName("")
    }
  }

  const handleLeaveOrganization = async () => {
    try {
      const response = await organizationAPI.leaveOrganization()
      console.log("Left organization:", response.message)
      setCurrentUserOrganization(null)
    } catch (error: any) {
      console.error("Failed to leave organization:", error.message)
    }
  }

  const handleAcceptInvitation = async (organization_id: number) => {
    try {
      const response = await invitationAPI.acceptInvitation(organization_id)
      console.log("Invitation accepted:", response.message)
      // Reload organization data
      await loadOrganization()
      await loadInvitation()
    } catch (error: any) {
      console.error("Failed to accept invitation:", error.message)
    }
  }

  const handleDeclineInvitation = async (organization_id: number) => {
    try {
      const response = await invitationAPI.declineInvitation(organization_id)
      console.log("Invitation declined:", response.message)
      // Reload invitations
      await loadInvitation()
    } catch (error: any) {
      console.error("Failed to decline invitation:", error.message)
    }
  }

  const handleInviteToOrganization = () => {
    if (!currentUserOrganization) {
      setShowInviteError(true)
      return
    }
    clearInvitationMessages()
  }

  const handleCreateRepository = async (newRepo: any) => {
    try {
      console.log("Creating repository with data:", newRepo)
      const response = await repositoryAPI.createRepository(
        newRepo.name,
        newRepo.friend_permission,
        newRepo.organization_permission,
        newRepo.public_permission
      )
      console.log("Repository created:", response.repository)
      loadRepository() // Reload repositories after creation
      // Add the new repository to the UI
      // if (response.repository) {
      //   setRepositoriesOwnedByMe((prev) => [...prev, response.repository])
      // }
    } catch (error) {
      console.error("Failed to create repository:", error)
      // You might want to show an error message to the user here
    }
  }

  const reloadAllRepositories = async () => {
    await Promise.all([
      loadRepository(),
      loadRepositoryFromFriend(),
      loadRepositoryFromOrganization()
    ])
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
            <div className="flex items-center space-x-4">
              {/* Current User Info */}
              <div className="text-sm text-gray-600">
                Welcome, {currentUser.name}
              </div>
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
                          .map((n: string) => n[0])
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
                  {currentUserOrganization ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-sm font-medium">#{currentUserOrganization.id} - {currentUserOrganization.name}</p>
                        <p className="text-xs text-gray-500">Established&nbsp;on&nbsp;{dayjs(currentUserOrganization.created_at).format('YYYY-MM-DD')}</p>
                      </div>
                      <Button onClick={handleLeaveOrganization} variant="outline" size="sm" className="w-full">
                        Leave
                      </Button>
                      <Dialog open={invitationModalOpen} onOpenChange={setInvitationModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full" onClick={handleInviteToOrganization}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite
                          </Button>
                        </DialogTrigger>
                        <InvitationModalContent
                          invitationError={invitationError}
                          invitationSuccess={invitationSuccess}
                          invitationActionLoading={invitationActionLoading}
                          invitationSearchQuery={invitationSearchQuery}
                          invitationSearchResults={invitationSearchResults}
                          invitationSearchLoading={invitationSearchLoading}
                          hasInvitationSearched={hasInvitationSearched}
                          onInvitationSearchQueryChange={setInvitationSearchQuery}
                          onInvitationSearchSubmit={handleInvitationSearchSubmit}
                          onSendInvitation={sendInvitation}
                        />
                      </Dialog>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 text-center py-2">You don't belong to any organization</p>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Building2 className="h-4 w-4 mr-2" />
                                Create
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Organization</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  {/* <Label htmlFor="org-name">Organization Name</Label> */}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="">
                                <Inbox className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Organization Invitations</DialogTitle>
                                <DialogDescription>Pending organization invitations</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3">
                                {invitations.length === 0 ? (
                                  <p className="text-sm text-gray-500 text-center py-4">No pending invitations</p>
                                ) : (
                                  invitations.map((invitation) => (
                                    <div key={invitation.user_id + "-" + invitation.organization_id} className="flex items-center justify-between p-3 border rounded">
                                      <div>
                                        <p className="font-medium">{invitation.organization.name}</p>
                                        <p className="text-xs text-gray-400">
                                          {dayjs(invitation.created_at).format('YYYY-MM-DD')}
                                        </p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button onClick={() => handleAcceptInvitation(invitation.organization_id)} size="sm">Accept</Button>
                                        <Button onClick={() => handleDeclineInvitation(invitation.organization_id)} size="sm" variant="outline">Decline</Button>
                                      </div>
                                    </div>
                                  ))
                                )}
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
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Friends ({friends.length})
                    </div>
                    <Dialog open={friendsModalOpen} onOpenChange={setFriendsModalOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setFriendsModalOpen(true)
                            clearFriendsMessages()
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <FriendsModalContent 
                        friends={friends}
                        friendsLoading={friendsLoading}
                        friendsError={friendsError}
                        friendsSuccess={friendsSuccess}
                        actionLoading={actionLoading}
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        hasSearched={hasSearched}
                        onDeleteFriend={handleDeleteFriend}
                        onSearchQueryChange={setSearchQuery}
                        onSearchSubmit={handleSearchSubmit}
                        onAddFriend={addFriend}
                      />
                    </Dialog>
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
                  
                  {friends.length > 3 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">{friends.length - 3} more friends</p>
                    </div>
                  )}
                  
                  {friends.length === 0 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">No friends yet</p>
                      <p className="text-xs text-gray-400 mt-1">Click + to search for friends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>

            {/* Main Content - Only Repositories */}
            <main className="flex-1 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Repositories</h2>
                <NewRepositoryDialog onSave={handleCreateRepository} />
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
                      currentUser={currentUser}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "me")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "me")}
                      onReloadRepositories={reloadAllRepositories}
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
                      currentUser={currentUser}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "friends")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "friends")}
                      onReloadRepositories={reloadAllRepositories}
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
                      currentUser={currentUser}
                      onUpdateRepository={(updatedRepo) => updateRepositoryInSection(updatedRepo, "organization")}
                      onDeleteRepository={(repoId) => handleDeleteRepository(repoId, "organization")}
                      onReloadRepositories={reloadAllRepositories}
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
