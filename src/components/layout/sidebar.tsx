'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  FileText,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: TrendingUp,
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Users,
  },
  {
    title: 'Adjustments',
    href: '/adjustments',
    icon: Settings,
  },
  {
    title: 'Inventory Logs',
    href: '/inventory-logs',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-primary border-r border-primary">
      <div className="flex h-20 items-center px-6 border-b border-primary-foreground/10">
        <div className="flex items-center gap-2 text-primary-foreground">
          <div className="p-2 bg-primary-foreground/10 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">PharmaCare</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-foreground text-primary shadow-md'
                  : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground'
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-primary-foreground/60")} />
              {item.title}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-primary-foreground/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-primary-foreground/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}