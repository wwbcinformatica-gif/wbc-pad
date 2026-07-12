import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function maskValue(value: string) {
  if (value.length <= 4) return "*".repeat(value.length)
  return value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2)
}
