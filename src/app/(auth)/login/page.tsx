'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, ShieldCheck, User, LogIn, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginValue.trim() || !password) {
      setError('Заполните логин и пароль');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginValue.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка входа в систему');
      }

      login(data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      router.push('/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Неверные учетные данные';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: 'CONSULTANT' | 'ADMIN') => {
    if (role === 'CONSULTANT') {
      setLoginValue('consultant');
      setPassword('consultant123');
    } else {
      setLoginValue('admin');
      setPassword('admin123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4 backdrop-blur-md">
            <Store className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Помощник консультанта
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Каталог товаров, актуальные цены и печать ценников
          </p>
        </div>

        <Card className="border-slate-700/60 bg-slate-900/80 backdrop-blur-xl shadow-2xl text-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white">Авторизация</CardTitle>
            <CardDescription className="text-slate-400">
              Войдите в систему под своей рабочей учетной записью
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Логин
                </label>
                <Input
                  type="text"
                  placeholder="consultant / admin"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Пароль
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Вход...'
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Войти в систему
                  </>
                )}
              </Button>
            </form>

            {/* Quick Login Presets for testing */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Быстрый выбор роли:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('CONSULTANT')}
                  className="p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 text-left transition flex items-center gap-2 group"
                >
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                      Консультант
                    </div>
                    <div className="text-[10px] text-slate-400">
                      consultant
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('ADMIN')}
                  className="p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 text-left transition flex items-center gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                      Администратор
                    </div>
                    <div className="text-[10px] text-slate-400">
                      admin
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
