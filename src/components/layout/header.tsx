'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear localStorage
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear localStorage and redirect
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <header className="flex h-20 items-center justify-between bg-white/50 backdrop-blur-sm px-8 sticky top-0 z-10 border-b border-border">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for medicine, inventory, etc..." 
            className="pl-10 bg-white border-border focus:border-primary focus:ring-primary/20 rounded-xl"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-8 w-px bg-border mx-2"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 hover:bg-transparent p-0">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.role}</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=002e33&color=ebf5f4`} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border p-2">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal uppercase tracking-wider px-2 py-1.5">My Account</DropdownMenuLabel>
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              <span className="text-sm font-medium">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer">
              <span className="text-sm font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}