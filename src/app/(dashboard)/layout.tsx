'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { usePrintCart } from '@/context/print-cart-context';
import {
  PackageSearch,
  Printer,
  Sliders,
  LogOut,
  Store,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const { totalLabelsCount } = usePrintCart();

  const navItems = [
    {
      label: 'Каталог товаров',
      href: '/products',
      icon: PackageSearch,
      badge: null,
    },
    {
      label: 'Очередь печати',
      href: '/print',
      icon: Printer,
      badge: totalLabelsCount > 0 ? totalLabelsCount : null,
    },
    {
      label: 'Шаблоны печати',
      href: '/admin/templates',
      icon: Sliders,
      badge: 'Admin',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Store */}
            <div className="flex items-center gap-3">
              <Link href="/products" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 leading-none block">
                    Помощник консультанта
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Umag Магазин: #41796
                  </span>
                </div>
              </Link>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/products' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative',
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                    <span>{item.label}</span>

                    {item.badge !== null && typeof item.badge === 'number' && (
                      <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full animate-scale">
                        {item.badge}
                      </span>
                    )}

                    {item.badge === 'Admin' && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        Админ
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              {!isLoading && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900">
                      {user.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isAdmin ? (
                        <Badge variant="default" className="text-[10px] h-4 bg-purple-600 hover:bg-purple-600">
                          <ShieldAlert className="w-2.5 h-2.5 mr-0.5" />
                          Админ
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200">
                          <UserCheck className="w-2.5 h-2.5 mr-0.5" />
                          Консультант
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs gap-1.5"
                    title="Выйти из системы"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Выход</span>
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Войти
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/products' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge !== null && typeof item.badge === 'number' && (
                      <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[9px] font-bold text-white bg-blue-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-[11px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
