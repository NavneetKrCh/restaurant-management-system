"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Header } from "@/components/header"
import { useAppStore } from "@/lib/store"
import { CalendarDays, Download, TrendingUp, Clock, DollarSign, ShoppingCart, RefreshCw } from "lucide-react"
import { exportToPdf } from "@/lib/pdf-export"
import { format } from "date-fns"

// Enhanced tooltip components for better hover experience
const ReportsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[180px]">
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{`Period: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="space-y-1">
            <p style={{ color: entry.color }} className="text-sm font-medium">
              {`${entry.dataKey}: ${entry.dataKey.includes("revenue") ? "$" : ""}${entry.value}${entry.dataKey.includes("revenue") ? "" : entry.dataKey.includes("orders") ? " orders" : ""}`}
            </p>
          </div>
        ))}
        {payload[0]?.payload && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            {payload[0].payload.orders && payload[0].payload.revenue && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Avg Order Value: ${(payload[0].payload.revenue / payload[0].payload.orders).toFixed(2)}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">Hover for detailed breakdown</p>
          </div>
        )}
      </div>
    )
  }
  return null
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[160px]">
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue: ${data.revenue}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Market Share: {data.value}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {data.value > 30 ? "Top Performer" : data.value > 15 ? "Good Performance" : "Needs Attention"}
          </p>
        </div>
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [dailySales, setDailySales] = useState<any>(null)
  const [isLoadingDaily, setIsLoadingDaily] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isExporting, setIsExporting] = useState(false)

  // Refs for PDF export
  const reportContainerRef = useRef<HTMLDivElement>(null)
  const overviewTabRef = useRef<HTMLDivElement>(null)
  const dailyTabRef = useRef<HTMLDivElement>(null)
  const trendsTabRef = useRef<HTMLDivElement>(null)
  const performanceTabRef = useRef<HTMLDivElement>(null)

  const { orders, dishes, salesData, loadSalesData, getDailySales, isLoading } = useAppStore()

  useEffect(() => {
    // Load sales data for the date range
    loadSalesData(dateRange.from.toISOString().split("T")[0], dateRange.to.toISOString().split("T")[0])
  }, [dateRange, loadSalesData])

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    setIsLoadingDaily(true)

    // Simulate loading daily sales data
    setTimeout(() => {
      const mockDailySales = {
        morning: { orders: 15, revenue: 420.5 },
        afternoon: { orders: 28, revenue: 780.25 },
        evening: { orders: 35, revenue: 1050.75 },
      }
      setDailySales(mockDailySales)
      setIsLoadingDaily(false)
    }, 1000)
  }

  // Sample data for demonstration (would come from API)
  const timeBasedData = [
    {
      period: "Morning (6AM-12PM)",
      orders: 45,
      revenue: 1250.5,
      avgOrder: 27.79,
      topDish: "Breakfast Combo",
    },
    {
      period: "Afternoon (12PM-6PM)",
      orders: 78,
      revenue: 2340.75,
      avgOrder: 30.01,
      topDish: "Margherita Pizza",
    },
    {
      period: "Evening (6PM-12AM)",
      orders: 92,
      revenue: 3125.25,
      avgOrder: 33.97,
      topDish: "Pasta Carbonara",
    },
  ]

  const dailyTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      morning: Math.floor(Math.random() * 1000) + 500,
      afternoon: Math.floor(Math.random() * 1500) + 1000,
      evening: Math.floor(Math.random() * 2000) + 1500,
      total: 0,
    }
  }).map((day) => ({
    ...day,
    total: day.morning + day.afternoon + day.evening,
  }))

  const dishPerformanceData = [
    { name: "Margherita Pizza", value: 35, revenue: 2500 },
    { name: "Caesar Salad", value: 25, revenue: 1800 },
    { name: "Pasta Carbonara", value: 20, revenue: 1600 },
    { name: "Grilled Chicken", value: 15, revenue: 1200 },
    { name: "Others", value: 5, revenue: 400 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const chartConfig = {
    morning: { label: "Morning", color: "#0088FE" },
    afternoon: { label: "Afternoon", color: "#00C49F" },
    evening: { label: "Evening", color: "#FFBB28" },
    total: { label: "Total", color: "#FF8042" },
  }

  const exportReport = async () => {
    setIsExporting(true)

    try {
      // Get the active tab content
      let activeTabElement: HTMLElement | null = null

      switch (activeTab) {
        case "overview":
          activeTabElement = overviewTabRef.current
          break
        case "daily":
          activeTabElement = dailyTabRef.current
          break
        case "trends":
          activeTabElement = trendsTabRef.current
          break
        case "performance":
          activeTabElement = performanceTabRef.current
          break
      }

      if (!activeTabElement) {
        console.error("Could not find active tab element")
        return
      }

      // Generate PDF with the active tab content
      await exportToPdf(activeTabElement, {
        filename: `restaurant-report-${activeTab}`,
        pageTitle: `Restaurant Management System - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`,
        orientation: activeTab === "trends" ? "landscape" : "portrait",
      })
    } catch (error) {
      console.error("Error exporting report:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50 dark:bg-gray-950" ref={reportContainerRef}>
      <Header title="Detailed Reports" subtitle="Comprehensive sales analysis and performance metrics" />

      {/* Controls */}
      <div className="flex items-center justify-end">
        <Button onClick={exportReport} disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Generating..." : "Export Current Tab"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div ref={overviewTabRef} data-section-title="Overview Report">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$6,716.50</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">215</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Peak Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">6PM-9PM</div>
                  <p className="text-xs text-muted-foreground">Highest volume</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">+12.5%</div>
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Time-based Analysis */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Time-based Sales Analysis</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Performance breakdown by time periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-900 dark:text-gray-100">Time Period</TableHead>
                      <TableHead className="text-right text-gray-900 dark:text-gray-100">Orders</TableHead>
                      <TableHead className="text-right text-gray-900 dark:text-gray-100">Revenue</TableHead>
                      <TableHead className="text-right text-gray-900 dark:text-gray-100">Avg Order</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Top Dish</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeBasedData.map((period) => (
                      <TableRow key={period.period} className="border-gray-200 dark:border-gray-700">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{period.period}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{period.orders}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">
                          ${period.revenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">
                          ${period.avgOrder.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{period.topDish}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Analysis Tab */}
        <TabsContent value="daily" className="space-y-6">
          <div ref={dailyTabRef} data-section-title="Daily Analysis Report">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Calendar */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 min-h-[400px]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <CalendarDays className="w-5 h-5" />
                    Select Date
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Choose a date to view detailed sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border border-gray-200 dark:border-gray-700 w-full"
                      classNames={{
                        months: "flex flex-col space-y-4 w-full",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-4",
                        caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-900 dark:text-gray-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex w-full mb-2",
                        head_cell:
                          "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center py-2",
                        row: "flex w-full",
                        cell: "text-center text-sm p-1 relative flex-1 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md text-gray-900 dark:text-gray-100",
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground font-semibold",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Daily Sales Details */}
              <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">
                    Sales for{" "}
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Detailed breakdown by time periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDaily ? (
                    <div className="flex items-center justify-center h-48">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Time Period Cards */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-900 dark:text-gray-100">Morning</CardTitle>
                            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
                              6AM - 12PM
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${dailySales?.morning?.revenue?.toFixed(2) || "420.50"}
                            </div>
                            <p className="text-xs text-muted-foreground">{dailySales?.morning?.orders || 15} orders</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-900 dark:text-gray-100">Afternoon</CardTitle>
                            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
                              12PM - 6PM
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${dailySales?.afternoon?.revenue?.toFixed(2) || "780.25"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {dailySales?.afternoon?.orders || 28} orders
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-900 dark:text-gray-100">Evening</CardTitle>
                            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
                              6PM - 12AM
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              ${dailySales?.evening?.revenue?.toFixed(2) || "1050.75"}
                            </div>
                            <p className="text-xs text-muted-foreground">{dailySales?.evening?.orders || 35} orders</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Hourly Breakdown Chart */}
                      <div>
                        <h4 className="text-sm font-medium mb-4 text-gray-900 dark:text-gray-100">
                          Hourly Sales Distribution for {format(selectedDate, "MMM d, yyyy")}
                        </h4>
                        <ChartContainer config={chartConfig} className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { hour: "6AM", sales: dailySales?.morning?.revenue || 420 },
                                { hour: "9AM", sales: (dailySales?.morning?.revenue || 420) * 0.7 },
                                { hour: "12PM", sales: dailySales?.afternoon?.revenue || 780 },
                                { hour: "3PM", sales: (dailySales?.afternoon?.revenue || 780) * 0.8 },
                                { hour: "6PM", sales: dailySales?.evening?.revenue || 1050 },
                                { hour: "9PM", sales: (dailySales?.evening?.revenue || 1050) * 0.6 },
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="hour" className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                              <YAxis className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                              <ChartTooltip content={<ReportsTooltip />} />
                              <Bar dataKey="sales" fill="var(--color-total)" radius={[4, 4, 0, 0]} opacity={0.8} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div ref={trendsTabRef} data-section-title="Trends Report">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">30-Day Sales Trends</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Revenue trends by time periods over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                      <YAxis className="fill-muted-foreground text-xs" tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ReportsTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="morning"
                        stroke="var(--color-morning)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-morning)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "var(--color-morning)", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="afternoon"
                        stroke="var(--color-afternoon)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-afternoon)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "var(--color-afternoon)", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="evening"
                        stroke="var(--color-evening)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-evening)", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "var(--color-evening)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div ref={performanceTabRef} data-section-title="Performance Report">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Dish Performance Pie Chart */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Dish Performance Distribution</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Revenue share by dishes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dishPerformanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dishPerformanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Performance Table */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Detailed Performance Metrics</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Complete breakdown of dish performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="text-gray-900 dark:text-gray-100">Dish</TableHead>
                        <TableHead className="text-right text-gray-900 dark:text-gray-100">Sales</TableHead>
                        <TableHead className="text-right text-gray-900 dark:text-gray-100">Revenue</TableHead>
                        <TableHead className="text-gray-900 dark:text-gray-100">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dishPerformanceData.map((dish, index) => (
                        <TableRow key={dish.name} className="border-gray-200 dark:border-gray-700">
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{dish.name}</TableCell>
                          <TableCell className="text-right text-gray-900 dark:text-gray-100">{dish.value}%</TableCell>
                          <TableCell className="text-right text-gray-900 dark:text-gray-100">${dish.revenue}</TableCell>
                          <TableCell>
                            {index === 0 && <Badge variant="default">Top Seller</Badge>}
                            {index === 1 && <Badge variant="secondary">Good</Badge>}
                            {index >= 2 && <Badge variant="outline">Average</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
