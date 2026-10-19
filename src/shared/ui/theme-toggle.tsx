'use client';

import React from 'react';
import { useTheme } from '../lib/theme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';

export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn('relative w-9 h-9', className)}
      title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
      aria-label="Переключение темы оформления"
    >
      <Sun
        className={cn(
          'w-4 h-4 text-amber-500 transition-all duration-300 transform',
          isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        className={cn(
          'w-4 h-4 text-blue-400 transition-all duration-300 transform',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
        )}
      />
    </Button>
  );
}
