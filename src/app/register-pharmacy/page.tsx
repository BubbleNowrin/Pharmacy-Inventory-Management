'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Activity, ArrowRight } from 'lucide-react';

export default function RegisterPharmacyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pharmacyData, setPharmacyData] = useState({
    name: '',
    licenseNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    website: '',
    ownerName: '',
    subscriptionPlan: 'basic',
  });

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handlePharmacyChange = (field: string, value: string) => {
    setPharmacyData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdminChange = (field: string, value: string) => {
    setAdminData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (adminData.password !== adminData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (adminData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/pharmacies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pharmacy: pharmacyData,
          adminUser: {
            name: adminData.name,
            email: adminData.email,
            password: adminData.password,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
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
            <Link href="/login">
              <Button variant="ghost" className="text-foreground/70 hover:text-primary hover:bg-primary/5">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Register Your Pharmacy
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our pharmacy management system
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Registration</CardTitle>
            <CardDescription>
              Please fill in your pharmacy details and create an admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pharmacy Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pharmacy Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                    <Input
                      id="pharmacyName"
                      type="text"
                      required
                      value={pharmacyData.name}
                      onChange={(e) => handlePharmacyChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      required
                      value={pharmacyData.licenseNumber}
                      onChange={(e) => handlePharmacyChange('licenseNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    required
                    value={pharmacyData.address}
                    onChange={(e) => handlePharmacyChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      required
                      value={pharmacyData.city}
                      onChange={(e) => handlePharmacyChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      type="text"
                      required
                      value={pharmacyData.state}
                      onChange={(e) => handlePharmacyChange('state', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      required
                      value={pharmacyData.zipCode}
                      onChange={(e) => handlePharmacyChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={pharmacyData.phone}
                      onChange={(e) => handlePharmacyChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pharmacyEmail">Email *</Label>
                    <Input
                      id="pharmacyEmail"
                      type="email"
                      required
                      value={pharmacyData.email}
                      onChange={(e) => handlePharmacyChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={pharmacyData.website}
                      onChange={(e) => handlePharmacyChange('website', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      type="text"
                      required
                      value={pharmacyData.ownerName}
                      onChange={(e) => handlePharmacyChange('ownerName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                  <Select value={pharmacyData.subscriptionPlan} onValueChange={(value) => handlePharmacyChange('subscriptionPlan', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - $29/month</SelectItem>
                      <SelectItem value="premium">Premium - $59/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - $99/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Admin User Account</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminName">Full Name *</Label>
                    <Input
                      id="adminName"
                      type="text"
                      required
                      value={adminData.name}
                      onChange={(e) => handleAdminChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminEmail">Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      required
                      value={adminData.email}
                      onChange={(e) => handleAdminChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={adminData.password}
                      onChange={(e) => handleAdminChange('password', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={adminData.confirmPassword}
                      onChange={(e) => handleAdminChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Back to Login
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register Pharmacy'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}