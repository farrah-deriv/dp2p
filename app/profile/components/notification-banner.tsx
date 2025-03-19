"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotificationBannerProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function NotificationBanner({ message, onClose, duration = 5000 }: NotificationBannerProps) {
  // Auto-close the notification after the specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 mx-auto p-4 flex justify-center">
      <Alert variant="default" className="max-w-md w-full">
        <Check className="h-5 w-5 mr-2 flex-shrink-0" />
        <AlertDescription className="flex-grow">{message}</AlertDescription>
        <button onClick={onClose} className="ml-2 hover:opacity-80 flex-shrink-0">
          <X className="h-5 w-5" />
        </button>
      </Alert>
    </div>
  )
}

