"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemeDebug() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Theme Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p>
            <strong>Current theme:</strong> {theme}
          </p>
          <p>
            <strong>Resolved theme:</strong> {resolvedTheme}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTheme("light")} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Light
          </button>
          <button onClick={() => setTheme("dark")} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            Dark
          </button>
          <button onClick={() => setTheme("system")} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">
            System
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
