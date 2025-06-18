"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    token: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Get token and email from URL parameters
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    
    if (token) {
      setFormData(prev => ({ ...prev, token }))
    }
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }

    // Validate token if both token and email are available
    if (token && email) {
      validateResetToken(token, email)
    }
  }, [searchParams])

  const validateResetToken = async (token: string, email: string) => {
    setIsValidating(true)
    setError("")

    try {
      const response = await fetch('http://10.10.30.246:8000/api/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token, email })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setTokenValid(true)
      } else {
        setTokenValid(false)
        setError(data.message || "Invalid or expired reset token")
      }
    } catch (err) {
      console.error('Token validation error:', err)
      setTokenValid(false)
      setError("Failed to validate reset token")
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.token.trim()) {
      setError("Reset token is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('http://10.10.30.246:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password reset successfully! Redirecting to login...")
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 2000)
      } else {
        // Handle API error response
        if (data.message) {
          setError(data.message)
        } else if (data.errors) {
          // Handle validation errors
          const errorMessages = Object.values(data.errors).flat()
          setError(errorMessages.join(', '))
        } else {
          setError("Password reset failed. Please try again.")
        }
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError("Network error. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token validation status */}
          {isValidating && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Validating reset token...
              </AlertDescription>
            </Alert>
          )}

          {tokenValid === true && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Reset token is valid. You can proceed to reset your password.
              </AlertDescription>
            </Alert>
          )}

          {tokenValid === false && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The reset token is invalid or has expired. Please request a new password reset.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Only show form if token is valid or still validating */}
          {(tokenValid === true || isValidating || tokenValid === null) && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input
                id="token"
                name="token"
                type="text"
                placeholder="Enter reset token"
                value={formData.token}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || tokenValid === false}>
              {isLoading ? "Resetting password..." : "Reset password"}
            </Button>
          </form>
          )}

          {/* Show link to request new token if current token is invalid */}
          {tokenValid === false && (
            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
                Request new password reset
              </Link>
            </div>
          )}

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
