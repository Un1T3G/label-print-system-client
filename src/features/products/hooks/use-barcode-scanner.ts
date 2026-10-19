'use client';

import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
}

/**
 * Listens for hardware (USB/Bluetooth) barcode scanners.
 * Hardware barcode scanners emulate keyboard input, sending characters
 * in rapid succession (< 40ms interval) terminated by an 'Enter' key.
 */
export function useBarcodeScannerListener({
  onScan,
  enabled = true,
  minChars = 4,
  maxIntervalMs = 50,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = performance.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If key is Enter and we collected enough characters within scanner speed
      if (e.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        if (barcode.length >= minChars) {
          e.preventDefault();
          onScan(barcode);
        }
        bufferRef.current = '';
        return;
      }

      // If time between keystrokes was too long, reset the buffer (it was human typing)
      if (timeSinceLastKey > maxIntervalMs) {
        bufferRef.current = '';
      }

      // Collect printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, minChars, maxIntervalMs, onScan]);
}
