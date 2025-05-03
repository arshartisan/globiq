"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-provider"

interface CountryCardProps {
  country: any
  isFavorite?: boolean
  isFeatured?: boolean
  onToggleFavorite?: (country: any, isFavorite: boolean) => void
}

export function CountryCard({ country, isFavorite = false, isFeatured = false, onToggleFavorite }: CountryCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (favorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_countries")
          .delete()
          .eq("user_id", user.id)
          .eq("country_code", country.cca3)

        if (error) throw error

        toast({
          title: "Removed from favorites",
          description: `${country.name.common} has been removed from your favorites`,
        })
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorite_countries").insert({
          user_id: user.id,
          country_code: country.cca3,
          country_name: country.name.common,
        })

        if (error) throw error

        toast({
          title: "Added to favorites",
          description: `${country.name.common} has been added to your favorites`,
        })
      }

      setFavorite(!favorite)
      if (onToggleFavorite) {
        onToggleFavorite(country, !favorite)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Link href={`/country/${country.cca3}`} className="h-full block">
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
          <div className={`relative ${isFeatured ? "h-64" : "h-48"} w-full`}>
            <Image
              src={country.flags.svg || country.flags.png}
              alt={`Flag of ${country.name.common}`}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 dark:text-white">{country.name.common}</h3>
            <div className="space-y-1 text-sm dark:text-gray-300">
              <p>
                <span className="font-medium">Capital:</span> {country.capital?.[0] || "N/A"}
              </p>
              <p>
                <span className="font-medium">Region:</span> {country.region}
              </p>
              <p>
                <span className="font-medium">Population:</span> {formatNumber(country.population)}
              </p>
              {isFeatured && country.languages && (
                <p>
                  <span className="font-medium">Languages:</span>{" "}
                  {Object.values(country.languages).slice(0, 2).join(", ")}
                  {Object.values(country.languages).length > 2 && "..."}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="dark:text-gray-200 dark:hover:text-white dark:border-gray-600"
            >
              <Link href={`/country/${country.cca3}`}>View Details</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className="dark:text-gray-200 dark:hover:text-white"
            >
              <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
              <span className="sr-only">{favorite ? "Remove from favorites" : "Add to favorites"}</span>
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
