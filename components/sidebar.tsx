"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { Home, Package, ShoppingCart, BarChart3, Brain, ChefHat, FileText, Settings, ChevronRight } from "lucide-react"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Predictions", href: "/predictions", icon: Brain },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { ingredients, isLoading, error, lastSync, syncWithDatabase } = useAppStore()
  const [isSyncing, setIsSyncing] = useState(false)

  const lowStockCount = ingredients.filter((ing) => ing.quantityToday <= ing.minThreshold).length

  const handleSync = async () => {
    setIsSyncing(true)
    await syncWithDatabase()
    setIsSyncing(false)
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">RestaurantOS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>

                {/* Notifications */}
                {item.name === "Inventory" && lowStockCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {lowStockCount}
                  </Badge>
                )}

                {isActive && <ChevronRight className="w-4 h-4" />}
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
