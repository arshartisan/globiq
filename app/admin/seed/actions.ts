"use server"

import { createClient } from "@/lib/supabase/server"

export async function seedFavoriteCountries(userId: string) {
  try {
    const supabase = createClient()

    // Call the database function we created
    const { error } = await supabase.rpc("seed_favorite_countries", {
      user_id: userId,
    })

    if (error) {
      console.error("Error seeding favorite countries:", error)
      throw new Error("Failed to seed favorite countries")
    }

    return { success: true }
  } catch (error) {
    console.error("Server action error:", error)
    throw new Error("An unexpected error occurred")
  }
}
