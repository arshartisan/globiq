"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { CountryGrid } from "@/components/country-grid"
import { SearchFilters } from "@/components/search-filters"
import { getAllCountries, searchCountriesByName, getCountriesByRegion } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const [countries, setCountries] = useState<any[]>([])
  const [filteredCountries, setFilteredCountries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regions, setRegions] = useState<string[]>([])
  const [currentRegion, setCurrentRegion] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true)
        const data = await getAllCountries()
        setCountries(data)
        setFilteredCountries(data)

        // Extract unique regions
        const uniqueRegions = Array.from(new Set(data.map((country: any) => country.region)))
          .filter(Boolean)
          .sort() as string[]

        setRegions(uniqueRegions)
      } catch (error) {
        console.error("Error fetching countries:", error)
        setError("Failed to load countries. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  // Memoize the search function to avoid recreating it on every render
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query)

      try {
        setIsLoading(true)
        let data

        // If we have both a search query and a region filter
        if (query && currentRegion !== "all") {
          // First get countries by region
          const regionData = await getCountriesByRegion(currentRegion)
          // Then filter by name client-side
          data = regionData.filter((country: any) => country.name.common.toLowerCase().includes(query.toLowerCase()))
        }
        // If we only have a search query
        else if (query) {
          data = await searchCountriesByName(query)
        }
        // If we only have a region filter
        else if (currentRegion !== "all") {
          data = await getCountriesByRegion(currentRegion)
        }
        // If we have neither
        else {
          data = countries
        }

        setFilteredCountries(data)
      } catch (error) {
        console.error("Error searching countries:", error)
        setError("Failed to search countries. Please try again.")
        setFilteredCountries([])
      } finally {
        setIsLoading(false)
      }
    },
    [countries, currentRegion],
  )

  const handleRegionChange = async (region: string) => {
    setCurrentRegion(region)

    try {
      setIsLoading(true)
      let data

      // If we have both a region filter and a search query
      if (region !== "all" && searchQuery) {
        // First get countries by region
        const regionData = await getCountriesByRegion(region)
        // Then filter by name client-side
        data = regionData.filter((country: any) =>
          country.name.common.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }
      // If we only have a region filter
      else if (region !== "all") {
        data = await getCountriesByRegion(region)
      }
      // If we only have a search query
      else if (searchQuery) {
        data = await searchCountriesByName(searchQuery)
      }
      // If we have neither
      else {
        data = countries
      }

      setFilteredCountries(data)
    } catch (error) {
      console.error("Error filtering by region:", error)
      setError("Failed to filter countries. Please try again.")
      setFilteredCountries([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Explore Countries</h1>
          {/* {user && (
            <Button variant="outline" asChild>
              <Link href="/admin/seed">Seed Sample Data</Link>
            </Button>
          )} */}
        </div>

        <SearchFilters onSearch={handleSearch} onRegionChange={handleRegionChange} regions={regions} />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-8">No countries found. Try a different search.</div>
        ) : (
          <CountryGrid countries={filteredCountries} />
        )}
      </main>
    </>
  )
}
