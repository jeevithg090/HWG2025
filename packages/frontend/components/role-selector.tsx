"use client"

import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, Building } from "lucide-react"

interface RoleSelectorProps {
  selectedRole: string
  onRoleSelect: (role: string) => void
  className?: string
}

const roleOptions = [
  {
    value: "freelancer",
    label: "Freelancer",
    description: "I want to find projects, showcase my skills, and work with amazing clients",
    icon: Briefcase,
    benefits: ["Find Projects", "Build Portfolio", "Earn Money"],
  },
  {
    value: "client",
    label: "Client",
    description: "I need to hire talented freelancers for my business projects",
    icon: Users,
    benefits: ["Hire Talent", "Manage Projects", "Scale Team"],
  },
  {
    value: "startup",
    label: "Startup",
    description: "I'm building a startup and need to find co-founders and talent",
    icon: Building,
    benefits: ["Find Co-founders", "Build MVP", "Network"],
  },
]

export function RoleSelector({ selectedRole, onRoleSelect, className }: RoleSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
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
            onClick={() => onRoleSelect(role.value)}
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

                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {role.benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
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
  )
}
