'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Mic,
  Settings,
  LogOut,
  User,
  Box,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  user: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      color: 'text-sky-500',
    },
    {
      label: 'Voice Management',
      icon: Mic,
      href: '/admin/voices',
      color: 'text-violet-500',
    },
    {
      label: '3D Models',
      icon: Box,
      href: '/admin/models',
      color: 'text-green-500',
    },
    {
      label: 'Users',
      icon: User,
      href: '/admin/users',
      color: 'text-orange-500',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="flex h-full flex-col border-r bg-gray-50">
      <div className="p-6">
        <Link href="/admin" className="flex items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map(route => (
            <Link key={route.href} href={route.href}>
              <Button
                variant={pathname === route.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  pathname === route.href && 'bg-gray-200'
                )}
              >
                <route.icon className={cn('mr-2 h-5 w-5', route.color)} />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <Avatar>
            <AvatarImage
              src={user.avatar_url}
              alt={user.full_name || user.email}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.full_name
                ? user.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : user.email?.[0]?.toUpperCase() || (
                    <User className="h-4 w-4" />
                  )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user.full_name || 'Admin User'}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
