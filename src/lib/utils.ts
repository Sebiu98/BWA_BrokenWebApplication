//Helper per classi tailwind.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

//Unisce classi e risolve conflitti tailwind.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
