import { API, AUTH } from "@/lib/local-variables"

export interface PaymentMethod {
  id: string
  name: string
  type: string
  details: Record<string, string>
  instructions?: string
  isDefault?: boolean
}

export interface PaymentMethodResponse {
  success: boolean
  data?: PaymentMethod
  errors?: Array<{ code: string; message: string }>
}

/**
 * Get user payment methods
 */
export async function getUserPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await fetch(`${API.baseUrl}/user-payment-methods`, {
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching payment methods: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch payment methods:", error)
    throw error
  }
}

// Update the addPaymentMethod function to properly handle the error format
export async function addPaymentMethod(method: string, fields: Record<string, any>): Promise<PaymentMethodResponse> {
  try {
    // Format method name to lowercase as required by the API
    const formattedMethod = method.toLowerCase()

    // Create a properly formatted fields object based on the payment method
    let formattedFields: Record<string, any> = {}

    // Format fields based on payment method type
    if (formattedMethod === "alipay") {
      // For Alipay, map alipay_id to account
      formattedFields = {
        account: fields.alipay_id,
      }

      // Add instructions if present
      if (fields.instructions) {
        formattedFields.instructions = fields.instructions
      }
    } else if (formattedMethod === "bank_transfer") {
      formattedFields = {
        account: fields.account || "",
        bank_code: fields.bank_code || "-",
        bank_name: fields.bank_name || "",
        branch: fields.branch || "-",
        instructions: fields.instructions || "-",
      }
    } else {
      // For other methods, just pass the fields as is for now
      formattedFields = { ...fields }
    }

    // Create the request body in the correct format
    const requestBody = {
      data: {
        method: formattedMethod,
        fields: formattedFields,
      },
    }

    // Log the request URL and body with clear formatting
    console.group("📤 ADD PAYMENT METHOD - REQUEST")
    console.log("URL:", `${API.baseUrl}/user-payment-methods`)
    console.log("Headers:", {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    })
    console.log("Request Body:", JSON.stringify(requestBody, null, 2))
    console.groupEnd()

    const response = await fetch(`${API.baseUrl}/user-payment-methods`, {
      method: "POST",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Get the response as text first so we can log it
    const responseText = await response.text()

    // Log the response with clear formatting
    console.group("📥 ADD PAYMENT METHOD - RESPONSE")
    console.log("Status:", response.status, response.statusText)
    console.log("Response Headers:", Object.fromEntries([...response.headers.entries()]))
    console.log("Response Body (raw):", responseText)
    console.groupEnd()

    // Try to parse the response as JSON
    let responseData: any
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: response.ok }
      console.log("Parsed Response:", responseData)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      return {
        success: false,
        errors: [{ code: "parse_error", message: "Failed to parse server response" }],
      }
    }

    if (!response.ok) {
      // Extract errors from the response
      const errors = responseData.errors || []

      // Transform the errors to match our expected format
      const formattedErrors = errors.map((err: any) => ({
        code: err.code || "unknown_error",
        message: getErrorMessageFromCode(err.code),
      }))

      return {
        success: false,
        errors:
          formattedErrors.length > 0
            ? formattedErrors
            : [{ code: "api_error", message: `API Error: ${response.status} ${response.statusText}` }],
      }
    }

    return { success: true, data: responseData.data }
  } catch (error) {
    console.group("💥 ADD PAYMENT METHOD - ERROR")
    console.error("Error:", error)
    console.error("Stack:", error instanceof Error ? error.stack : "No stack trace available")
    console.groupEnd()

    return {
      success: false,
      errors: [
        {
          code: "exception",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      ],
    }
  }
}

// Update the updatePaymentMethod function to handle the bank transfer data correctly
export async function updatePaymentMethod(id: string, fields: Record<string, any>): Promise<PaymentMethodResponse> {
  try {
    // Get the payment method type from the fields or use a default
    const methodType = fields.method_type || "unknown"
    console.log("Updating payment method type:", methodType)

    // Create a properly formatted fields object based on the payment method
    let formattedFields: Record<string, any> = {}

    if (methodType === "bank_transfer") {
      const { instructions, account, bank_name, bank_code, branch } = fields

      formattedFields = {
        account: account || "",
        bank_name: bank_name || "",
        bank_code: bank_code || "-",
        branch: branch || "-",
        instructions: instructions || "-",
      }

      console.log("Formatted bank transfer fields:", formattedFields)
    } else if (methodType === "alipay") {
      // For Alipay, include account and instructions directly in the fields object
      formattedFields = {
        account: fields.account || "",
      }

      // Add instructions if present
      if (fields.instructions) {
        formattedFields.instructions = fields.instructions
      }

      console.log("Formatted alipay fields:", formattedFields)
    } else {
      // For other methods, just pass the fields as is
      const { ...restFields } = fields
      formattedFields = { ...restFields }

      console.log("Formatted other fields:", formattedFields)
    }

    // Create the request body in the correct format
    const requestBody = {
      data: {
        fields: formattedFields,
      },
    }

    // Log the request URL and body with clear formatting
    console.group("📤 UPDATE PAYMENT METHOD - REQUEST")
    console.log("URL:", `${API.baseUrl}/user-payment-methods/${id}`)
    console.log("Headers:", {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    })
    console.log("Request Body:", JSON.stringify(requestBody, null, 2))
    console.groupEnd()

    const response = await fetch(`${API.baseUrl}/user-payment-methods/${id}`, {
      method: "PATCH",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Get the response as text first so we can log it
    const responseText = await response.text()

    // Log the response with clear formatting
    console.group("📥 UPDATE PAYMENT METHOD - RESPONSE")
    console.log("Status:", response.status, response.statusText)
    console.log("Response Headers:", Object.fromEntries([...response.headers.entries()]))
    console.log("Response Body (raw):", responseText)
    console.groupEnd()

    // Try to parse the response as JSON
    let responseData: any
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: response.ok }
      console.log("Parsed Response:", responseData)
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      return {
        success: false,
        errors: [{ code: "parse_error", message: "Failed to parse server response" }],
      }
    }

    if (!response.ok) {
      // Extract errors from the response
      const errors = responseData.errors || []

      // Transform the errors to match our expected format
      const formattedErrors = errors.map((err: any) => ({
        code: err.code || "unknown_error",
        message: err.message || getErrorMessageFromCode(err.code),
      }))

      return {
        success: false,
        errors:
          formattedErrors.length > 0
            ? formattedErrors
            : [{ code: "api_error", message: `API Error: ${response.status} ${response.statusText}` }],
      }
    }

    return { success: true, data: responseData.data }
  } catch (error) {
    console.group("💥 UPDATE PAYMENT METHOD - ERROR")
    console.error("Error:", error)
    console.error("Stack:", error instanceof Error ? error.stack : "No stack trace available")
    console.groupEnd()

    // Return error in a structured format
    return {
      success: false,
      errors: [
        {
          code: "exception",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      ],
    }
  }
}

// Helper function to get user-friendly error messages from error codes
function getErrorMessageFromCode(code: string): string {
  const errorMessages: Record<string, string> = {
    DuplicatePaymentMethod: "You already have this payment method added to your account.",
    PaymentMethodUsedByOpenOrder:
      "This payment method is currently being used by an open order and cannot be modified.",
    InvalidPaymentMethod: "The payment method information is invalid.",
    PaymentMethodNotFound: "The payment method could not be found.",
    // Add more error codes and messages as needed
  }

  return errorMessages[code] || `Error: ${code}`
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(id: string): Promise<PaymentMethodResponse> {
  try {
    const response = await fetch(`${API.baseUrl}/user-payment-methods/${id}`, {
      method: "DELETE",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return { success: false, errors: errorData.errors }
      } catch (error) {
        console.log(error)
        return { success: false, errors: [{ code: "api_error", message: response.statusText }] }
      }
    }

    return { success: true }
  } catch (error) {
    console.error(`Failed to delete payment method with ID ${id}:`, error)
    return {
      success: false,
      errors: [{ code: "exception", message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}

// Export all functions as a namespace
export const PaymentMethodsAPI = {
  getUserPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
}
