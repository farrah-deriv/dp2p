"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import { Button } from "@/components/ui/button"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "../api"
import StatusModal from "@/components/ui/status-modal"
import NotificationBanner from "./notification-banner"

interface StatsTabsProps {
  children?: React.ReactNode
  stats: any
}

export default function StatsTabs({ children, stats }: StatsTabsProps) {
  const [activeTab, setActiveTab] = useState("stats")
  const [showAddPaymentMethodPanel, setShowAddPaymentMethodPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
    { id: "ads", label: "Ad details" },
    { id: "counterparties", label: "My counterparties" },
  ]

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)

      // Log the data being sent to the API for debugging
      console.group("🔍 PAYMENT METHOD DATA FROM UI")
      console.log("Method:", method)
      console.log("Fields:", fields)
      console.groupEnd()

      const result = await ProfileAPI.PaymentMethods.addPaymentMethod(method, fields)

      // Log the result
      console.group("🔍 PAYMENT METHOD API RESULT")
      console.log("Success:", result.success)
      console.log("Data:", result.data)
      console.log("Errors:", result.errors)
      console.groupEnd()

      if (result.success) {
        // Close the panel
        setShowAddPaymentMethodPanel(false)

        // Show success notification
        setNotification({
          show: true,
          message: "Payment method added.",
        })

        // Refresh the payment methods list by incrementing the key
        setRefreshKey((prev) => prev + 1)
      } else {
        // Get error message from the first error
        const errorMessage =
          result.errors && result.errors.length > 0 ? result.errors[0].message : "Failed to add payment method"

        // Show error modal
        setErrorModal({
          show: true,
          message: errorMessage,
        })
      }
    } catch (error) {
      console.error("Error adding payment method:", error)

      // Show error modal
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  return (
    <div className="relative">
      {notification.show && (
        <NotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-3 text-sm font-medium",
                  activeTab === tab.id ? "bg-white text-gray-900" : "bg-gray-100 text-gray-500 hover:bg-gray-50",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "payment" && (
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-4"
            onClick={() => setShowAddPaymentMethodPanel(true)}
          >
            Add payment method
          </Button>
        )}
      </div>

      <div>
        {activeTab === "stats" && <StatsGrid stats={stats} />}
        {activeTab === "payment" && <PaymentMethodsTab key={refreshKey} />}
        {activeTab === "ads" && <div>Ad details content</div>}
        {activeTab === "counterparties" && <div>My counterparties content</div>}
      </div>

      {showAddPaymentMethodPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPaymentMethodPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
        />
      )}

      {errorModal.show && (
        <StatusModal
          type="error"
          title="Error"
          message={errorModal.message}
          onClose={() => setErrorModal({ show: false, message: "" })}
        />
      )}
    </div>
  )
}

