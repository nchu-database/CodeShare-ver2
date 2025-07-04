// Auth utility functions for API calls and token management

import { get } from "http"
import { projectUpdate } from "next/dist/build/swc/generated-native"
import { send } from "process"

const API_BASE_URL = 'http://10.10.30.246:8000/api'

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
}

// Get user data from localStorage
export const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  }
  return null
}

// Set user data in localStorage
export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// Make authenticated API request
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  return fetch(url, config)
}

// Auth API functions
export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  // Register
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    })
    return response.json()
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  // Validate reset token
  validateResetToken: async (token: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/validate-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    })
    return response.json()
  },

  // Reset password
  resetPassword: async (token: string, email: string, password: string, password_confirmation: string) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token, email, password, password_confirmation }),
    })
    return response.json()
  },

  // Get user data
  getUser: async () => {
    const response = await apiRequest('/auth/user')
    return response.json()
  },

  // Check auth status
  checkAuth: async () => {
    const response = await apiRequest('/auth/check')
    return response.json()
  },

  // Logout
  logout: async () => {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    })
    const result = await response.json()
    removeAuthToken() // Clear local storage
    return result
  },

  // Update password
  updatePassword: async (current_password: string, password: string, password_confirmation: string) => {
    const response = await apiRequest('/user/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, password, password_confirmation }),
    })
    return response.json()
  },

  // Update profile
  updateProfile: async (name: string, email: string) => {
    const response = await apiRequest('/user/profile-information', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    })
    return response.json()
  },

  // Token management
  getTokens: async () => {
    const response = await apiRequest('/auth/tokens')
    return response.json()
  },

  deleteToken: async (tokenId: string) => {
    const response = await apiRequest(`/auth/tokens/${tokenId}`, {
      method: 'DELETE',
    })
    return response.json()
  },

  deleteOtherTokens: async () => {
    const response = await apiRequest('/auth/tokens/others', {
      method: 'DELETE',
    })
    return response.json()
  },

  deleteAllTokens: async () => {
    const response = await apiRequest('/auth/tokens/all', {
      method: 'DELETE',
    })
    removeAuthToken() // Clear local storage
    return response.json()
  },

  // Two-factor authentication
  enableTwoFactor: async () => {
    const response = await apiRequest('/user/two-factor-authentication', {
      method: 'POST',
    })
    return response.json()
  },

  getTwoFactorQR: async () => {
    const response = await apiRequest('/user/two-factor-qr-code')
    return response.json()
  },

  getTwoFactorRecoveryCodes: async () => {
    const response = await apiRequest('/user/two-factor-recovery-codes')
    return response.json()
  },

  regenerateRecoveryCodes: async () => {
    const response = await apiRequest('/user/two-factor-recovery-codes', {
      method: 'POST',
    })
    return response.json()
  },

  disableTwoFactor: async () => {
    const response = await apiRequest('/user/two-factor-authentication', {
      method: 'DELETE',
    })
    return response.json()
  },

  confirmTwoFactor: async (code: string) => {
    const response = await apiRequest('/user/confirmed-two-factor-authentication', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
    return response.json()
  },
}

