"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { seedFavoriteCountries } from "@/app/admin/seed/actions"
import { Loader2, CheckCircle2, Database } from "lucide-react"
import { motion } from "framer-motion"

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSeedData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to seed data",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setIsSuccess(false)

    try {
      await seedFavoriteCountries(user.id)
      setIsSuccess(true)
      toast({
        title: "Data seeded successfully",
        description: "Sample favorite countries have been added to your account",
      })
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({
        title: "Error",
        description: "Failed to seed data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-600" />
                Seed Sample Data
              </CardTitle>
              <CardDescription>Add sample favorite countries to your account for testing purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will add 6 sample countries (France, Japan, Australia, Italy, Canada, and Brazil) to your favorites
                list. This is useful for testing the application.
              </p>

              {isSuccess && (
                <Alert className="mb-4 border-emerald-600 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Sample favorite countries have been added to your account. Visit the Favorites page to see them.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeedData} disabled={isLoading || !user}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding Data...
                  </>
                ) : (
                  "Seed Sample Data"
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </>
  )
}
