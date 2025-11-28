'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also store token in localStorage for client-side API calls
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-primary">PharmaCare</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/#features" className="text-foreground/70 hover:text-primary transition-colors">Features</Link>
            <Link href="/#benefits" className="text-foreground/70 hover:text-primary transition-colors">Benefits</Link>
            <Link href="/#how-it-works" className="text-foreground/70 hover:text-primary transition-colors">How It Works</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/register-pharmacy">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                Register Pharmacy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Pharmacy System</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <Button 
              type="button" 
              className="w-full" 
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            {/* <div>
              Do not have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div> */}
            <div className="border-t pt-2">
              <span className="text-gray-500">New pharmacy?</span>{' '}
              <Link href="/register-pharmacy" className="text-primary hover:underline font-medium">
                Register your pharmacy
              </Link>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
