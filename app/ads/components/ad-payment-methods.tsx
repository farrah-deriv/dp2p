"use client"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { API, AUTH } from "@/lib/local-variables"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { addPaymentMethod } from "../../profile/api/api-payment-methods"

interface PaymentMethod {
  id: number
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
}

const AdPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethods, setSelectedMethods] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [isAddingMethod, setIsAddingMethod] = useState(false)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${API.baseUrl}${API.endpoints.userPaymentMethods}`, {
          headers: {
            ...AUTH.getAuthHeader(),
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setPaymentMethods(responseData.data)
        } else {
          setPaymentMethods([])
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error)
        setPaymentMethods([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).adPaymentMethodIds = selectedMethods
    }
  }, [selectedMethods])

  const togglePaymentMethod = (methodId: number) => {
    setSelectedMethods((prev) => {
      const newSelected = prev.includes(methodId) ? prev.filter((id) => id !== methodId) : [...prev, methodId]

      return newSelected
    })
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    setIsAddingMethod(true)
    try {
      const result = await addPaymentMethod(method, fields)

      if (result.success) {
        const response = await fetch(`${API.baseUrl}${API.endpoints.userPaymentMethods}`, {
          headers: {
            ...AUTH.getAuthHeader(),
            "Content-Type": "application/json",
          },
        })
        const responseData = await response.json()

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          setPaymentMethods(responseData.data)
        }

        setShowAddPanel(false)
      } else {
        console.error("Failed to add payment method:", result.errors)
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
    } finally {
      setIsAddingMethod(false)
    }
  }

  const getMethodDisplayDetails = (method: PaymentMethod) => {
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

  const getMethodIcon = (method: PaymentMethod) => {
    if (method.type === "bank") {
      return <div className="w-3 h-3 rounded-full bg-green-500"></div>
    } else {
      return <div className="w-3 h-3 rounded-full bg-blue-500"></div>
    }
  }

  const getCategoryDisplayName = (type: string) => {
    switch (type) {
      case "bank":
        return "Bank transfer"
      case "ewallet":
        return "eWallet"
      default:
        return "Other"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold leading-6 tracking-normal">Select payment method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-base font-bold leading-6 tracking-normal">Select payment method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethods.includes(method.id)
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => togglePaymentMethod(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{method.display_name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {method.fields?.account || method.fields?.alipay_id || "Payment method"}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedMethods.includes(method.id) ? "bg-primary border-primary" : "border-gray-300"
                  }`}
                >
                  {selectedMethods.includes(method.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          ))}

          <div
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center"
            onClick={() => setShowAddPanel(true)}
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">Add payment method</p>
            </div>
          </div>
        </div>

        {selectedMethods.length === 0 && (
          <p className="text-sm text-gray-500">Select at least one payment method for your ad</p>
        )}
      </div>

      {showAddPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingMethod}
        />
      )}
    </>
  )
}

export default AdPaymentMethods
