"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Analytics</h1>
            <p className="text-xl text-gray-600">Track your learning progress and performance</p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12">
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-green-600" />
                    </div>
                  </div>
                  <div className="w-32 h-32 mx-auto"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We're developing comprehensive analytics to help you understand your learning patterns and optimize your
                study sessions for maximum effectiveness.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor your improvement over time across subjects</p>
                </div>
                <div className="text-center">
                  <PieChart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Study Distribution</h3>
                  <p className="text-sm text-gray-600">Visualize how you spend your study time</p>
                </div>
                <div className="text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Performance Insights</h3>
                  <p className="text-sm text-gray-600">Get personalized recommendations for improvement</p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Detailed Reports</h3>
                  <p className="text-sm text-gray-600">Export comprehensive study reports</p>
                </div>
              </div>

              <Button onClick={() => router.push("/home")} size="lg">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
