import { API, AUTH } from "@/lib/local-variables"

export interface Advertisement {
  id: number
  user: {
    nickname: string
    id: number
    is_favourite: boolean
    created_at: number
    rating_average?: number
  }
  account_currency: string
  actual_maximum_order_amount: number
  available_amount: number
  created_at: number
  description: string
  exchange_rate: number
  exchange_rate_type: string
  is_active: boolean
  maximum_order_amount: number
  minimum_order_amount: number
  order_expiry_period: number
  payment_currency: string
  payment_method_names: string[]
  type: string
  user_rating_average?: number
}

export interface SearchParams {
  type?: string
  currency?: string
  paymentMethod?: string
  amount?: number
  nickname?: string
  sortBy?: string
  following?: boolean
  favourites_only?: number
}

export async function getAdvertisements(params?: SearchParams): Promise<Advertisement[]> {
  try {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.type) queryParams.append("advert_type", params.type)
      if (params.currency) queryParams.append("payment_currency", params.currency)
      if (params.paymentMethod) queryParams.append("paymentMethod", params.paymentMethod)
      if (params.amount) queryParams.append("amount", params.amount.toString())
      if (params.nickname) queryParams.append("nickname", params.nickname)
      if (params.sortBy) queryParams.append("sort_by", params.sortBy)
      if (params.favourites_only) queryParams.append("favourites_only", params.favourites_only.toString())
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const url = `${API.baseUrl}${API.endpoints.ads}${queryString}`
    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`Error fetching advertisements: ${response.statusText}`)
    }

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { data: [] }
    }

    if (data && data.data && Array.isArray(data.data)) {
      return data.data
    } else if (Array.isArray(data)) {
      return data
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

export async function getAdvertiserById(id: string | number): Promise<any> {
  try {
    const url = `${API.baseUrl}${API.endpoints.advertisers}/${id}`
    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      return await getAdvertiserFromAds(id)
    }

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = {}
    }

    return data
  } catch (error) {
    return createMockAdvertiser(id)
  }
}

async function getAdvertiserFromAds(advertiserId: string | number): Promise<any> {
  try {
    const ads = await getAdvertiserAds(advertiserId)

    if (ads && ads.length > 0 && ads[0].user) {
      const user = ads[0].user

      return {
        id: user.id,
        nickname: user.nickname || "Unknown",
        is_online: true,
        joined_date: `Joined ${Math.floor((Date.now() / 1000 - user.created_at) / (60 * 60 * 24))} days ago`,
        rating: user.user_rating_average || 0,
        rating_count: 0,
        completion_rate: 100,
        orders_count: 0,
        is_verified: {
          id: true,
          address: false,
          phone: false,
        },
        is_favourite: user.is_favourite || false,
        stats: {
          buy_completion: { rate: 100, count: 0 },
          sell_completion: { rate: 100, count: 0 },
          avg_pay_time: "N/A",
          avg_release_time: "N/A",
          trade_partners: 0,
          trade_volume: { amount: 0, currency: "USD" },
        },
      }
    }

    return createMockAdvertiser(advertiserId)
  } catch (error) {
    return createMockAdvertiser(advertiserId)
  }
}

function createMockAdvertiser(id: string | number): any {
  return {
    id: id,
    nickname: `User_${id}`,
    is_online: true,
    joined_date: "Joined recently",
    rating: 0,
    rating_count: 0,
    completion_rate: 100,
    orders_count: 0,
    is_verified: {
      id: false,
      address: false,
      phone: false,
    },
    is_favourite: false,
    stats: {
      buy_completion: { rate: 0, count: 0 },
      sell_completion: { rate: 0, count: 0 },
      avg_pay_time: "N/A",
      avg_release_time: "N/A",
      trade_partners: 0,
      trade_volume: { amount: 0, currency: "USD" },
    },
  }
}

export async function getAdvertiserAds(advertiserId: string | number): Promise<Advertisement[]> {
  try {
    const queryParams = new URLSearchParams({
      user_id: advertiserId.toString(),
    })

    const url = `${API.baseUrl}${API.endpoints.ads}?${queryParams.toString()}`
    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`Error fetching advertiser ads: ${response.statusText}`)
    }

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { data: [] }
    }

    return data.data || []
  } catch (error) {
    return []
  }
}

export async function toggleFavouriteAdvertiser(
  advertiserId: number,
  isFavourite: boolean,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.userFavourites}`
    const method = isFavourite ? "POST" : "DELETE"

    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const body = JSON.stringify({
      data: {
        user_id: advertiserId,
      },
    })

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to ${isFavourite ? "follow" : "unfollow"} advertiser: ${response.statusText}`,
      }
    }

    return {
      success: true,
      message: `Successfully ${isFavourite ? "followed" : "unfollowed"} advertiser`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
    }
  }
}

export async function toggleBlockAdvertiser(
  advertiserId: number,
  isBlocked: boolean,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.userBlocks}`
    const method = isBlocked ? "POST" : "DELETE"

    const headers = {
      ...AUTH.getAuthHeader(),
      "Content-Type": "application/json",
    }

    const body = JSON.stringify({
      data: {
        user_id: advertiserId,
      },
    })

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to ${isBlocked ? "block" : "unblock"} advertiser: ${response.statusText}`,
      }
    }

    return {
      success: true,
      message: `Successfully ${isBlocked ? "blocked" : "unblocked"} advertiser`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
    }
  }
}
