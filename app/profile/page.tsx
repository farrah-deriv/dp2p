"use client"

import { useState, useEffect } from "react"
import UserInfo from "@/components/profile/user-info"
import TradeLimits from "@/components/profile/trade-limits"
import StatsTabs from "./components/stats-tabs"
import { API, AUTH } from "@/lib/local-variables"

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    username: "John_doe",
    rating: "Not rated yet",
    completionRate: "",
    joinDate: "Joined today",
    blockedCount: 2,
    realName: "",
    balance: "",
    isVerified: {
      id: true,
      address: true,
      phone: true,
    },
    businessHours: {
      isOpen: true,
      availability: "available 24/7",
    },
    tradeLimits: {
      buy: {
        current: 0,
        max: 0,
      },
      sell: {
        current: 0,
        max: 0,
      },
    },
    stats: {
      buyCompletion: { rate: "", period: "" },
      sellCompletion: { rate: "100% (50)", period: "" },
      avgPayTime: { time: "", period: "" },
      avgReleaseTime: { time: "", period: "" },
      tradePartners: 0,
      totalOrders30d: 0,
      totalOrdersLifetime: 0,
      tradeVolume30d: { amount: "", currency: "", period: "" },
      tradeVolumeLifetime: { amount: "", currency: "" },
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Change to users/me endpoint
        const url = `${API.baseUrl}/users/me`

        console.log("=== USERS/ME API CALL ===")
        console.log("Request URL:", url)
        console.log("Request Headers:", {
          ...AUTH.getAuthHeader(),
          accept: "application/json",
        })

        const response = await fetch(url, {
          headers: {
            ...AUTH.getAuthHeader(),
            accept: "application/json",
          },
        })

        console.log("Response Status:", response.status, response.statusText)
        console.log("Response Headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`)
        }

        const responseData = await response.json()

        console.log("=== USERS/ME API RESPONSE ===")
        console.log("Full Response:", JSON.stringify(responseData, null, 2))

        // Store the full response in localStorage for debugging
        localStorage.setItem("users_me_response", JSON.stringify(responseData))
        console.log("Response stored in localStorage as 'users_me_response'")

        if (responseData && responseData.data) {
          const data = responseData.data
          console.log("=== PROCESSING USER DATA ===")
          console.log("User Data:", JSON.stringify(data, null, 2))

          const joinDate = new Date(data.created_at)
          const now = new Date()
          const diff = now.getTime() - joinDate.getTime()
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))

          let joinDateString
          if (days === 0) {
            joinDateString = "Joined today"
          } else if (days === 1) {
            joinDateString = "Joined yesterday"
          } else {
            joinDateString = `Joined ${days} days ago`
          }

          const processedUserData = {
            username: data.nickname || "John_doe",
            rating: data.rating_average_lifetime !== null ? `${data.rating_average_lifetime}/5` : "Not rated yet",
            completionRate: `${data.completion_average_30day || 0}%`,
            joinDate: joinDateString,
            tradeLimits: {
              buy: {
                current: data.daily_limits_remaining?.buy || 0,
                max: data.daily_limits?.buy || 0,
              },
              sell: {
                current: data.daily_limits_remaining?.sell || 0,
                max: data.daily_limits?.sell || 0,
              },
            },
            balance: data.balances?.USD?.amount || 0,
          }

          console.log("=== PROCESSED USER DATA ===")
          console.log("Processed Data:", JSON.stringify(processedUserData, null, 2))

          setUserData((prevData) => ({
            ...prevData,
            ...processedUserData,
          }))
        }
      } catch (error) {
        console.error("=== USERS/ME API ERROR ===")
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="px-4 md:px-4">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="flex-1 order-1">
          <UserInfo
            username={userData.username}
            rating={userData.rating}
            completionRate={userData.completionRate}
            joinDate={userData.joinDate}
            blockedCount={userData.blockedCount}
            realName={userData.realName}
            isVerified={userData.isVerified}
          />
          <StatsTabs stats={userData.stats} />
        </div>

        <div className="md:w-[40%] h-full flex flex-col gap-6 order-2">
          <TradeLimits
            buyLimit={userData.tradeLimits.buy}
            sellLimit={userData.tradeLimits.sell}
            balance={userData.balance}
          />
        </div>
      </div>
    </div>
  )
}
