"use client"

import { useEffect } from "react"
import WalletBalance from "./components/wallet-balance"

export default function WalletPage() {
  useEffect(() => {
    // Log user_data from localStorage when wallet page loads
    const userData = localStorage.getItem("user_data")
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        console.log("user_data from localStorage:", parsedUserData)
      } catch (error) {
        console.log("Error parsing user_data:", error)
        console.log("Raw user_data:", userData)
      }
    } else {
      console.log("No user_data found in localStorage")
    }
  }, [])

  return (
    <div className="min-h-screen bg-background px-4 md:px-4">
      <div className="container mx-auto px-4 py-6">
        <WalletBalance />
      </div>
    </div>
  )
}
