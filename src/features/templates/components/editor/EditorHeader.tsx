'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/shared/ui';
import { Save, Loader2 } from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  subtitle: string;
  isSubmitting?: boolean;
  onSave: () => void;
}

export function EditorHeader({
  title,
  subtitle,
  isSubmitting = false,
  onSave,
}: EditorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/admin/templates">
          <Button type="button" variant="outline" size="sm">
            Назад к списку
          </Button>
        </Link>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {isSubmitting ? 'Сохранение...' : 'Сохранить шаблон'}
        </Button>
      </div>
    </div>
  );
}
