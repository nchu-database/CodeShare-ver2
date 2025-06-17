"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { User, Mail, Calendar, Shield } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = getUser()
    if (userData) {
      setUser(userData)
    }
  }, [])

  if (!user) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">Your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-gray-600">User ID: {user.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                
                {user.email_verified_at && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Email verified</span>
                  </div>
                )}

                {user.created_at && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email Verification</span>
                <Badge variant={user.email_verified_at ? "default" : "secondary"}>
                  {user.email_verified_at ? "Verified" : "Not Verified"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <Badge variant={user.two_factor_confirmed_at ? "default" : "secondary"}>
                  {user.two_factor_confirmed_at ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span>Account Type</span>
                <Badge variant="outline">
                  {user.organization_id ? "Organization Member" : "Individual"}
                </Badge>
              </div>

              {user.last_login_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Last login: {new Date(user.last_login_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Organization Info */}
        {user.organization_id && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Your organization membership details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Organization ID: {user.organization_id}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}
