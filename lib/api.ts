// API layer for database integration
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Dish {
  id: string
  name: string
  price: number
  category: string
  ingredients: DishIngredient[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DishIngredient {
  ingredientId: string
  quantity: number
  unit: string
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  quantityToday: number
  minThreshold: number
  costPerUnit: number
  supplier?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  subtotal: number
  tax: number
  timestamp: string
  status: "pending" | "completed" | "cancelled"
  paymentMethod: string
  customerId?: string
  cashierId: string
}

export interface OrderItem {
  dishId: string
  quantity: number
  price: number
  notes?: string
}

export interface SalesData {
  date: string
  morning: { orders: number; revenue: number; avgOrder: number }
  afternoon: { orders: number; revenue: number; avgOrder: number }
  evening: { orders: number; revenue: number; avgOrder: number }
  total: { orders: number; revenue: number; avgOrder: number }
}

export interface PredictionData {
  dishId: string
  period: "morning" | "afternoon" | "evening"
  predictedDemand: number
  confidence: number
  recommendedPrep: number
  factors: string[]
}

// Update the base URL to point to FastAPI backend
const API_BASE_URL = process.env.NODE_ENV === "production" ? "https://your-production-api.com" : "http://localhost:8000"

// Update all API functions to use the new backend
export const api = {
  // Dishes
  async getDishes(): Promise<ApiResponse<Dish[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dishes`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch dishes" }
    }
  },

  async createDish(dish: Omit<Dish, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Dish>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dish),
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to create dish" }
    }
  },

  async updateDish(id: string, dish: Partial<Dish>): Promise<ApiResponse<Dish>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dish),
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to update dish" }
    }
  },

  async deleteDish(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
        method: "DELETE",
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to delete dish" }
    }
  },

  // Ingredients
  async getIngredients(): Promise<ApiResponse<Ingredient[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch ingredients" }
    }
  },

  async updateIngredientQuantity(id: string, quantity: number): Promise<ApiResponse<Ingredient>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}/quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to update ingredient quantity" }
    }
  },

  // Orders
  async createOrder(order: Omit<Order, "id" | "timestamp">): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to create order" }
    }
  },

  async getOrders(startDate?: string, endDate?: string): Promise<ApiResponse<Order[]>> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`${API_BASE_URL}/api/orders?${params}`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch orders" }
    }
  },

  // Analytics
  async getSalesData(startDate: string, endDate: string): Promise<ApiResponse<SalesData[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/sales?startDate=${startDate}&endDate=${endDate}`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch sales data" }
    }
  },

  async getDailySales(date: string): Promise<ApiResponse<SalesData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/daily-sales?date=${date}`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch daily sales" }
    }
  },

  // Predictions
  async getPredictions(date: string): Promise<ApiResponse<PredictionData[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/predictions?date=${date}`)
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to fetch predictions" }
    }
  },

  async generatePredictions(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/predictions/generate`, {
        method: "POST",
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to generate predictions" }
    }
  },

  // Sync
  async syncData(): Promise<ApiResponse<{ lastSync: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync`, {
        method: "POST",
      })
      return await response.json()
    } catch (error) {
      return { success: false, error: "Failed to sync data" }
    }
  },
}
