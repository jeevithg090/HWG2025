import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar, Briefcase, MessageCircle, Star, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 The Future of Tech Collaboration
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Connect. Collaborate. Create.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform where freelancers find gigs, communities thrive, and tech events come to life. Stop
            juggling multiple tools and start building the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need in One Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Streamline your tech collaboration with our integrated suite of tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Freelancing Marketplace</CardTitle>
              <CardDescription>
                Connect with top tech talent or find your next gig. Post projects, submit proposals, and manage
                everything in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Smart gig matching</li>
                <li>• Secure payment system</li>
                <li>• Review & rating system</li>
                <li>• Project tracking tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Event Management</CardTitle>
              <CardDescription>
                Organize hackathons, webinars, and meetups. Manage registrations, send updates, and build your tech
                community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Easy event creation</li>
                <li>• Registration management</li>
                <li>• Automated reminders</li>
                <li>• Virtual & in-person events</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Real-time Community</CardTitle>
              <CardDescription>
                Build thriving communities with real-time chat, groups, and networking tools. Connect instantly with
                like-minded developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Public & private groups</li>
                <li>• Direct messaging</li>
                <li>• File & media sharing</li>
                <li>• Voice & video calls</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">10K+</div>
              <div className="text-muted-foreground">Active Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">500+</div>
              <div className="text-muted-foreground">Events Hosted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">50K+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose TechCollab?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Real-time updates and instant notifications</p>
          </div>
          <div className="text-center">
            <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Secure & Trusted</h3>
            <p className="text-sm text-muted-foreground">Bank-level security for all transactions</p>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Global Reach</h3>
            <p className="text-sm text-muted-foreground">Connect with talent worldwide</p>
          </div>
          <div className="text-center">
            <Star className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Top Quality</h3>
            <p className="text-sm text-muted-foreground">Vetted professionals and verified reviews</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Tech Collaboration?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers, startups, and communities already using TechCollab
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/auth">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">TechCollab</h3>
              <p className="text-gray-400">The future of tech collaboration starts here.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Freelancing</li>
                <li>Events</li>
                <li>Community</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>API Docs</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TechCollab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
