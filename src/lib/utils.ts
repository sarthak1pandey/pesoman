import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    FOOD: "restaurant",
    TRANSPORT: "directions_car",
    ACCOMMODATION: "bed",
    ENTERTAINMENT: "movie",
    SHOPPING: "shopping_bag",
    FUEL: "local_gas_station",
    ACTIVITIES: "surfing",
    OTHER: "receipt",
  };
  return icons[category] || "receipt";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    FOOD: "bg-secondary-container/20 text-secondary",
    TRANSPORT: "bg-primary-container/20 text-primary",
    ACCOMMODATION: "bg-tertiary-container/30 text-tertiary",
    ENTERTAINMENT: "bg-secondary-fixed/30 text-on-secondary-fixed-variant",
    SHOPPING: "bg-primary-fixed/30 text-on-primary-fixed-variant",
    FUEL: "bg-tertiary-fixed/30 text-on-tertiary-fixed-variant",
    ACTIVITIES: "bg-secondary-container/20 text-secondary",
    OTHER: "bg-surface-container-high text-on-surface-variant",
  };
  return colors[category] || "bg-surface-container-high text-on-surface-variant";
}
