"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AutoAssignmentControl() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkSchedulerStatus()
  }, [])

  const checkSchedulerStatus = async () => {
    try {
      const response = await fetch("/api/scheduler/assignment")
      const data = await response.json()
      setIsActive(data.active)
    } catch (error) {
      console.error(" Error checking scheduler status:", error)
    }
  }

  const startScheduler = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/scheduler/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval_seconds: 30 }),
      })

      if (response.ok) {
        setIsActive(true)
        toast({
          title: "Auto-assignment started",
          description: "Orders will be automatically assigned to nearest drivers",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start auto-assignment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stopScheduler = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/scheduler/assignment", {
        method: "DELETE",
      })

      if (response.ok) {
        setIsActive(false)
        toast({
          title: "Auto-assignment stopped",
          description: "Manual assignment required for new orders",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop auto-assignment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const assignPendingOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/orders/auto-assign")
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Assignment completed",
          description: `${data.summary.assigned} orders assigned, ${data.summary.failed} failed`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign pending orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Auto-Assignment System</CardTitle>
            <CardDescription>Automatically assign orders to nearest available drivers</CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {!isActive ? (
            <Button onClick={startScheduler} disabled={isLoading} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Start Auto-Assignment
            </Button>
          ) : (
            <Button onClick={stopScheduler} disabled={isLoading} variant="destructive" className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Stop Auto-Assignment
            </Button>
          )}

          <Button
            onClick={assignPendingOrders}
            disabled={isLoading}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Assign Pending Now
          </Button>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium">Assignment Criteria</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Maximum distance: 10 km</li>
            <li>• Minimum driver rating: 3.0</li>
            <li>• Check interval: 30 seconds</li>
            <li>• Prioritize nearest driver</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
