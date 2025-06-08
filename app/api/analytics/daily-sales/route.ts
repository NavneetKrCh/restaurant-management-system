import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date parameter is required",
        },
        { status: 400 },
      )
    }

    // Example: Call Python backend for specific date analysis
    // const response = await fetch(`http://localhost:8000/api/analytics/daily-sales?date=${date}`)
    // const dailySales = await response.json()

    // Mock daily sales data
    const dailySales = {
      date,
      morning: {
        orders: Math.floor(Math.random() * 25) + 15,
        revenue: Math.floor(Math.random() * 600) + 400,
        avgOrder: 0,
      },
      afternoon: {
        orders: Math.floor(Math.random() * 35) + 25,
        revenue: Math.floor(Math.random() * 900) + 700,
        avgOrder: 0,
      },
      evening: {
        orders: Math.floor(Math.random() * 45) + 35,
        revenue: Math.floor(Math.random() * 1400) + 1000,
        avgOrder: 0,
      },
      total: {
        orders: 0,
        revenue: 0,
        avgOrder: 0,
      },
    }

    // Calculate totals and averages
    dailySales.total.orders = dailySales.morning.orders + dailySales.afternoon.orders + dailySales.evening.orders
    dailySales.total.revenue = dailySales.morning.revenue + dailySales.afternoon.revenue + dailySales.evening.revenue
    dailySales.total.avgOrder = dailySales.total.revenue / dailySales.total.orders
    dailySales.morning.avgOrder = dailySales.morning.revenue / dailySales.morning.orders
    dailySales.afternoon.avgOrder = dailySales.afternoon.revenue / dailySales.afternoon.orders
    dailySales.evening.avgOrder = dailySales.evening.revenue / dailySales.evening.orders

    return NextResponse.json({ success: true, data: dailySales })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch daily sales data",
      },
      { status: 500 },
    )
  }
}
