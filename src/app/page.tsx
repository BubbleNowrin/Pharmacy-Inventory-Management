"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Activity,
  BarChart3, 
  Brain, 
  CheckCircle2, 
  Clock,
  Package, 
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Shield,
  Zap,
  Users,
  FileText,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(8deg);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 1s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 1s ease-out forwards;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-floatSlow {
          animation: floatSlow 5s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.15s;
        }

        .delay-200 {
          animation-delay: 0.3s;
        }

        .delay-300 {
          animation-delay: 0.45s;
        }

        .delay-400 {
          animation-delay: 0.6s;
        }

        .delay-500 {
          animation-delay: 0.75s;
        }

        .delay-600 {
          animation-delay: 0.9s;
        }

        /* Ensure animations play on page load */
        .animate-on-scroll {
          opacity: 0;
        }

        .animate-on-scroll.visible {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}</style>
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-primary">PharmaCare</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="#features" className="text-foreground/70 hover:text-primary transition-colors">Features</Link>
            <Link href="#benefits" className="text-foreground/70 hover:text-primary transition-colors">Benefits</Link>
            <Link href="#how-it-works" className="text-foreground/70 hover:text-primary transition-colors">How It Works</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/70 hover:text-primary hover:bg-primary/5">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-contrast-lime/20 via-background to-contrast-teal/20"></div>
          
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 animate-fadeInUp">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered with Groq API
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight animate-fadeInUp delay-100">
                  Complete Pharmacy Inventory Management System
                </h1>
                <p className="text-lg md:text-xl text-foreground/70 leading-relaxed animate-fadeInUp delay-200">
                  Full-featured inventory management with AI forecasting, barcode scanning, and real-time analytics. 
                  Built with Next.js 15, MongoDB, and Groq AI for intelligent stock predictions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp delay-300">
                  <Link href="/register">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                      View Demo Dashboard
                    </Button>
                  </Link>
                </div>
                <div className="pt-6 flex flex-wrap items-center gap-6 text-sm animate-fadeInUp delay-400">
                  <div className="flex items-center gap-2 text-foreground/70">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Setup in minutes</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none animate-fadeInRight delay-300">
                <div className="relative rounded-2xl bg-white/50 backdrop-blur-sm p-3 shadow-2xl border border-border">
                  <div className="rounded-xl bg-white shadow-lg overflow-hidden border border-border">
                    <div className="w-full aspect-[16/10] bg-background flex flex-col">
                      {/* Mock Header */}
                      <div className="h-16 border-b border-border bg-white flex items-center px-6 gap-4">
                        <div className="p-1.5 bg-primary rounded-lg">
                          <Activity className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="h-2 w-24 bg-primary/20 rounded"></div>
                        <div className="ml-auto flex gap-2">
                          <div className="h-8 w-8 rounded-full bg-contrast-lime/40"></div>
                        </div>
                      </div>
                      {/* Mock Dashboard */}
                      <div className="flex-1 p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-contrast-lime rounded-lg p-3 border border-border shadow-sm">
                            <div className="h-2 w-12 bg-primary/30 rounded mb-2"></div>
                            <div className="h-4 w-8 bg-primary/50 rounded"></div>
                          </div>
                          <div className="bg-contrast-teal rounded-lg p-3 border border-border shadow-sm">
                            <div className="h-2 w-12 bg-primary/30 rounded mb-2"></div>
                            <div className="h-4 w-8 bg-primary/50 rounded"></div>
                          </div>
                          <div className="bg-contrast-pink rounded-lg p-3 border border-border shadow-sm">
                            <div className="h-2 w-12 bg-primary/30 rounded mb-2"></div>
                            <div className="h-4 w-8 bg-primary/50 rounded"></div>
                          </div>
                          <div className="bg-contrast-lavender rounded-lg p-3 border border-border shadow-sm">
                            <div className="h-2 w-12 bg-primary/30 rounded mb-2"></div>
                            <div className="h-4 w-8 bg-primary/50 rounded"></div>
                          </div>
                        </div>
                        <div className="h-32 md:h-40 rounded-lg bg-white border border-border shadow-sm p-3">
                          <div className="h-2 w-20 bg-primary/20 rounded mb-3"></div>
                          <div className="flex items-end justify-between h-20 gap-2">
                            <div className="w-full bg-primary/20 rounded-t" style={{height: '40%'}}></div>
                            <div className="w-full bg-primary/30 rounded-t" style={{height: '60%'}}></div>
                            <div className="w-full bg-primary/40 rounded-t" style={{height: '80%'}}></div>
                            <div className="w-full bg-primary/50 rounded-t" style={{height: '50%'}}></div>
                            <div className="w-full bg-primary/30 rounded-t" style={{height: '70%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-y border-border">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center animate-fadeInUp">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3 Roles</div>
                <div className="text-sm text-foreground/60">Admin, Pharmacist, Cashier</div>
              </div>
              <div className="text-center animate-fadeInUp delay-100">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">AI-Powered</div>
                <div className="text-sm text-foreground/60">Groq API Integration</div>
              </div>
              <div className="text-center animate-fadeInUp delay-200">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Real-Time</div>
                <div className="text-sm text-foreground/60">Inventory Tracking</div>
              </div>
              <div className="text-center animate-fadeInUp delay-300">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Barcode</div>
                <div className="text-sm text-foreground/60">Scanner Integration</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-28 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Complete Feature Set for Modern Pharmacies
              </h2>
              <p className="text-lg text-foreground/70">
                Built with Next.js 15, TypeScript, MongoDB, and Groq AI for intelligent automation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-lime/40 rounded-lg w-fit mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Complete Inventory Management</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Full CRUD operations, batch tracking, expiry monitoring, low stock alerts, and real-time updates with MongoDB.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp delay-100 rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-teal/40 rounded-lg w-fit mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Point-of-Sale System</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Complete POS interface with customer tracking, invoice generation, automatic inventory deduction, and sales analytics.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp delay-200 rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-pink/40 rounded-lg w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Analytics Dashboard</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Real-time charts with Recharts: sales performance, top sellers, monthly trends, and category-wise breakdowns.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp delay-300 rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-lavender/40 rounded-lg w-fit mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Groq AI Integration</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Smart forecasting, intelligent reorder suggestions, natural language search, and automated demand prediction.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp delay-400 rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-lime/40 rounded-lg w-fit mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">Purchase & Supplier System</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Complete supplier database, purchase orders, automatic inventory addition, and supplier performance tracking.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105 animate-fadeInUp delay-500 rounded-3xl">
                <CardContent className="p-6">
                  <div className="p-3 bg-contrast-teal/40 rounded-lg w-fit mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">JWT Authentication & RBAC</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    Secure JWT authentication, role-based access (Admin/Pharmacist/Cashier), password hashing with bcrypt, and audit logs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 lg:py-28 bg-white border-y border-border relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fadeInLeft">
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
                  Production-Ready System
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  Built with Modern Tech Stack
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4 hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-contrast-lime/40 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Barcode Scanner Integration</h4>
                      <p className="text-foreground/70 text-sm">
                        QR code generation, quick medication lookup, and instant stock updates with mobile-friendly scanning.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-contrast-pink/40 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Complete Audit Trail</h4>
                      <p className="text-foreground/70 text-sm">
                        Track every stock adjustment, transaction, and user activity with comprehensive inventory logs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-contrast-teal/40 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Real-Time MongoDB Database</h4>
                      <p className="text-foreground/70 text-sm">
                        Live inventory updates, instant notifications, and scalable NoSQL database architecture.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-contrast-lavender/40 rounded-lg">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-1">Next.js 15 & TypeScript</h4>
                      <p className="text-foreground/70 text-sm">
                        Modern React framework with server-side rendering, API routes, and type-safe development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 animate-fadeInRight">
                <Card className="border-none shadow-lg hover:scale-105 transition-transform duration-300 rounded-full aspect-square flex items-center justify-center" style={{background: 'linear-gradient(135deg, #d8f1b7 0%, #c5e8a0 100%)'}}>
                  <CardContent className="p-6 text-center">
                    <Package className="h-10 w-10 text-primary mb-3 mx-auto" />
                    <div className="text-2xl font-bold text-primary mb-1">Full CRUD</div>
                    <div className="text-xs text-primary/70">Medication Management</div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg mt-8 hover:scale-105 transition-transform duration-300 rounded-full aspect-square flex items-center justify-center" style={{background: 'linear-gradient(135deg, #98d9d1 0%, #7fc9bf 100%)'}}>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-10 w-10 text-primary mb-3 mx-auto" />
                    <div className="text-2xl font-bold text-primary mb-1">POS</div>
                    <div className="text-xs text-primary/70">Sales Interface</div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg -mt-4 hover:scale-105 transition-transform duration-300 rounded-full aspect-square flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f1b5b9 0%, #efa4a9 100%)'}}>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-10 w-10 text-primary mb-3 mx-auto" />
                    <div className="text-2xl font-bold text-primary mb-1">Groq AI</div>
                    <div className="text-xs text-primary/70">Smart Forecasting</div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg mt-4 hover:scale-105 transition-transform duration-300 rounded-full aspect-square flex items-center justify-center" style={{background: 'linear-gradient(135deg, #b4bef0 0%, #a0ace8 100%)'}}>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-10 w-10 text-primary mb-3 mx-auto" />
                    <div className="text-2xl font-bold text-primary mb-1">3 Roles</div>
                    <div className="text-xs text-primary/70">RBAC System</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Quick Setup Process
              </h2>
              <p className="text-lg text-foreground/70">
                Deploy your pharmacy management system in minutes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center animate-fadeInUp delay-100 hover:scale-105 transition-transform duration-300">
                <div className="mx-auto w-20 h-20 bg-contrast-lime rounded-full flex items-center justify-center mb-6 shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold text-xl text-primary mb-3">Register & Configure</h3>
                <p className="text-foreground/70">
                  Create account, set up MongoDB connection, add Groq API key, and configure user roles.
                </p>
              </div>

              <div className="text-center animate-fadeInUp delay-200 hover:scale-105 transition-transform duration-300">
                <div className="mx-auto w-20 h-20 bg-contrast-teal rounded-full flex items-center justify-center mb-6 shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold text-xl text-primary mb-3">Import Inventory Data</h3>
                <p className="text-foreground/70">
                  Add medications with batch numbers, expiry dates, suppliers, and initial stock levels.
                </p>
              </div>

              <div className="text-center animate-fadeInUp delay-300 hover:scale-105 transition-transform duration-300">
                <div className="mx-auto w-20 h-20 bg-contrast-lavender rounded-full flex items-center justify-center mb-6 shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold text-xl text-primary mb-3">Start Using Features</h3>
                <p className="text-foreground/70">
                  Process sales, scan barcodes, view analytics, and leverage AI forecasting immediately.
                </p>
              </div>
            </div>

            <div className="mt-16 text-center animate-fadeInUp delay-400">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-105 transition-transform duration-300">
                  Get Started Now - It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-6">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} PharmaCare. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
    
  );
}
