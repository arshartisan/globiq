"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getCountryByCode } from "@/lib/api"
import { formatNumber, getLanguages, getCurrencies } from "@/lib/utils"
import { ArrowLeft, Heart, Loader2, Globe, Users, MapPin, Languages, Map } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CountryPage({ params }: { params: { code: string } }) {
  const [country, setCountry] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        setIsLoading(true)
        const data = await getCountryByCode(params.code)
        setCountry(data[0])
      } catch (error) {
        console.error("Error fetching country:", error)
        setError("Failed to load country details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    const checkIfFavorite = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("favorite_countries")
        .select("*")
        .eq("user_id", user.id)
        .eq("country_code", params.code)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite status:", error)
        return
      }

      setIsFavorite(!!data)
    }

    fetchCountry()
    checkIfFavorite()
  }, [params.code, user, supabase])

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      })
      return
    }

    setIsToggling(true)

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorite_countries")
          .delete()
          .eq("user_id", user.id)
          .eq("country_code", params.code)

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

      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Countries
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : country ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={country.flags.svg || country.flags.png}
                    alt={`Flag of ${country.name.common}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {country.coatOfArms?.svg && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Coat of Arms</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <div className="relative h-40 w-40">
                        <Image
                          src={country.coatOfArms.svg || "/placeholder.svg"}
                          alt={`Coat of Arms of ${country.name.common}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl">{country.name.common}</CardTitle>
                      <Button variant="outline" size="icon" onClick={handleToggleFavorite} disabled={isToggling}>
                        <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
                      </Button>
                    </div>
                    <CardDescription>{country.name.official}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Capital</p>
                          <p>{country.capital?.join(", ") || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Region</p>
                          <p>
                            {country.region} {country.subregion ? `(${country.subregion})` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Population</p>
                          <p>{formatNumber(country.population)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Languages</p>
                          <p>{getLanguages(country.languages)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Currencies</p>
                        <p>{getCurrencies(country.currencies)}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Area</p>
                        <p>{formatNumber(country.area)} km²</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Timezones</p>
                        <p>{country.timezones?.join(", ") || "N/A"}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Driving Side</p>
                        <p className="capitalize">{country.car?.side || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {country.borders && country.borders.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Bordering Countries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {country.borders.map((border: string) => (
                          <Button key={border} variant="outline" size="sm" asChild className="dark:border-gray-600">
                            <Link href={`/country/${border}`}>{border}</Link>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {country.maps && (
              <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Map className="h-5 w-5 text-emerald-600" />
                    Maps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" asChild className="dark:border-gray-600">
                      <a href={country.maps.googleMaps} target="_blank" rel="noopener noreferrer">
                        Open in Google Maps
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="dark:border-gray-600">
                      <a href={country.maps.openStreetMaps} target="_blank" rel="noopener noreferrer">
                        Open in OpenStreetMap
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8">Country not found</div>
        )}
      </main>
    </>
  )
}
