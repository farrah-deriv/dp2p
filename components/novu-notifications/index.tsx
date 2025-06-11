"use client"

import { Inbox } from "@novu/nextjs"
import { useEffect, useState } from "react"
import { USER, NOTIFICATIONS } from "@/lib/local-variables"
import { useRouter } from "next/navigation"

// Function to fetch the subscriber hash
async function fetchSubscriberHash() {
    try {
      //  const url = `${NOTIFICATIONS.subscriberHashUrl}/hash`

        const url ='https://api-core.deriv.com/notifications/v1/hash';

        const response = await fetch(url, {
            method: "POST",
            headers: {
             'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NDk2MTYzNzB9XSwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJjbGllbnRfaWQiOjQ0MSwiZW1haWwiOiJlcm5lc3RAZGVyaXYuY29tIiwiZXhwIjoxNzQ5NzAyNzcwLCJpYXQiOjE3NDk2MTYzNzAsImlzX2Fub255bW91cyI6ZmFsc2UsInBob25lIjoiIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJzZXNzaW9uX2lkIjoiM2YyNTU2YWUtMDJjZi00ODhmLWExMGItZDVlNTQzZDU1MDg2Iiwic3ViIjoiM2JiZTQwMmItMGRkZi00MmY5LTgzMjUtNWE0MDg4NjU2MDBjIiwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImVybmVzdEBkZXJpdi5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiM2JiZTQwMmItMGRkZi00MmY5LTgzMjUtNWE0MDg4NjU2MDBjIn19.MqmulnXoGjZttMJ-jKWuavbS4gkL83PsqG1ygL8MkhU'
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch subscriber hash: ${response.status}`)
        }

        const data = await response.json()
        return data.subscriber.subscriberHash
    } catch (error) {
        console.log(error)
        return null
    }
}

export function NovuNotifications() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [subscriberHash, setSubscriberHash] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const subscriberId = USER.id || ""
    const applicationIdentifier = NOTIFICATIONS.applicationId

    const appearance = {
        variables: {
            borderRadius: "8px",
            fontSize: "16px",
            colorShadow: "rgba(0, 0, 0, 0.1)",
            colorNeutral: "#1A1523",
            colorCounterForeground: "#ffffff",
            colorCounter: "#00D0FF",
            colorSecondaryForeground: "#1A1523",
            colorSecondary: "#002A33",
            colorPrimaryForeground: "#ffffff",
            colorPrimary: "#00D0FF",
            colorForeground: "#181C25",
            colorBackground: "#ffffff",
        },
    }

    useEffect(() => {
        setMounted(true)

        // Only fetch if we have a subscriber ID
        if (!subscriberId) {
            setError("No user ID available")
            setIsLoading(false)
            return
        }

        // Fetch the subscriber hash
        const getSubscriberHash = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const hash = await fetchSubscriberHash()
                setSubscriberHash(hash)
                if (!hash) {
                    setError("Failed to retrieve subscriber hash")
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        getSubscriberHash()
    }, [subscriberId])

    if (!mounted || isLoading) {
        return (
            <div className="relative inline-flex h-5 w-5 bg-yellow-100 rounded-full">
                <span className="sr-only">Notifications loading</span>
            </div>
        )
    }

    if (error || !subscriberHash) {
        return (
            <div
                className="relative inline-flex h-5 w-5 bg-red-100 rounded-full"
                title={error || "Failed to load notifications"}
            >
                <span className="sr-only">Notifications error</span>
            </div>
        )
    }

    return (
        <div style={{ position: "static" }}>
            <Inbox
                applicationIdentifier={applicationIdentifier}
                subscriber={subscriberId}
                subscriberHash={subscriberHash}
                colorScheme="light"
                i18n={{
                    poweredBy: "Notifications by",
                }}
                onNotificationClick={(notification) => {
                    if (notification.data && notification.data["order_id"]) {
                        const orderId = notification.data["order_id"]
                        router.push(`/orders/${orderId}`)

                    }
                }}
                placement="bottom-end"
                appearance={appearance}
                styles={{
                    bell: {
                        root: {
                            background: "transparent",
                            color: "black",
                        },
                    },
                    popover: {
                        root: {
                            zIndex: 100,
                        },
                    },
                }}
            />
        </div>
    )
}
