import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function optimizeCloudinaryUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_limit/`);
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    const crores = price / 10000000;
    return `₹${crores % 1 === 0 ? crores : crores.toFixed(2).replace(/\.?0+$/, '')} Crore`;
  } else if (price >= 100000) {
    const lakhs = price / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}
