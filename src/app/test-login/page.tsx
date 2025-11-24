'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestLoginPage() {
  const [status, setStatus] = useState('');

  const testLogin = async () => {
    setStatus('Creating test account...');
    
    try {
      // First, try to register a test user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          password: 'test123',
          role: 'admin'
        }),
      });

      if (registerResponse.ok) {
        const data = await registerResponse.json();
        setStatus('Account created! Setting up session...');
        
        // Store token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`;
        
        setStatus('Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
        
      } else {
        // User might already exist, try login
        setStatus('Account exists, trying login...');
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'test123'
          }),
        });
        
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=strict`;
          
          setStatus('Logged in! Redirecting...');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        } else {
          setStatus('Login failed. Check console for errors.');
        }
      }
      
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Login error:', error);
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const cookieToken = document.cookie.includes('token=');
    
    setStatus(`
      LocalStorage Token: ${token ? 'Present' : 'Missing'}
      LocalStorage User: ${user ? 'Present' : 'Missing'}
      Cookie Token: ${cookieToken ? 'Present' : 'Missing'}
    `);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setStatus('Auth data cleared');
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🧪 Test Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testLogin} className="w-full">
            🚀 Quick Test Login (test@test.com)
          </Button>
          
          <Button onClick={checkAuth} variant="outline" className="w-full">
            🔍 Check Auth Status
          </Button>
          
          <Button onClick={clearAuth} variant="outline" className="w-full">
            🗑️ Clear Auth Data
          </Button>
          
          <Button onClick={goToDashboard} variant="secondary" className="w-full">
            📊 Go to Dashboard
          </Button>
          
          {status && (
            <div className="p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
              {status}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔗 <a href="/login" className="text-blue-600">Normal Login</a></p>
            <p>🔗 <a href="/register" className="text-blue-600">Register</a></p>
            <p>🔗 <a href="/dashboard" className="text-blue-600">Dashboard (Direct)</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}