"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { isAuthenticated, authAPI, removeAuthToken } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setIsAuth(false)
        window.location.href = "/auth/login"
        setIsLoading(false)
        return
      }

      try {
        // Verify token with server
        const response = await authAPI.checkAuth()
        if (response.authenticated) {
          setIsAuth(true)
        } else {
          removeAuthToken()
          setIsAuth(false)
          window.location.href = "/auth/login"
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        removeAuthToken()
        setIsAuth(false)
        window.location.href = "/auth/login"
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuth) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
