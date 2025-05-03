import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function getLanguages(languages: Record<string, string> | undefined): string {
  if (!languages) return "N/A"
  return Object.values(languages).join(", ")
}

export function getCurrencies(currencies: Record<string, { name: string; symbol: string }> | undefined): string {
  if (!currencies) return "N/A"
  return Object.values(currencies)
    .map((c) => `${c.name} (${c.symbol})`)
    .join(", ")
}
