'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Button } from '@/shared/ui';
import { Printer } from 'lucide-react';

export function PrintQueueEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-20 flex flex-col items-center justify-center text-center gap-4">
        <div className="size-14 rounded-2xl bg-muted text-foreground flex items-center justify-center">
          <Printer className="size-7" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">
            Очередь печати пуста
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            Перейдите в каталог товаров и добавьте необходимые позиции кнопкой «+ В очередь»
          </p>
        </div>
        <Link href="/products">
          <Button className="mt-2">
            Перейти в каталог товаров
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
