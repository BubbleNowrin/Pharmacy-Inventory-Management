'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DirectAccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 Direct Access - Testing Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Middleware is temporarily disabled for testing. You can access all pages directly:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard">
                <Button className="w-full h-16 text-lg">
                  📊 Dashboard
                  <br />
                  <span className="text-sm opacity-75">Main overview page</span>
                </Button>
              </Link>
              
              <Link href="/inventory">
                <Button className="w-full h-16 text-lg" variant="outline">
                  📦 Inventory
                  <br />
                  <span className="text-sm opacity-75">Manage medications</span>
                </Button>
              </Link>
              
              <Link href="/sales">
                <Button className="w-full h-16 text-lg" variant="outline">
                  🛒 Sales
                  <br />
                  <span className="text-sm opacity-75">Coming in Day 3</span>
                </Button>
              </Link>
              
              <Link href="/login">
                <Button className="w-full h-16 text-lg" variant="outline">
                  🔐 Login
                  <br />
                  <span className="text-sm opacity-75">Authentication test</span>
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ Testing Instructions:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Dashboard:</strong> View inventory stats and alerts</li>
                <li>• <strong>Inventory:</strong> Add medications, test barcode scanning, edit/delete</li>
                <li>• <strong>Search:</strong> Use the search bar in inventory</li>
                <li>• <strong>Alerts:</strong> Add low-stock or expiring medications to see alerts</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">🧪 Test Scenarios:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Go to <strong>Inventory</strong> and click "Add Medication"</li>
                <li>2. Create a medication with <strong>low quantity</strong> (below 10)</li>
                <li>3. Create a medication with <strong>expiry date within 30 days</strong></li>
                <li>4. Go back to <strong>Dashboard</strong> to see alerts</li>
                <li>5. Test <strong>barcode scanning</strong> (click camera icon)</li>
                <li>6. Test <strong>edit/delete</strong> functionality</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
