"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChefHat, Clock, AlertTriangle, CheckCircle, Timer } from "lucide-react"
import Link from "next/link"

interface PrepTask {
  id: string
  dishName: string
  quantity: number
  estimatedTime: number
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed"
  startTime?: Date
}

export default function KitchenPage() {
  const [tasks, setTasks] = useState<PrepTask[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Generate sample prep tasks based on predictions
    const sampleTasks: PrepTask[] = [
      {
        id: "1",
        dishName: "Margherita Pizza",
        quantity: 8,
        estimatedTime: 45,
        priority: "high",
        status: "pending",
      },
      {
        id: "2",
        dishName: "Caesar Salad",
        quantity: 5,
        estimatedTime: 20,
        priority: "medium",
        status: "pending",
      },
    ]
    setTasks(sampleTasks)

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const startTask = (taskId: string) => {
    setTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status: "in-progress", startTime: new Date() } : task)),
    )
  }

  const completeTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)))
  }

  const getTimeRemaining = (task: PrepTask) => {
    if (!task.startTime) return task.estimatedTime
    const elapsed = Math.floor((currentTime.getTime() - task.startTime.getTime()) / 60000)
    const remaining = Math.max(0, task.estimatedTime - elapsed)
    return remaining
  }

  const getProgress = (task: PrepTask) => {
    if (!task.startTime) return 0
    const elapsed = Math.floor((currentTime.getTime() - task.startTime.getTime()) / 60000)
    const progress = Math.min(100, Math.max(0, (elapsed / task.estimatedTime) * 100))
    return progress
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              Kitchen Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time preparation recommendations and task management
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">Waiting to start</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">In Progress</CardTitle>
              <Timer className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground">Currently cooking</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">Ready to serve</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <p className="text-xs text-muted-foreground">{currentTime.toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tasks */}
          <div className="space-y-6">
            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Timer className="h-5 w-5 text-blue-600" />
                    In Progress
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Currently being prepared
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inProgressTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{task.dishName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{task.quantity} portions</p>
                          </div>
                          <Badge variant="default">In Progress</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-gray-900 dark:text-gray-100">{Math.round(getProgress(task))}%</span>
                          </div>
                          <Progress value={getProgress(task)} className="h-2" />

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Time remaining:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {getTimeRemaining(task)} min
                            </span>
                          </div>

                          <Button onClick={() => completeTask(task.id)} className="w-full mt-2" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Tasks */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Tasks
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Ready to start preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{task.dishName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.quantity} portions</p>
                        </div>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority} priority
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estimated time:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{task.estimatedTime} min</span>
                      </div>

                      <Button onClick={() => startTask(task.id)} className="w-full" size="sm">
                        Start Preparation
                      </Button>
                    </div>
                  ))}

                  {pendingTasks.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completed Tasks & Guidelines */}
          <div className="space-y-6">
            {/* Completed Tasks */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Completed Today
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Ready to serve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.dishName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.quantity} portions</p>
                        </div>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                    </div>
                  ))}

                  {completedTasks.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No completed tasks yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kitchen Guidelines */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Kitchen Guidelines</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Best practices for efficient preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Priority Order</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Always start with high-priority dishes first
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Efficiency Tips:</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Prep ingredients in bulk when possible</li>
                      <li>• Start longer cooking items first</li>
                      <li>• Keep workstation organized</li>
                      <li>• Monitor cooking times closely</li>
                      <li>• Communicate with front-of-house staff</li>
                    </ul>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Quality Standards:</h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Check ingredient freshness</li>
                      <li>• Follow portion control guidelines</li>
                      <li>• Maintain food safety temperatures</li>
                      <li>• Taste before serving</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
