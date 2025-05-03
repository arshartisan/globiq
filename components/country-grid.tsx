"use client"

import { CountryCard } from "./country-card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-provider"
import { motion } from "framer-motion"

interface CountryGridProps {
  countries: any[]
}

export function CountryGrid({ countries }: CountryGridProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return

      const { data, error } = await supabase.from("favorite_countries").select("country_code").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching favorites:", error)
        return
      }

      const favMap: Record<string, boolean> = {}
      data.forEach((fav) => {
        favMap[fav.country_code] = true
      })

      setFavorites(favMap)
    }

    fetchFavorites()
  }, [user, supabase])

  const handleToggleFavorite = (country: any, isFavorite: boolean) => {
    setFavorites((prev) => ({
      ...prev,
      [country.cca3]: isFavorite,
    }))
  }

  // Function to determine if a country should be featured (larger card)
  const isFeaturedCountry = (index: number, country: any) => {
    // Feature countries that are either favorites or at specific positions in the grid
    return favorites[country.cca3] || index % 7 === 0 || index % 8 === 3
  }

  return (
    <div className="bento-grid">
      {countries.map((country, index) => {
        const isFeatured = isFeaturedCountry(index, country)
        return (
          <motion.div
            key={country.cca3}
            className={`bento-item ${isFeatured ? "bento-featured" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CountryCard
              country={country}
              isFavorite={favorites[country.cca3] || false}
              onToggleFavorite={handleToggleFavorite}
              isFeatured={isFeatured}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
