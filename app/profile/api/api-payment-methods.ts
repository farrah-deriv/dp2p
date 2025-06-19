export async function getUserPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const url = `${API.baseUrl}${API.endpoints.userPaymentMethods}`
    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const response = await fetch(url, {
      headers,
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error("Error fetching user payment methods:", error)
    return []
  }
}
