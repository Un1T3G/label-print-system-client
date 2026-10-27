'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../model/auth-store';
import { authService } from '../services/auth-service';
import { loginSchema, type LoginFormValues } from '../model/login-schema';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
  AlertDescription,
  Separator,
  ThemeToggle,
} from '@/shared/ui';
import { Store, ShieldCheck, User, LogIn, Sparkles, Loader2, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminRequested = searchParams.get('admin') === '1' || searchParams.get('admin') === 'true' || searchParams.get('role') === 'admin';

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: isAdminRequested ? 'admin' : '',
      password: isAdminRequested ? 'admin123' : '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (isAdminRequested) {
      setValue('login', 'admin', { shouldValidate: true });
      setValue('password', 'admin123', { shouldValidate: true });
    }
  }, [isAdminRequested, setValue]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const data = await authService.login(values);
      login(data.user);
      toast.success(`Добро пожаловать, ${data.user.name}!`);
      if (data.user.role === 'ADMIN') {
        router.push('/admin/templates');
      } else {
        router.push('/products');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Неверные учетные данные';
      setServerError(msg);
      toast.error(msg);
    }
  };

  const fillCredentials = (role: 'CONSULTANT' | 'ADMIN') => {
    if (role === 'CONSULTANT') {
      setValue('login', 'consultant', { shouldValidate: true });
      setValue('password', 'consultant123', { shouldValidate: true });
    } else {
      setValue('login', 'admin', { shouldValidate: true });
      setValue('password', 'admin123', { shouldValidate: true });
    }
    clearErrors();
    setServerError(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-muted/20 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-xs">
            <Store className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Помощник консультанта
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Каталог товаров, актуальные цены и печать ценников
          </p>
        </div>

        <Card className="shadow-lg backdrop-blur-sm">
          <CardHeader className="gap-1 pb-4">
            <CardTitle className="text-xl">
              {isAdminRequested ? 'Вход администратора' : 'Авторизация'}
            </CardTitle>
            <CardDescription>
              {isAdminRequested
                ? 'Вход в панель управления через консоль разработчика (F12)'
                : 'Войдите в систему под своей рабочей учетной записью'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isAdminRequested && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2 font-medium">
                <Terminal className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Режим входа администратора. Нажмите «Войти в систему» для подтверждения.</span>
              </div>
            )}
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login" className="text-xs font-medium">
                  Логин
                </Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="consultant / admin"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-invalid={!!errors.login}
                  {...register('login')}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
                {errors.login && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.login.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  className="h-12 sm:h-10 text-base sm:text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-10 mt-1 text-base sm:text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <LogIn data-icon="inline-start" />
                )}
                {isSubmitting ? 'Вход...' : 'Войти в систему'}
              </Button>
            </form>

            <Separator className="my-2" />

            {/* Quick Login Presets for testing */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Быстрый выбор роли:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillCredentials('CONSULTANT')}
                  className="h-auto p-2.5 rounded-lg justify-start gap-2.5 text-left w-full"
                >
                  <User className="size-4 text-emerald-500 shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium text-foreground">
                      Консультант
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      consultant
                    </span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fillCredentials('ADMIN')}
                  className="h-auto p-2.5 rounded-lg justify-start gap-2.5 text-left w-full"
                >
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium text-foreground">
                      Администратор
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      admin
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
