'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { usePrintCart } from '@/features/print';
import {
  PackageSearch,
  Printer,
  Sliders,
  LogOut,
  Store,
  ShieldAlert,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Badge,
  ThemeToggle,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const { totalLabelsCount } = usePrintCart();

  const allNavItems = [
    {
      label: 'Каталог товаров',
      href: '/products',
      icon: PackageSearch,
      badge: null,
      adminOnly: false,
    },
    {
      label: 'Очередь печати',
      href: '/print',
      icon: Printer,
      badge: totalLabelsCount > 0 ? totalLabelsCount : null,
      adminOnly: false,
    },
    {
      label: 'Шаблоны печати',
      href: '/admin/templates',
      icon: Sliders,
      badge: 'Admin',
      adminOnly: true,
    },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20 text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Store */}
            <div className="flex items-center gap-2.5">
              <Link href="/products" className="flex items-center gap-2.5 group">
                <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs group-hover:opacity-90 transition-opacity">
                  <Store className="size-4.5" />
                </div>
                <div>
                  <span className="font-semibold text-sm leading-tight text-foreground block">
                    Помощник консультанта
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Umag: #41796
                  </span>
                </div>
              </Link>
            </div>

            {/* Main Navigation Tabs — desktop only */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/products' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-accent text-accent-foreground font-semibold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    )}
                  >
                    <Icon className={cn('size-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                    <span>{item.label}</span>

                    {item.badge !== null && typeof item.badge === 'number' && (
                      <Badge variant="default" className="size-5 p-0 justify-center text-[11px] rounded-full">
                        {item.badge}
                      </Badge>
                    )}

                    {item.badge === 'Admin' && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 uppercase font-semibold">
                        Админ
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile, Theme Toggle & Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />

              {!isLoading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-2 gap-2 text-foreground">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start text-left">
                        <span className="text-xs font-medium leading-none max-w-[120px] truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {isAdmin ? 'Администратор' : 'Консультант'}
                        </span>
                      </div>
                      <ChevronDown className="size-3.5 text-muted-foreground hidden sm:inline-block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.login}</p>
                        <div className="pt-1">
                          {isAdmin ? (
                            <Badge variant="secondary" className="gap-1 text-[10px]">
                              <ShieldAlert className="size-3 text-primary" />
                              Администратор
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <UserCheck className="size-3 text-muted-foreground" />
                              Консультант
                            </Badge>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={logout}
                      className="cursor-pointer"
                    >
                      <LogOut data-icon="inline-start" />
                      Выйти из системы
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Войти
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body — pb-24 on mobile to clear the fixed bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 md:pb-5">
        {children}
      </main>

      {/* Mobile Bottom Navigation Tab Bar — fixed, only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-stretch justify-around safe-area-inset-bottom">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/products' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 min-h-[56px] text-xs font-medium transition-colors active:bg-muted/60',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'size-6 transition-transform',
                      isActive && 'scale-110'
                    )}
                  />
                  {item.badge !== null && typeof item.badge === 'number' && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-bold text-primary-foreground bg-primary rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  {item.badge === 'Admin' && (
                    <span className="absolute -top-1 -right-2 size-2 bg-amber-500 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
