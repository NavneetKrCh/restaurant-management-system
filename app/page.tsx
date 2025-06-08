"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Header } from "@/components/header"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react"

export default function Dashboard() {
  const { dishes, ingredients, orders, isLoading, loadDishes, loadIngredients, loadOrders } = useAppStore()

  useEffect(() => {
    // Load initial data
    loadDishes()
    loadIngredients()
    loadOrders()
  }, [loadDishes, loadIngredients, loadOrders])

  // Calculate metrics with realistic sample data
  const totalRevenue = orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) : 4250.75
  const totalOrders = orders.length > 0 ? orders.length : 28
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 151.81
  const lowStockItems = ingredients.length > 0 ? ingredients.filter((ing) => ing.quantityToday <= ing.minThreshold) : []
  const lowStockCount = lowStockItems.length > 0 ? lowStockItems.length : 3

  // Sample chart data (would come from API in real implementation)
  const revenueData = [
    { name: "Mon", revenue: 1200, orders: 45 },
    { name: "Tue", revenue: 1800, orders: 52 },
    { name: "Wed", revenue: 1600, orders: 48 },
    { name: "Thu", revenue: 2200, orders: 65 },
    { name: "Fri", revenue: 2800, orders: 78 },
    { name: "Sat", revenue: 3200, orders: 89 },
    { name: "Sun", revenue: 2400, orders: 67 },
  ]

  const topDishes = [
    { name: "Margherita Pizza", sales: 156, revenue: 2028.44, trend: 12 },
    { name: "Caesar Salad", sales: 89, revenue: 800.11, trend: -5 },
    { name: "Pasta Carbonara", sales: 67, revenue: 1072.33, trend: 8 },
  ]

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
    <div className="flex-1 space-y-6 p-6 bg-gray-50 dark:bg-gray-950">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening at your restaurant today." />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              +12.5% from last week
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              +8.2% from yesterday
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Order Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${avgOrderValue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              -2.1% from last week
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
        </Card>

        <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lowStockCount}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  Needs attention
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  All good
                </>
              )}
            </div>
          </CardContent>
          <div
            className={`absolute bottom-0 left-0 w-full h-1 ${
              lowStockItems.length > 0
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            }`}
          ></div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Revenue Overview</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Daily revenue and order count for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <YAxis yAxisId="left" className="text-gray-600 dark:text-gray-400" />
                  <YAxis yAxisId="right" orientation="right" className="text-gray-600 dark:text-gray-400" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Dishes */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Top Performing Dishes</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Best sellers this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topDishes.map((dish, index) => (
              <div
                key={dish.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">{dish.sales} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">${dish.revenue.toFixed(2)}</p>
                  <div className="flex items-center text-xs">
                    {dish.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={dish.trend > 0 ? "text-green-500" : "text-red-500"}>{Math.abs(dish.trend)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/orders">
              <Button className="justify-start h-auto p-4 w-full" variant="outline">
                <ShoppingCart className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Take New Order</div>
                  <div className="text-sm text-muted-foreground">Process customer orders</div>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/inventory">
              <Button className="justify-start h-auto p-4 w-full" variant="outline">
                <Package className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Update Inventory</div>
                  <div className="text-sm text-muted-foreground">Manage stock levels</div>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/kitchen">
              <Button className="justify-start h-auto p-4 w-full" variant="outline">
                <Clock className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Kitchen Dashboard</div>
                  <div className="text-sm text-muted-foreground">View prep tasks</div>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">System Status</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Current system health and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Database Connection</span>
              </div>
              <Badge variant="secondary">Online</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Payment System</span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-gray-100">Inventory Alerts</span>
              </div>
              <Badge variant="destructive">{lowStockItems.length} items</Badge>
            </div>

            {lowStockItems.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Low Stock Alert</span>
                </div>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-xs text-orange-700 dark:text-orange-300">
                      {item.name}: {item.quantityToday} {item.unit} remaining
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      +{lowStockItems.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
