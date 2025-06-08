"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Check, Clock } from "lucide-react"
import Link from "next/link"

interface Dish {
  id: string
  name: string
  price: number
  ingredients: { ingredientId: string; quantity: number }[]
  category: string
}

interface OrderItem {
  dishId: string
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  timestamp: Date
  status: "pending" | "completed"
}

export default function OrdersPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])

  useEffect(() => {
    // Load data from localStorage
    const savedDishes = localStorage.getItem("dishes")
    const savedOrders = localStorage.getItem("orders")
    const savedIngredients = localStorage.getItem("ingredients")

    if (savedDishes) {
      setDishes(JSON.parse(savedDishes))
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients))
    }
  }, [])

  const addToOrder = (dishId: string) => {
    const existingItem = currentOrder.find((item) => item.dishId === dishId)
    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setCurrentOrder([...currentOrder, { dishId, quantity: 1 }])
    }
  }

  const removeFromOrder = (dishId: string) => {
    const existingItem = currentOrder.find((item) => item.dishId === dishId)
    if (existingItem && existingItem.quantity > 1) {
      setCurrentOrder(
        currentOrder.map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity - 1 } : item)),
      )
    } else {
      setCurrentOrder(currentOrder.filter((item) => item.dishId !== dishId))
    }
  }

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => {
      const dish = dishes.find((d) => d.id === item.dishId)
      return total + (dish ? dish.price * item.quantity : 0)
    }, 0)
  }

  const canMakeDish = (dish: Dish, quantity: number) => {
    return dish.ingredients.every((ingredient) => {
      const availableIngredient = ingredients.find((ing) => ing.id === ingredient.ingredientId)
      return availableIngredient && availableIngredient.quantityToday >= ingredient.quantity * quantity
    })
  }

  const completeOrder = () => {
    if (currentOrder.length === 0) return

    // Check if all dishes can be made
    const canMakeAll = currentOrder.every((item) => {
      const dish = dishes.find((d) => d.id === item.dishId)
      return dish && canMakeDish(dish, item.quantity)
    })

    if (!canMakeAll) {
      alert("Insufficient ingredients for some dishes!")
      return
    }

    // Update ingredient quantities
    const updatedIngredients = [...ingredients]
    currentOrder.forEach((item) => {
      const dish = dishes.find((d) => d.id === item.dishId)
      if (dish) {
        dish.ingredients.forEach((ingredient) => {
          const ingredientIndex = updatedIngredients.findIndex((ing) => ing.id === ingredient.ingredientId)
          if (ingredientIndex !== -1) {
            updatedIngredients[ingredientIndex].quantityToday -= ingredient.quantity * item.quantity
          }
        })
      }
    })

    setIngredients(updatedIngredients)
    localStorage.setItem("ingredients", JSON.stringify(updatedIngredients))

    // Create new order
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...currentOrder],
      total: calculateTotal(),
      timestamp: new Date(),
      status: "completed",
    }

    const updatedOrders = [...orders, newOrder]
    setOrders(updatedOrders)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))

    // Clear current order
    setCurrentOrder([])
    alert("Order completed successfully!")
  }

  const getOrderItemQuantity = (dishId: string) => {
    const item = currentOrder.find((item) => item.dishId === dishId)
    return item ? item.quantity : 0
  }

  const groupedDishes = dishes.reduce(
    (acc, dish) => {
      if (!acc[dish.category]) {
        acc[dish.category] = []
      }
      acc[dish.category].push(dish)
      return acc
    },
    {} as Record<string, Dish[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Order Portal</h1>
            <p className="text-gray-600 dark:text-gray-400">Process customer orders and update inventory</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedDishes).map(([category, categoryDishes]) => (
              <Card key={category} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryDishes.map((dish) => {
                      const quantity = getOrderItemQuantity(dish.id)
                      const canMake = canMakeDish(dish, 1)

                      return (
                        <div
                          key={dish.id}
                          className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${!canMake ? "opacity-50 bg-gray-100 dark:bg-gray-700" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{dish.name}</h3>
                              <p className="text-lg font-bold text-green-600 dark:text-green-500">${dish.price}</p>
                            </div>
                            {!canMake && <Badge variant="destructive">Out of Stock</Badge>}
                          </div>

                          {quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => removeFromOrder(dish.id)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToOrder(dish.id)}
                                disabled={!canMake}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToOrder(dish.id)}
                              disabled={!canMake}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Order
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Order Section */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <ShoppingCart className="h-5 w-5" />
                  Current Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentOrder.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 dark:text-gray-400">No items in order</p>
                ) : (
                  <div className="space-y-3">
                    {currentOrder.map((item) => {
                      const dish = dishes.find((d) => d.id === item.dishId)
                      if (!dish) return null

                      return (
                        <div key={item.dishId} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{dish.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${dish.price} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            ${(dish.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      )
                    })}

                    <div className="border-t pt-3 border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={completeOrder} className="w-full" size="lg">
                      <Check className="h-4 w-4 mr-2" />
                      Complete Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders
                    .slice(-5)
                    .reverse()
                    .map((order) => (
                      <div key={order.id} className="p-3 border rounded-lg border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Order #{order.id.slice(-4)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">${order.total.toFixed(2)}</p>
                            <Badge variant="secondary">{order.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
