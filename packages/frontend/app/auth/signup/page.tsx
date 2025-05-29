"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Github, Mail, Eye, EyeOff, Briefcase, Building, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  const roleOptions = [
    {
      value: "freelancer",
      label: "Freelancer",
      description: "I want to find projects, showcase my skills, and work with amazing clients",
      icon: Briefcase,
      color: "blue",
    },
    {
      value: "client",
      label: "Client",
      description: "I need to hire talented freelancers for my business projects",
      icon: Users,
      color: "green",
    },
    {
      value: "startup",
      label: "Startup",
      description: "I'm building a startup and need to find co-founders and talent",
      icon: Building,
      color: "purple",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/auth">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">Join TechCollab and start collaborating</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account to access all platform features</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection - First Step */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">What brings you to TechCollab?</h2>
                <p className="text-muted-foreground text-sm">Choose the option that best describes you</p>
              </div>

              <div className="grid gap-3">
                {roleOptions.map((role) => (
                  <div
                    key={role.value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      selectedRole === role.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedRole(role.value)
                      handleInputChange("role", role.value)
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          selectedRole === role.value ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <role.icon
                          className={`h-6 w-6 ${
                            selectedRole === role.value
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{role.label}</h3>
                          {selectedRole === role.value && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>

                        {/* Role-specific benefits */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {role.value === "freelancer" && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  Find Projects
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Build Portfolio
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Earn Money
                                </Badge>
                              </>
                            )}
                            {role.value === "client" && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  Hire Talent
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Manage Projects
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Scale Team
                                </Badge>
                              </>
                            )}
                            {role.value === "startup" && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  Find Co-founders
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Build MVP
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Network
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!selectedRole && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Please select your role to continue</p>
                </div>
              )}
            </div>

            {selectedRole && <Separator className="my-6" />}

            {/* Show form only after role selection */}
            {selectedRole && (
              <>
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  {/* Company field for clients and startups */}
                  {(selectedRole === "client" || selectedRole === "startup") && (
                    <div className="space-y-2">
                      <Label htmlFor="company">{selectedRole === "startup" ? "Startup Name" : "Company Name"} *</Label>
                      <Input
                        id="company"
                        placeholder={selectedRole === "startup" ? "Your Startup" : "Your Company"}
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Terms and Newsletter */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      *
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for updates and tips
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading || !selectedRole}>
                  {isLoading
                    ? "Creating Account..."
                    : `Create ${selectedRole === "freelancer" ? "Freelancer" : selectedRole === "startup" ? "Startup" : "Client"} Account`}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button variant="outline" type="button">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
