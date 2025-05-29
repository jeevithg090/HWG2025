"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Briefcase, Calendar, MessageCircle, Shield, Zap, Users } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          <span className="font-bold text-2xl">TechCollab</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Join the Future of Tech Collaboration</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect with freelancers, discover events, and build communities. Choose how you'd like to get started.
        </p>
      </div>

      {/* Auth Options */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Sign In Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your existing account and continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Access your dashboard instantly</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Continue active projects</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Rejoin your communities</span>
              </div>
            </div>

            <Button asChild className="w-full h-12 text-lg">
              <Link href="/auth/signin">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Forgot your password?{" "}
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Reset it here
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Sign Up Card */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                🎉 New User
              </Badge>
            </div>
            <CardTitle className="text-2xl">Start Your Journey</CardTitle>
            <CardDescription className="text-base">
              Create a new account and unlock all platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Access to freelancing marketplace</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Create and join tech events</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span>Join vibrant communities</span>
              </div>
            </div>

            <Button
              asChild
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Link href="/auth/signup">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-purple-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Preview */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-6">Why Choose TechCollab?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Real-time collaboration tools</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Secure & Trusted</h3>
            <p className="text-sm text-muted-foreground">Bank-level security</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Global Community</h3>
            <p className="text-sm text-muted-foreground">Connect worldwide</p>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/">← Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
