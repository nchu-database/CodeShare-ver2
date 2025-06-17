"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield, Key, User, Smartphone } from "lucide-react"
import { authAPI, getUser } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    twoFactor: false,
    tokens: false,
  })
  const [error, setError] = useState({
    profile: "",
    password: "",
    twoFactor: "",
    tokens: "",
  })
  const [success, setSuccess] = useState({
    profile: "",
    password: "",
    twoFactor: "",
    tokens: "",
  })

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Two-factor authentication
  const [twoFactorData, setTwoFactorData] = useState({
    enabled: false,
    qrCode: "",
    recoveryCodes: [],
    confirmationCode: "",
  })

  // Tokens
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    const userData = getUser()
    if (userData) {
      setUser(userData)
      setProfileData({
        name: userData.name || "",
        email: userData.email || "",
      })
    }
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await authAPI.getTokens()
      if (response.tokens) {
        setTokens(response.tokens)
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, profile: true }))
    setError(prev => ({ ...prev, profile: "" }))
    setSuccess(prev => ({ ...prev, profile: "" }))

    try {
      const response = await authAPI.updateProfile(profileData.name, profileData.email)
      
      if (response.message || response.success) {
        setSuccess(prev => ({ ...prev, profile: "Profile updated successfully!" }))
        
        // Update local user data
        const updatedUser = { ...user, name: profileData.name, email: profileData.email }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error: any) {
      setError(prev => ({ ...prev, profile: error.message || 'Failed to update profile' }))
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.password !== passwordData.password_confirmation) {
      setError(prev => ({ ...prev, password: "New passwords do not match" }))
      return
    }

    setLoading(prev => ({ ...prev, password: true }))
    setError(prev => ({ ...prev, password: "" }))
    setSuccess(prev => ({ ...prev, password: "" }))

    try {
      const response = await authAPI.updatePassword(
        passwordData.current_password,
        passwordData.password,
        passwordData.password_confirmation
      )
      
      if (response.message || response.success) {
        setSuccess(prev => ({ ...prev, password: "Password updated successfully!" }))
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        })
      } else {
        throw new Error(response.message || 'Password update failed')
      }
    } catch (error: any) {
      setError(prev => ({ ...prev, password: error.message || 'Failed to update password' }))
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  const enableTwoFactor = async () => {
    setLoading(prev => ({ ...prev, twoFactor: true }))
    try {
      const response = await authAPI.enableTwoFactor()
      const qrResponse = await authAPI.getTwoFactorQR()
      
      setTwoFactorData(prev => ({
        ...prev,
        qrCode: qrResponse.svg,
      }))
    } catch (error: any) {
      setError(prev => ({ ...prev, twoFactor: error.message || 'Failed to enable 2FA' }))
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }))
    }
  }

  const confirmTwoFactor = async () => {
    if (!twoFactorData.confirmationCode) {
      setError(prev => ({ ...prev, twoFactor: "Please enter the confirmation code" }))
      return
    }

    setLoading(prev => ({ ...prev, twoFactor: true }))
    try {
      const response = await authAPI.confirmTwoFactor(twoFactorData.confirmationCode)
      const codesResponse = await authAPI.getTwoFactorRecoveryCodes()
      
      setTwoFactorData(prev => ({
        ...prev,
        enabled: true,
        recoveryCodes: codesResponse.codes || [],
      }))
      setSuccess(prev => ({ ...prev, twoFactor: "Two-factor authentication enabled!" }))
    } catch (error: any) {
      setError(prev => ({ ...prev, twoFactor: error.message || 'Failed to confirm 2FA' }))
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }))
    }
  }

  const disableTwoFactor = async () => {
    setLoading(prev => ({ ...prev, twoFactor: true }))
    try {
      await authAPI.disableTwoFactor()
      setTwoFactorData({
        enabled: false,
        qrCode: "",
        recoveryCodes: [],
        confirmationCode: "",
      })
      setSuccess(prev => ({ ...prev, twoFactor: "Two-factor authentication disabled" }))
    } catch (error: any) {
      setError(prev => ({ ...prev, twoFactor: error.message || 'Failed to disable 2FA' }))
    } finally {
      setLoading(prev => ({ ...prev, twoFactor: false }))
    }
  }

  const deleteToken = async (tokenId: string) => {
    try {
      await authAPI.deleteToken(tokenId)
      setSuccess(prev => ({ ...prev, tokens: "Token deleted successfully" }))
      fetchTokens()
    } catch (error: any) {
      setError(prev => ({ ...prev, tokens: error.message || 'Failed to delete token' }))
    }
  }

  const deleteOtherTokens = async () => {
    try {
      await authAPI.deleteOtherTokens()
      setSuccess(prev => ({ ...prev, tokens: "Other tokens deleted successfully" }))
      fetchTokens()
    } catch (error: any) {
      setError(prev => ({ ...prev, tokens: error.message || 'Failed to delete tokens' }))
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Tokens
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account's profile information and email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error.profile && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.profile}</AlertDescription>
                  </Alert>
                )}

                {success.profile && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success.profile}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={loading.profile}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={loading.profile}
                    />
                  </div>

                  <Button type="submit" disabled={loading.profile}>
                    {loading.profile ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error.password && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.password}</AlertDescription>
                  </Alert>
                )}

                {success.password && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success.password}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        disabled={loading.password}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        disabled={loading.password}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                        disabled={loading.password}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        disabled={loading.password}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.password_confirmation}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                        disabled={loading.password}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        disabled={loading.password}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading.password}>
                    {loading.password ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add additional security to your account using two-factor authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error.twoFactor && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.twoFactor}</AlertDescription>
                  </Alert>
                )}

                {success.twoFactor && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success.twoFactor}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      {twoFactorData.enabled ? "Enabled" : "Not enabled"}
                    </p>
                  </div>
                  <Badge variant={twoFactorData.enabled ? "default" : "secondary"}>
                    {twoFactorData.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {!twoFactorData.enabled && !twoFactorData.qrCode && (
                  <Button onClick={enableTwoFactor} disabled={loading.twoFactor}>
                    {loading.twoFactor ? "Setting up..." : "Enable Two-Factor Authentication"}
                  </Button>
                )}

                {twoFactorData.qrCode && !twoFactorData.enabled && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Scan QR Code</h4>
                      <div dangerouslySetInnerHTML={{ __html: twoFactorData.qrCode }} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmationCode">Enter the code from your authenticator app</Label>
                      <Input
                        id="confirmationCode"
                        value={twoFactorData.confirmationCode}
                        onChange={(e) => setTwoFactorData(prev => ({ ...prev, confirmationCode: e.target.value }))}
                        placeholder="123456"
                        disabled={loading.twoFactor}
                      />
                    </div>

                    <Button onClick={confirmTwoFactor} disabled={loading.twoFactor}>
                      {loading.twoFactor ? "Confirming..." : "Confirm"}
                    </Button>
                  </div>
                )}

                {twoFactorData.enabled && (
                  <div className="space-y-4">
                    {twoFactorData.recoveryCodes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recovery Codes</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                        </p>
                        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                          {twoFactorData.recoveryCodes.map((code, index) => (
                            <div key={index} className="bg-gray-100 p-2 rounded">
                              {code}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="destructive" onClick={disableTwoFactor} disabled={loading.twoFactor}>
                      {loading.twoFactor ? "Disabling..." : "Disable Two-Factor Authentication"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>API Tokens</CardTitle>
                <CardDescription>
                  Manage your personal access tokens for API authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error.tokens && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.tokens}</AlertDescription>
                  </Alert>
                )}

                {success.tokens && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success.tokens}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button variant="outline" onClick={deleteOtherTokens}>
                    Revoke Other Sessions
                  </Button>
                  <p className="text-sm text-gray-600">
                    This will sign you out of all other browser sessions.
                  </p>
                </div>

                {tokens.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Active Tokens</h4>
                    <div className="space-y-2">
                      {tokens.map((token: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{token.name || `Token ${index + 1}`}</p>
                            <p className="text-sm text-gray-600">
                              Last used: {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteToken(token.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
