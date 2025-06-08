import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Example: Call Python backend for analytics
    // const response = await fetch(`http://localhost:8000/api/analytics/sales?startDate=${startDate}&endDate=${endDate}`)
    // const salesData = await response.json()

    // Mock sales data with time-based breakdown
    const salesData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))

      return {
        date: date.toISOString().split("T")[0],
        morning: {
          orders: Math.floor(Math.random() * 20) + 10,
          revenue: Math.floor(Math.random() * 500) + 300,
          avgOrder: 0,
        },
        afternoon: {
          orders: Math.floor(Math.random() * 30) + 20,
          revenue: Math.floor(Math.random() * 800) + 600,
          avgOrder: 0,
        },
        evening: {
          orders: Math.floor(Math.random() * 40) + 30,
          revenue: Math.floor(Math.random() * 1200) + 900,
          avgOrder: 0,
        },
        total: {
          orders: 0,
          revenue: 0,
          avgOrder: 0,
        },
      }
    }).map((day) => {
      day.total.orders = day.morning.orders + day.afternoon.orders + day.evening.orders
      day.total.revenue = day.morning.revenue + day.afternoon.revenue + day.evening.revenue
      day.total.avgOrder = day.total.revenue / day.total.orders
      day.morning.avgOrder = day.morning.revenue / day.morning.orders
      day.afternoon.avgOrder = day.afternoon.revenue / day.afternoon.orders
      day.evening.avgOrder = day.evening.revenue / day.evening.orders
      return day
    })

    return NextResponse.json({ success: true, data: salesData })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales data",
      },
      { status: 500 },
    )
  }
}
