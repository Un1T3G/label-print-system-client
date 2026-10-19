'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, Skeleton } from '@/shared/ui';

export function ProductsLoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col justify-between h-48">
          <CardHeader className="gap-2.5 pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-3">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
