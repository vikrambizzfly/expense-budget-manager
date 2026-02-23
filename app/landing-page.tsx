import Link from "next/link";
import {
  Wallet,
  PieChart,
  TrendingUp,
  Shield,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3,
  Star,
  Clock,
  Download,
  Eye,
  Lock
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Expense Manager
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm border border-purple-100">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Trusted by thousands of users</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Master Your Money,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transform Your Life
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The most intuitive expense tracking platform that helps you understand your spending,
            achieve your financial goals, and build wealth with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-900 px-10 py-5 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:shadow-xl transition-all font-bold text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-1">10K+</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-1">$2M+</p>
              <p className="text-sm text-gray-600">Tracked Monthly</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-1">4.9/5</p>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Rating
              </p>
            </div>
          </div>

          {/* Demo Accounts - Subtle */}
          <div className="mt-12 inline-block">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors list-none flex items-center gap-2 justify-center">
                <Eye className="w-4 h-4" />
                View demo accounts
              </summary>
              <div className="mt-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                    <strong className="text-blue-900">Admin:</strong>
                    <p className="text-blue-700">admin@example.com / admin123</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                    <strong className="text-purple-900">Accountant:</strong>
                    <p className="text-purple-700">accountant@example.com / accountant123</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-3 rounded-lg">
                    <strong className="text-pink-900">User:</strong>
                    <p className="text-pink-700">user@example.com / user123</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple. Powerful. Effective.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and take control of your finances in 3 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in seconds. No credit card required, no commitments.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Expenses</h3>
              <p className="text-gray-600">
                Log your expenses with categories, amounts, and notes. It takes just seconds.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">
                View beautiful charts and analytics to understand your spending patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to give you complete control over your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Expense Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Effortlessly log expenses with intelligent categorization, custom tags, and detailed descriptions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <PieChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Budget Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Set realistic budgets by category and receive alerts when you're approaching limits.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful charts and graphs that make understanding your spending patterns effortless.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bank-Level Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Military-grade encryption and JWT authentication protect your sensitive financial data.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-yellow-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Perfect for families and teams with role-based permissions and multi-user support.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Export & Reports</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate professional reports and export your data in PDF, Excel, or CSV formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "This app completely transformed how I manage my finances. The insights are incredible and I've saved over $500 this month alone!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  SK
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sarah Kim</p>
                  <p className="text-sm text-gray-600">Freelance Designer</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Finally, an expense tracker that doesn't feel like work. The UI is beautiful and the analytics help me make better financial decisions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div>
                  <p className="font-bold text-gray-900">Michael Johnson</p>
                  <p className="text-sm text-gray-600">Small Business Owner</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl border border-pink-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "Perfect for our family budget! We can all track expenses and the admin controls are exactly what we needed."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  EP
                </div>
                <div>
                  <p className="font-bold text-gray-900">Emily Parker</p>
                  <p className="text-sm text-gray-600">Working Parent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already taking control of their money. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-10 py-5 rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="bg-transparent text-white px-10 py-5 rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all font-bold text-lg"
            >
              Sign In
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Expense Manager</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most intuitive expense tracking platform that helps you master your money and transform your financial life.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4" />
                  Secure & Encrypted
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 Expense Manager. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
