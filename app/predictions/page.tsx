"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PredictionData {
  dishId: string
  dishName: string
  period: string
  predictedDemand: number
  confidence: number
  recommendedPrep: number
  currentStock: number
  priority: "high" | "medium" | "low"
}

interface IngredientOptimization {
  ingredientName: string
  totalNeeded: number
  available: number
  sharedDishes: string[]
  recommendation: string
}

// Enhanced tooltip for predictions chart
const PredictionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[200px]">
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{`Dish: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="space-y-1">
            <p style={{ color: entry.color }} className="text-sm font-medium">
              {`${entry.dataKey === "predicted" ? "Predicted Demand" : "Recommended Prep"}: ${entry.value} portions`}
            </p>
            {entry.payload.confidence && (
              <p className="text-xs text-gray-600 dark:text-gray-400">Confidence Level: {entry.payload.confidence}%</p>
            )}
          </div>
        ))}
        {payload[0]?.payload && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {`Safety Buffer: ${Math.round((payload.find((p) => p.dataKey === "recommended")?.value || 0) - (payload.find((p) => p.dataKey === "predicted")?.value || 0))} portions`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Based on 15-day historical data</p>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function PredictionsPage() {
  const [dishes, setDishes] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening">("morning")

  useEffect(() => {
    const savedDishes = localStorage.getItem("dishes")
    const savedIngredients = localStorage.getItem("ingredients")
    const savedOrders = localStorage.getItem("orders")

    if (savedDishes) setDishes(JSON.parse(savedDishes))
    if (savedIngredients) setIngredients(JSON.parse(savedIngredients))
    if (savedOrders) setOrders(JSON.parse(savedOrders))
  }, [])

  const predictions = useMemo(() => {
    if (!dishes.length || !orders.length) return []

    const timePeriods = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 24 },
    }

    return dishes.flatMap((dish) => {
      // Analyze historical data for each time period
      const periodData = Object.entries(timePeriods).map(([period, timeRange]) => {
        const periodOrders = orders.filter((order) => {
          const hour = new Date(order.timestamp).getHours()
          return hour >= timeRange.start && hour < timeRange.end
        })

        const dishSales = periodOrders.flatMap((order) => order.items.filter((item) => item.dishId === dish.id))

        const totalQuantity = dishSales.reduce((sum, item) => sum + item.quantity, 0)
        const avgDaily = totalQuantity / 15 // 15 days of data

        // Simple prediction algorithm based on historical average with some variance
        const basePredict = Math.round(avgDaily * (0.8 + Math.random() * 0.4))
        const predictedDemand = Math.max(1, basePredict)

        // Calculate confidence based on data consistency
        const confidence = Math.min(95, 60 + dishSales.length * 2)

        // Recommended prep considers predicted demand + safety buffer
        const recommendedPrep = Math.ceil(predictedDemand * 1.2)

        // Priority based on demand and ingredient availability
        let priority: "high" | "medium" | "low" = "medium"
        if (predictedDemand > avgDaily * 1.5) priority = "high"
        if (predictedDemand < avgDaily * 0.7) priority = "low"

        return {
          dishId: dish.id,
          dishName: dish.name,
          period,
          predictedDemand,
          confidence,
          recommendedPrep,
          currentStock: 0, // Would be calculated based on current prep
          priority,
        }
      })

      return periodData
    })
  }, [dishes, orders])

  const ingredientOptimization = useMemo(() => {
    if (!dishes.length || !ingredients.length || !predictions.length) return []

    const selectedPredictions = predictions.filter((p) => p.period === selectedPeriod)

    const ingredientMap = new Map<string, IngredientOptimization>()

    selectedPredictions.forEach((prediction) => {
      const dish = dishes.find((d) => d.id === prediction.dishId)
      if (!dish || !dish.ingredients) return

      dish.ingredients.forEach((dishIngredient: any) => {
        const ingredient = ingredients.find((ing) => ing.id === dishIngredient.ingredientId)
        if (!ingredient) return

        const needed = dishIngredient.quantity * prediction.recommendedPrep

        if (ingredientMap.has(ingredient.id)) {
          const existing = ingredientMap.get(ingredient.id)!
          existing.totalNeeded += needed
          existing.sharedDishes.push(dish.name)
        } else {
          ingredientMap.set(ingredient.id, {
            ingredientName: ingredient.name,
            totalNeeded: needed,
            available: ingredient.quantityToday,
            sharedDishes: [dish.name],
            recommendation: "",
          })
        }
      })
    })

    // Generate recommendations
    return Array.from(ingredientMap.values())
      .map((opt) => {
        if (opt.totalNeeded > opt.available) {
          opt.recommendation = `Need ${opt.totalNeeded - opt.available} more ${ingredients.find((ing) => ing.name === opt.ingredientName)?.unit || "units"}`
        } else {
          opt.recommendation = "Sufficient stock"
        }
        return opt
      })
      .sort((a, b) => b.totalNeeded - b.available - (a.totalNeeded - a.available))
  }, [dishes, ingredients, predictions, selectedPeriod])

  const selectedPredictions = predictions.filter((p) => p.period === selectedPeriod)
  const highPriorityDishes = selectedPredictions.filter((p) => p.priority === "high")

  const chartData = selectedPredictions.map((p) => ({
    name: p.dishName,
    predicted: p.predictedDemand,
    recommended: p.recommendedPrep,
    confidence: p.confidence,
  }))

  const chartConfig = {
    predicted: {
      label: "Predicted Demand",
      color: "hsl(var(--chart-1))",
    },
    recommended: {
      label: "Recommended Prep",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-600" />
              Predictive Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered demand forecasting and preparation suggestions
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Time Period Selector */}
        <Card className="mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Select Time Period</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Choose the time period for predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {[
                { key: "morning", label: "Morning (6AM-12PM)", icon: "🌅" },
                { key: "afternoon", label: "Afternoon (12PM-6PM)", icon: "☀️" },
                { key: "evening", label: "Evening (6PM-12AM)", icon: "🌙" },
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className="flex items-center gap-2"
                >
                  <span>{period.icon}</span>
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                High Priority Dishes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{highPriorityDishes.length}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Avg Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedPredictions.length > 0
                  ? Math.round(
                      selectedPredictions.reduce((sum, p) => sum + p.confidence, 0) / selectedPredictions.length,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Prediction accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Prep Needed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedPredictions.reduce((sum, p) => sum + p.recommendedPrep, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Dishes to prepare</p>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Chart */}
        <Card className="mb-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Demand Forecast - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Predicted demand vs recommended preparation quantities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<PredictionTooltip />} />
                  <Bar dataKey="predicted" fill="var(--color-predicted)" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="recommended" fill="var(--color-recommended)" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dish Predictions */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Dish Preparation Recommendations</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Optimized preparation quantities for {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPredictions.map((prediction) => (
                  <div
                    key={`${prediction.dishId}-${prediction.period}`}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{prediction.dishName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Predicted demand: {prediction.predictedDemand} orders
                        </p>
                      </div>
                      <Badge
                        variant={
                          prediction.priority === "high"
                            ? "destructive"
                            : prediction.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {prediction.priority} priority
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Confidence Level</span>
                        <span className="text-gray-900 dark:text-gray-100">{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Recommended Prep:</span>
                        <span className="text-lg font-bold text-blue-600">{prediction.recommendedPrep} portions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingredient Optimization */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Ingredient Optimization</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Smart ingredient allocation for shared dishes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientOptimization.map((opt, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{opt.ingredientName}</h3>
                      <Badge variant={opt.totalNeeded > opt.available ? "destructive" : "secondary"}>
                        {opt.totalNeeded > opt.available ? "Shortage" : "Sufficient"}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Needed:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{opt.totalNeeded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Available:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{opt.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Used in:</span>
                        <span className="text-right text-gray-900 dark:text-gray-100">
                          {opt.sharedDishes.join(", ")}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p
                          className={`font-medium ${opt.totalNeeded > opt.available ? "text-red-600" : "text-green-600"}`}
                        >
                          {opt.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Preparation Suggestions */}
        {highPriorityDishes.length > 0 && (
          <Card className="mt-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Brain className="h-5 w-5 text-purple-600" />
                Smart Bulk Preparation
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Optimize preparation by prioritizing dishes that share ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation:</h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    Focus on preparing high-demand dishes first. Consider making {highPriorityDishes.length} out of{" "}
                    {selectedPredictions.length} dishes in bulk to optimize ingredient usage and kitchen efficiency.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">High Priority Dishes:</h4>
                    <ul className="space-y-1">
                      {highPriorityDishes.map((dish) => (
                        <li key={`${dish.dishId}-${dish.period}`} className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-gray-100">{dish.dishName}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {dish.recommendedPrep} portions
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Efficiency Tips:</h4>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Prepare shared ingredients in bulk</li>
                      <li>• Start with dishes requiring longer prep time</li>
                      <li>• Monitor real-time demand adjustments</li>
                      <li>• Keep safety stock for popular items</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
