"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Globe, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if user just registered
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setJustRegistered(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // If login successful and we have a user
      if (data.user) {
        try {
          // Check if user profile exists
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
            // Get username from user metadata if available
            const username = data.user.user_metadata?.username || email.split("@")[0]

            // Try to create profile with retry logic
            let retryCount = 0
            let profileCreated = false

            while (!profileCreated && retryCount < 3) {
              try {
                const { error: createError } = await supabase.rpc("create_user_profile", {
                  user_id: data.user.id,
                  user_name: username,
                })

                if (!createError) {
                  profileCreated = true
                  console.log("Profile created successfully")
                } else {
                  console.error(`Profile creation attempt ${retryCount + 1} failed:`, createError)
                  // Wait longer between each retry
                  await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
                  retryCount++
                }
              } catch (err) {
                console.error(`Profile creation attempt ${retryCount + 1} exception:`, err)
                retryCount++
                await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
              }
            }

            if (!profileCreated) {
              console.warn("Could not create profile after multiple attempts, but continuing login")
            }
          }
        } catch (profileErr) {
          console.error("Error handling profile:", profileErr)
          // Continue with login even if profile handling fails
        }

        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Globe className="h-12 w-12 text-emerald-600" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {justRegistered && (
              <Alert className="mb-4 bg-emerald-50 text-emerald-800 border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertDescription>Registration successful! Please sign in with your new account.</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
