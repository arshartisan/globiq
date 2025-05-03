// API functions for fetching country data

// Get all countries
export async function getAllCountries() {
  const response = await fetch("https://restcountries.com/v3.1/all")
  if (!response.ok) {
    throw new Error("Failed to fetch countries")
  }
  return response.json()
}

// Search countries by name
export async function searchCountriesByName(name: string) {
  if (!name) return getAllCountries()

  const response = await fetch(`https://restcountries.com/v3.1/name/${name}`)
  if (response.status === 404) {
    return []
  }
  if (!response.ok) {
    throw new Error("Failed to search countries")
  }
  return response.json()
}

// Get countries by region
export async function getCountriesByRegion(region: string) {
  if (!region || region === "all") return getAllCountries()

  const response = await fetch(`https://restcountries.com/v3.1/region/${region}`)
  if (!response.ok) {
    throw new Error("Failed to fetch countries by region")
  }
  return response.json()
}

// Get country by code
export async function getCountryByCode(code: string) {
  const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`)
  if (!response.ok) {
    throw new Error("Failed to fetch country details")
  }
  return response.json()
}
