"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { CountryCard } from "@/components/country-card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { getCountryByCode } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      try {
        setIsLoading(true)

        const { data, error } = await supabase.from("favorite_countries").select("*").eq("user_id", user.id)

        if (error) throw error

        // Fetch full country details for each favorite
        const countryPromises = data.map(async (fav) => {
          const countryData = await getCountryByCode(fav.country_code)
          return countryData[0]
        })

        const countries = await Promise.all(countryPromises)
        setFavorites(countries)
      } catch (error) {
        console.error("Error fetching favorites:", error)
        setError("Failed to load favorites. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user, supabase])

  const handleToggleFavorite = async (country: any, isFavorite: boolean) => {
    if (!isFavorite) {
      // Remove from UI immediately
      setFavorites((prev) => prev.filter((c) => c.cca3 !== country.cca3))
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Favorite Countries
        </motion.h1>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8">You haven't added any countries to your favorites yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((country) => (
              <CountryCard
                key={country.cca3}
                country={country}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
