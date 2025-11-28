import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  CheckCircle2, 
  Database, 
  LayoutDashboard, 
  Lock, 
  Pill, 
  ScanBarcode, 
  Search, 
  ShoppingCart, 
  TrendingUp 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation / Header Placeholder */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-green-800">
            <Pill className="h-6 w-6" />
            <span>PharmaFlow AI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-green-700 transition-colors">Features</Link>
            <Link href="#ai-advantage" className="hover:text-green-700 transition-colors">AI Engine</Link>
            <Link href="#tech-stack" className="hover:text-green-700 transition-colors">Technology</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-green-700 hover:bg-green-50">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 1: Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge variant="outline" className="px-4 py-1 text-green-700 border-green-200 bg-green-50 text-sm font-medium rounded-full">
                  v2.0 Now Available with Groq AI
                </Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  PharmaFlow AI: <br />
                  <span className="text-green-600">The Future of Pharmacy Inventory.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                  Intelligent Forecasting, Real-Time Sales, and Zero Waste. Empower your pharmacy with the most advanced B2B management system built for modern healthcare.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base shadow-lg shadow-green-200">
                    Request a Live Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 text-base">
                    View Key Features
                  </Button>
                </div>
                <div className="pt-8 flex items-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
              
              {/* Visual Placeholder */}
              <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
                <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <div className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 overflow-hidden">
                    {/* Abstract Dashboard UI Representation */}
                    <div className="w-full aspect-[16/10] bg-gray-50 flex flex-col">
                      <div className="h-12 border-b bg-white flex items-center px-4 gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 p-6 grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-4">
                          <div className="h-32 rounded-lg bg-green-50 border border-green-100 p-4">
                            <div className="h-4 w-24 bg-green-200 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-green-300 rounded"></div>
                          </div>
                          <div className="h-48 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-20 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
                          <div className="h-20 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
                          <div className="h-36 rounded-lg bg-white border border-gray-200 shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: AI-Powered Advantage */}
        <section id="ai-advantage" className="py-20 bg-gray-50 border-y border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                Intelligent Operations: Driven by Groq AI
              </h2>
              <p className="text-lg text-gray-600">
                Leverage the speed of Groq LPUs to process inventory data in real-time, providing actionable insights before you even know you need them.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-xl">Smart Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Predictive algorithms analyze historical sales data and seasonal trends to forecast demand with 98% accuracy, preventing stockouts and overstocking.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-xl">Automated Reordering</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    The system automatically generates purchase orders when stock levels hit dynamic reorder points, ensuring you never run out of critical medications.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-green-700" />
                  </div>
                  <CardTitle className="text-xl">Natural Language Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    "Show me all antibiotics expiring next month." Query your inventory using plain English, powered by advanced LLMs for instant data retrieval.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 3: Core Features Grid */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                Complete Control in One Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                From the back office to the front counter, PharmaFlow AI integrates every aspect of your pharmacy business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Inventory Management</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Real-time tracking of batches, expiry dates, and stock levels. Receive instant low-stock alerts via dashboard and email.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <ScanBarcode className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">POS Interface</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Streamlined checkout with integrated barcode scanning, receipt printing, and automatic inventory deduction upon sale.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Role-Based Security</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Granular access controls for Admins, Pharmacists, and Cashiers. Secure every transaction and audit log.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Financial Analytics</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Detailed reports on profit margins, top-selling products, and supplier performance to optimize your bottom line.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Supplier Management</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Centralized database for all suppliers. Track order history, lead times, and manage payments efficiently.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 transition-colors">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    <Database className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Backup & Export</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Automatic cloud backups ensure your data is safe. Export reports to CSV/Excel for external accounting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Tech Stack Footer */}
        <footer id="tech-stack" className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 font-bold text-xl text-white">
                <Pill className="h-6 w-6 text-green-500" />
                <span>PharmaFlow AI</span>
              </div>
              <div className="text-sm">
                &copy; {new Date().getFullYear()} PharmaFlow AI. All rights reserved.
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Powered By Modern Technology</p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">Next.js 15</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">TypeScript</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">Tailwind CSS</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">ShadCN/UI</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">MongoDB</Badge>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">Groq AI</Badge>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