// Friendship API functions
export const friendshipAPI = {
  // Get friends list
  getFriends: async () => {
    console.log('🔄 API Call: Getting friends list')
    const response = await apiRequest('/friendships')
    const data = await response.json()
    console.log('📊 API Response - Get Friends:', { status: response.status, data })
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get friends list')
    }
    
    return data
  },

  // Add friend
  addFriend: async (friend_id: number) => {
    const response = await apiRequest('/friendships', {
      method: 'POST',
      body: JSON.stringify({ friend_id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add friend')
    }
    
    return data
  },

  // Remove friend
  removeFriend: async (friendId: number) => {
    const response = await apiRequest(`/friendships/${friendId}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove friend')
    }
    
    return data
  },

  // Check friendship status
  checkFriendship: async (userId: number) => {
    const response = await apiRequest(`/friendships/check/${userId}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to check friendship status')
    }
    
    return data
  },

  // Search users
  searchUsers: async (query: string, limit: number = 10) => {
    console.log('🔍 API Call: Searching users', { query, limit })
    const response = await apiRequest(`/friendships/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    const data = await response.json()
    console.log('📊 API Response - Search Users:', { status: response.status, data })
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search users')
    }
    
    return data
  },

  // Get friendship statistics
  getStatistics: async () => {
    const response = await apiRequest('/friendships/statistics')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get statistics')
    }
    
    return data
  },
}

export const organizationAPI = {
  createOrganization: async (name: string) => {
    const response = await apiRequest('/organization', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create organization')
    }
    
    return data
  },
  getOrganization: async () => {
    const response = await apiRequest('/organization', {
      method: 'GET'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get organization')
    }
    return data
  },
  leaveOrganization: async () => {
    const response = await apiRequest('/organization', {
      method: 'DELETE'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to leave organization')
    }
    return data
  },
}

export const invitationAPI = {
  getInvitation: async () => {
    const response = await apiRequest('/invitation', {
      method: 'GET'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get invitation')
    }
    return data
  },
  sendInvitation: async (id: number) => {
    const response = await apiRequest('/invitation/invite', {
      method: 'POST',
      body: JSON.stringify({ id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send invitation')
    }
    
    return data
  },
  acceptInvitation: async (organizationId: number) => {
    const response = await apiRequest('/invitation/accept', {
      method: 'POST',
      body: JSON.stringify({ organization_id: organizationId }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to accept invitation')
    }
    
    return data
  },
  declineInvitation: async (organizationId: number) => {
    const response = await apiRequest('/invitation/decline', {
      method: 'POST',
      body: JSON.stringify({ organization_id: organizationId }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to decline invitation')
    }
    
    return data
  },
  searchUsers: async (query: string) => {
    const response = await apiRequest('/invitation/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to search users for invitation')
    }
    return data
  }
}

export const repositoryAPI = {
  getRepository: async () => {
    const response = await apiRequest('/repository', {
      method: 'GET'
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get repository')
    }
    
    return data
  },
  getRepositoryFromFriend: async () => {
    const response = await apiRequest('/repository/friends', {
      method: 'GET'
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get repository from friend')
    }
    
    return data
  },
  getRepositoryFromOrganization: async () => {
    const response = await apiRequest('/repository/organizations', {
      method: 'GET'
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get repository from organization')
    }
    
    return data
  },
  createRepository: async (name: string, friend_permission: string, organization_permission: string, public_permission: string) => {
    const response = await apiRequest('/repository', {
      method: 'POST',
      body: JSON.stringify({ name, friend_permission, organization_permission, public_permission }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create repository')
    }
    
    return data
  },
  destroyRepository: async (repository_id: number) => {
    const response = await apiRequest(`/repository`, {
      method: 'DELETE',
      body: JSON.stringify({ repository_id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to destroy repository')
    }
    
    return data
  },
  updateRepository: async (repository_id: number, name: string, friend_permission: string, organization_permission: string, public_permission: string) => {
    const response = await apiRequest(`/repository/update`, {
      method: 'POST',
      body: JSON.stringify({ repository_id, name, friend_permission, organization_permission, public_permission }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update repository')
    }
    
    return data
  },
}

export const snippetAPI = {
  getLanguages: async () => {
    const response = await apiRequest('/snippet/languages', {
      method: 'GET'
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get languages')
    }
    
    return data
  },
  createSnippet: async (repository_id: number, title: string, description: string, content: string, language_id: number) => {
    const response = await apiRequest('/snippet/create', {
      method: 'POST',
      body: JSON.stringify({ repository_id, title, description, content, language_id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create snippet')
    }
    
    return data
  },
  updateSnippet: async (snippet_id: number, title: string, description: string, content: string, language_id: number) => {
    const response = await apiRequest('/snippet/update', {
      method: 'POST',
      body: JSON.stringify({ snippet_id, title, description, content, language_id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update snippet')
    }
    
    return data
  },
  deleteSnippet: async (snippet_id: number) => {
    const response = await apiRequest('/snippet/delete', {
      method: 'DELETE',
      body: JSON.stringify({ snippet_id }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete snippet')
    }
    
    return data
  }
}
