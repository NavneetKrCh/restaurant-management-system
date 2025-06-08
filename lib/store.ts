// Global state management with sync capabilities
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api, type Dish, type Ingredient, type Order, type SalesData } from "./api"

interface AppState {
  // Data
  dishes: Dish[]
  ingredients: Ingredient[]
  orders: Order[]
  salesData: SalesData[]

  // UI State
  isLoading: boolean
  error: string | null
  lastSync: string | null

  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Dishes
  loadDishes: () => Promise<void>
  addDish: (dish: Omit<Dish, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateDish: (id: string, dish: Partial<Dish>) => Promise<void>
  deleteDish: (id: string) => Promise<void>

  // Ingredients
  loadIngredients: () => Promise<void>
  updateIngredientQuantity: (id: string, quantity: number) => Promise<void>

  // Orders
  loadOrders: (startDate?: string, endDate?: string) => Promise<void>
  createOrder: (order: Omit<Order, "id" | "timestamp">) => Promise<void>

  // Analytics
  loadSalesData: (startDate: string, endDate: string) => Promise<void>
  getDailySales: (date: string) => Promise<SalesData | null>

  // Sync
  syncWithDatabase: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      dishes: [],
      ingredients: [],
      orders: [],
      salesData: [],
      isLoading: false,
      error: null,
      lastSync: null,

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Dishes
      loadDishes: async () => {
        set({ isLoading: true, error: null })
        const response = await api.getDishes()
        if (response.success && response.data) {
          set({ dishes: response.data, isLoading: false })
        } else {
          set({ error: response.error || "Failed to load dishes", isLoading: false })
        }
      },

      addDish: async (dish) => {
        set({ isLoading: true, error: null })
        const response = await api.createDish(dish)
        if (response.success && response.data) {
          set((state) => ({
            dishes: [...state.dishes, response.data!],
            isLoading: false,
          }))
        } else {
          set({ error: response.error || "Failed to add dish", isLoading: false })
        }
      },

      updateDish: async (id, dish) => {
        set({ isLoading: true, error: null })
        const response = await api.updateDish(id, dish)
        if (response.success && response.data) {
          set((state) => ({
            dishes: state.dishes.map((d) => (d.id === id ? response.data! : d)),
            isLoading: false,
          }))
        } else {
          set({ error: response.error || "Failed to update dish", isLoading: false })
        }
      },

      deleteDish: async (id) => {
        set({ isLoading: true, error: null })
        const response = await api.deleteDish(id)
        if (response.success) {
          set((state) => ({
            dishes: state.dishes.filter((d) => d.id !== id),
            isLoading: false,
          }))
        } else {
          set({ error: response.error || "Failed to delete dish", isLoading: false })
        }
      },

      // Ingredients
      loadIngredients: async () => {
        set({ isLoading: true, error: null })
        const response = await api.getIngredients()
        if (response.success && response.data) {
          set({ ingredients: response.data, isLoading: false })
        } else {
          set({ error: response.error || "Failed to load ingredients", isLoading: false })
        }
      },

      updateIngredientQuantity: async (id, quantity) => {
        const response = await api.updateIngredientQuantity(id, quantity)
        if (response.success && response.data) {
          set((state) => ({
            ingredients: state.ingredients.map((i) => (i.id === id ? response.data! : i)),
          }))
        } else {
          set({ error: response.error || "Failed to update ingredient" })
        }
      },

      // Orders
      loadOrders: async (startDate, endDate) => {
        set({ isLoading: true, error: null })
        const response = await api.getOrders(startDate, endDate)
        if (response.success && response.data) {
          set({ orders: response.data, isLoading: false })
        } else {
          set({ error: response.error || "Failed to load orders", isLoading: false })
        }
      },

      createOrder: async (order) => {
        set({ isLoading: true, error: null })
        const response = await api.createOrder(order)
        if (response.success && response.data) {
          set((state) => ({
            orders: [...state.orders, response.data!],
            isLoading: false,
          }))
        } else {
          set({ error: response.error || "Failed to create order", isLoading: false })
        }
      },

      // Analytics
      loadSalesData: async (startDate, endDate) => {
        set({ isLoading: true, error: null })
        const response = await api.getSalesData(startDate, endDate)
        if (response.success && response.data) {
          set({ salesData: response.data, isLoading: false })
        } else {
          set({ error: response.error || "Failed to load sales data", isLoading: false })
        }
      },

      getDailySales: async (date) => {
        const response = await api.getDailySales(date)
        if (response.success && response.data) {
          return response.data
        }
        return null
      },

      // Sync
      syncWithDatabase: async () => {
        set({ isLoading: true, error: null })
        const response = await api.syncData()
        if (response.success && response.data) {
          set({ lastSync: response.data.lastSync, isLoading: false })
          // Reload all data after sync
          await get().loadDishes()
          await get().loadIngredients()
          await get().loadOrders()
        } else {
          set({ error: response.error || "Failed to sync", isLoading: false })
        }
      },
    }),
    {
      name: "restaurant-store",
      partialize: (state) => ({
        dishes: state.dishes,
        ingredients: state.ingredients,
        orders: state.orders,
        lastSync: state.lastSync,
      }),
    },
  ),
)
