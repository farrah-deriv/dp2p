import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface PaymentMethod {
  id: number
  method: string
  type: string
  display_name: string
  fields: Record<string, any>
  created_at?: number
  is_default?: boolean
}

export function getCategoryDisplayName(type: string): string {
  switch (type) {
    case "bank":
      return "Bank transfer"
    case "ewallet":
      return "eWallet"
    default:
      return "Other"
  }
}

export function getMethodDisplayDetails(method: PaymentMethod) {
  if (method.type === "bank") {
    const account = method.fields.account?.value || ""
    const bankName = method.fields.bank_name?.value || "Bank Transfer"
    const maskedAccount = account ? account.slice(0, 6) + "****" + account.slice(-4) : "****"

    return {
      primary: maskedAccount,
      secondary: bankName,
    }
  } else {
    const account = method.fields.account?.value || ""
    const displayValue = account || method.display_name

    return {
      primary: displayValue,
      secondary: method.display_name,
    }
  }
}
