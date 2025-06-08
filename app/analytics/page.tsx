"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ResponsiveContainer, ComposedChart } from "recharts"
import { TrendingUp, TrendingDown, Clock, DollarSign, Package } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  items: { dishId: string; quantity: number }[]
  total: number
  timestamp: string
  status: string
}

interface Dish {
  id: string
  name: string
  price: number
  category: string
}

// Enhanced tooltip component for better hover experience
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="space-y-1">
            <p style={{ color: entry.color }} className="text-sm font-medium">
              {`${entry.dataKey === "revenue" ? "Revenue: $" : "Orders: "}${entry.value}${entry.dataKey === "revenue" ? "" : " orders"}`}
            </p>
            {entry.dataKey === "revenue" && entry.payload.orders && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {`Average Order: $${(entry.value / entry.payload.orders).toFixed(2)}`}
              </p>
            )}
          </div>
        ))}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">Click and drag to zoom • Double-click to reset</p>
        </div>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])

  useEffect(() => {
    // Load data and generate sample data for 15 days
    const savedOrders = localStorage.getItem("orders")
    const savedDishes = localStorage.getItem("dishes")

    if (savedDishes) {
      setDishes(JSON.parse(savedDishes))
    }

    if (savedOrders) {
      const existingOrders = JSON.parse(savedOrders)
      setOrders(existingOrders)
    }

    // Generate sample data for the last 15 days if no orders exist
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    const sampleOrders: Order[] = []
    const dishIds = ["1", "2"] // Using existing dish IDs

    for (let i = 14; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // Generate 5-15 orders per day
      const ordersPerDay = Math.floor(Math.random() * 10) + 5

      for (let j = 0; j < ordersPerDay; j++) {
        const hour = Math.floor(Math.random() * 14) + 8 // 8 AM to 10 PM
        const minute = Math.floor(Math.random() * 60)

        const orderTime = new Date(date)
        orderTime.setHours(hour, minute)

        const items = dishIds
          .map((dishId) => ({
            dishId,
            quantity: Math.floor(Math.random() * 3) + 1,
          }))
          .filter(() => Math.random() > 0.3) // Some orders don't have all dishes

        const total = items.reduce((sum, item) => {
          const price = item.dishId === "1" ? 12.99 : 8.99
          return sum + price * item.quantity
        }, 0)

        sampleOrders.push({
          id: `sample_${i}_${j}`,
          items,
          total,
          timestamp: orderTime.toISOString(),
          status: "completed",
        })
      }
    }

    setOrders((prev) => [...prev, ...sampleOrders])
    localStorage.setItem("orders", JSON.stringify(sampleOrders))
  }

  const analytics = useMemo(() => {
    const last15Days = Array.from({ length: 15 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (14 - i))
      return date.toISOString().split("T")[0]
    })

    // Daily sales data
    const dailySales = last15Days.map((date) => {
      const dayOrders = orders.filter((order) => order.timestamp.startsWith(date))

      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
      }
    })

    // Time period analysis
    const timePeriods = {
      morning: { start: 6, end: 12, name: "Morning (6AM-12PM)" },
      afternoon: { start: 12, end: 18, name: "Afternoon (12PM-6PM)" },
      evening: { start: 18, end: 24, name: "Evening (6PM-12AM)" },
    }

    const timeAnalysis = Object.entries(timePeriods).map(([period, config]) => {
      const periodOrders = orders.filter((order) => {
        const hour = new Date(order.timestamp).getHours()
        return hour >= config.start && hour < config.end
      })

      return {
        period: config.name,
        orders: periodOrders.length,
        revenue: periodOrders.reduce((sum, order) => sum + order.total, 0),
        avgOrder:
          periodOrders.length > 0 ? periodOrders.reduce((sum, order) => sum + order.total, 0) / periodOrders.length : 0,
      }
    })

    // Dish popularity
    const dishStats = dishes
      .map((dish) => {
        const dishOrders = orders.flatMap((order) => order.items.filter((item) => item.dishId === dish.id))

        const totalQuantity = dishOrders.reduce((sum, item) => sum + item.quantity, 0)
        const revenue = totalQuantity * dish.price

        return {
          name: dish.name,
          quantity: totalQuantity,
          revenue,
          orders: dishOrders.length,
        }
      })
      .sort((a, b) => b.quantity - a.quantity)

    // Weekly comparison
    const thisWeek = orders.filter((order) => {
      const orderDate = new Date(order.timestamp)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return orderDate >= weekAgo
    })

    const lastWeek = orders.filter((order) => {
      const orderDate = new Date(order.timestamp)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return orderDate >= twoWeeksAgo && orderDate < weekAgo
    })

    const thisWeekRevenue = thisWeek.reduce((sum, order) => sum + order.total, 0)
    const lastWeekRevenue = lastWeek.reduce((sum, order) => sum + order.total, 0)
    const revenueChange = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0

    return {
      dailySales,
      timeAnalysis,
      dishStats,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
      revenueChange,
    }
  }, [orders, dishes])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">15-day sales analysis and insights</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${analytics.totalRevenue.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {analytics.revenueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                {Math.abs(analytics.revenueChange).toFixed(1)}% from last week
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Last 15 days</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${analytics.avgOrderValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Peak Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {
                  analytics.timeAnalysis
                    .reduce((max, period) => (period.orders > max.orders ? period : max))
                    .period.split(" ")[0]
                }
              </div>
              <p className="text-xs text-muted-foreground">Highest order volume</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Sales Chart */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 dark:text-gray-100">Daily Sales Trend</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Revenue and order count over the last 15 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analytics.dailySales} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="fill-muted-foreground text-xs"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      yAxisId="left"
                      className="fill-muted-foreground text-xs"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      className="fill-muted-foreground text-xs"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--color-orders)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-orders)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "var(--color-orders)", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Time Period Analysis */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-900 dark:text-gray-100">Time Period Analysis</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Performance by time of day</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.timeAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="period"
                      className="fill-muted-foreground text-xs"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} tickMargin={10} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Dish Performance and Time Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best/Worst Sellers */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Dish Performance</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Best and worst selling dishes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.dishStats.map((dish, index) => (
                  <div key={dish.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${index === 0 ? "bg-green-500" : index === analytics.dishStats.length - 1 ? "bg-red-500" : "bg-gray-400"}`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{dish.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{dish.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">${dish.revenue.toFixed(2)}</p>
                      {index === 0 && <Badge variant="secondary">Best Seller</Badge>}
                      {index === analytics.dishStats.length - 1 && <Badge variant="destructive">Needs Attention</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Period Details */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Time Period Breakdown</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Detailed analysis by time of day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.timeAnalysis.map((period, index) => (
                  <div
                    key={period.period}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{period.period}</h3>
                      <Badge variant="outline">{period.orders} orders</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${period.revenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Avg Order</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${period.avgOrder.toFixed(2)}</p>
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
  )
}
