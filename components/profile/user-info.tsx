"use client"

import { useState, useEffect } from "react"
import { Star, Check, Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { USER } from "@/lib/local-variables"

interface UserInfoProps {
  username: string
  rating: string
  completionRate: string
  joinDate: string
  blockedCount: number
  realName: string
  isVerified: {
    id: boolean
    address: boolean
    phone: boolean
  }
}

export default function UserInfo({
  username,
  rating,
  completionRate,
  joinDate,
  blockedCount,
  realName,
  isVerified,
}: UserInfoProps) {
  const [nickname, setNickname] = useState(username)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("UserInfo props received:", {
      username,
      rating,
      completionRate,
      joinDate,
      blockedCount,
      realName,
      isVerified,
    })

    try {
      if (USER && USER.nickname) {
        console.log("Using nickname from local variables:", USER.nickname)
        setNickname(USER.nickname)
      } else {
        console.log("No nickname found in local variables, using prop:", username)
      }
    } catch (error) {
      console.error("Error accessing user data:", error)
    }

    // Log rendering values
    if (rating) console.log("Rendering rating:", rating)
    else console.log("Rating not available or is default")

    if (completionRate) console.log("Rendering completion rate:", completionRate)
    else console.log("Completion rate not available or is default")

    if (joinDate) console.log("Rendering join date:", joinDate)
    else console.log("Join date not available or is default")

    if (blockedCount > 0) console.log("Rendering blocked count:", blockedCount)
    else console.log("Blocked count not available or is zero")
  }, [username, rating, completionRate, joinDate, blockedCount, realName, isVerified])

  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl">
          {nickname.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{nickname}</h2>
          <div className="flex items-center gap-4 mt-1 text-sm">
            {rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-gray-700">{rating}</span>
              </div>
            )}

            {completionRate && (
              <div className="flex items-center text-gray-700">
                <Check className="h-4 w-4 text-primary mr-1" />
                <span>{completionRate}</span>
                <Info className="h-4 w-4 ml-1 text-gray-400" />
              </div>
            )}

            {joinDate && <div className="text-gray-700">{joinDate}</div>}

            {blockedCount > 0 && (
              <div className="text-gray-700">Blocked by: {blockedCount}</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {isVerified.id && (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                <Check className="h-3 w-3 mr-1" />
                ID
              </div>
            )}
            {isVerified.address && (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Address
              </div>
            )}
            {isVerified.phone && (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Phone number
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-700">Show my real name</div>
            <div className="text-xs text-gray-500">{realName}</div>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  )
}
