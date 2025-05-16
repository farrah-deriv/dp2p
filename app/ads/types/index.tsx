export interface MyAd {
  id: string
  type: "Buy" | "Sell"
  rate: {
    value: string
    percentage: string
    currency: string
  }
  limits:
    | {
        min: number | string
        max: number | string
        currency: string
      }
    | string
  available: {
    current: number
    total: number
    currency: string
  }
  paymentMethods: string[]
  status: "Active" | "Inactive"
  description: string
  createdAt: string
  updatedAt: string
}

export interface SuccessData {
  type?: string
  id?: string
}

export interface APIAdvert {
  id: number
  user?: {
    nickname: string
    id: number
    is_favourite: boolean
    created_at: number
  }
  account_currency?: string
  actual_maximum_order_amount?: number
  available_amount: number
  created_at?: number
  description: string
  exchange_rate: number
  exchange_rate_type: string
  is_active: boolean
  maximum_order_amount: number
  minimum_order_amount: number
  order_expiry_period: number
  payment_currency?: string
  payment_method_names: string[]
  type?: string
}

export interface AdFilters {
  type?: "Buy" | "Sell"
  status?: "Active" | "Inactive"
  adId?: string
}

export interface CreateAdPayload {
  type: "buy" | "sell"
  account_currency: string
  payment_currency: string
  minimum_order_amount: number
  maximum_order_amount: number
  available_amount: number
  exchange_rate: number
  exchange_rate_type: "fixed"
  description: string
  is_active: number
  order_expiry_period: number
  payment_method_names: string[]
}

export interface CreateAdResponse {
  id: string
  type: "buy" | "sell"
  status: "active" | "inactive"
  created_at: string
}

export interface AdFormData {
  type: "buy" | "sell"
  totalAmount: number
  fixedRate: number
  minAmount: number
  maxAmount: number
  paymentMethods: string[]
  instructions: string
}

export interface Ad {
  id: string
  type: "Buy" | "Sell"
  rate: {
    value: string
    percentage: string
  }
  limits:
    | {
        min: number
        max: number
        currency: string
      }
    | string
  available: {
    current: number
    total: number
  }
  paymentMethods: string[]
  status: "Active" | "Inactive"
  description: string
}

export interface StatusModalState {
  show: boolean
  type: "success" | "error" | "warning"
  title: string
  message: string
  subMessage?: string
  adType?: string
  adId?: string
  actionButtonText?: string
}
