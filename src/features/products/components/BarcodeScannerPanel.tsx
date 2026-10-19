'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/shared/ui';
import { Camera, X, AlertCircle, RefreshCw, Zap, ZapOff } from 'lucide-react';

export interface BarcodeScannerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerPanel({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  const containerId = 'barcode-scanner-viewfinder';

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  /**
   * Forcibly stops all MediaStream video tracks in DOM to guarantee
   * the camera indicator light (green dot) turns off immediately.
   */
  const killMediaTracks = () => {
    try {
      const container = document.getElementById(containerId);
      const videos = container
        ? container.querySelectorAll('video')
        : document.querySelectorAll<HTMLVideoElement>('#barcode-scanner-viewfinder video');

      videos.forEach((video) => {
        if (video.srcObject instanceof MediaStream) {
          video.srcObject.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (err) {
              console.warn('Error stopping media track:', err);
            }
          });
          video.srcObject = null;
        }
      });
    } catch (err) {
      console.warn('killMediaTracks error:', err);
    }
  };

  const stopScanner = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    killMediaTracks();

    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch (err) {
        console.warn('Error stopping html5-qrcode scanner:', err);
      }
    }

    killMediaTracks();
    isStoppingRef.current = false;
  };

  const handleClose = async () => {
    isOpenRef.current = false;
    await stopScanner();
    onClose();
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.2;
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 120);
      }
    } catch {
      // Audio feedback fallback, ignore
    }

    await stopScanner();
    onScan(decodedText.trim());
    onClose();
  };

  const startScanner = async () => {
    setIsStarting(true);
    setError(null);

    await stopScanner();

    if (!isOpenRef.current) {
      killMediaTracks();
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.ITF,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      // Prefer rear environment camera or selected camera id
      const cameraConfig = activeCameraId ? activeCameraId : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdge * 0.88),
              height: Math.floor(minEdge * 0.55),
            };
          },
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Non-match frame, keep scanning
        }
      );

      // Check if panel was dismissed during initialization
      if (!isOpenRef.current) {
        await stopScanner();
        return;
      }

      // Check for camera switching support
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Камера ${d.id}` })));
          }
        })
        .catch(() => {});

      // Check torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities?.();
        if (capabilities?.torchFeature?.().isSupported()) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }

      setIsStarting(false);
    } catch (err: unknown) {
      if (!isOpenRef.current) {
        killMediaTracks();
        return;
      }
      setIsStarting(false);
      const msg =
        err instanceof Error
          ? err.message
          : 'Не удалось запустить камеру. Проверьте разрешения в браузере или подключите веб-камеру.';
      setError(msg);
    }
  };

  // Lifecycle when scanner is opened / closed
  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen) {
      const t = setTimeout(() => {
        startScanner();
      }, 150);

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-scanner-toggle]')) {
          return;
        }
        if (panelRef.current && !panelRef.current.contains(target)) {
          handleClose();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        isOpenRef.current = false;
        clearTimeout(t);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
        stopScanner();
      };
    } else {
      isOpenRef.current = false;
      stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as MediaTrackConstraintSet],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextId = cameras[nextIndex].id;
    setActiveCameraId(nextId);
    // Restart with new camera
    setTimeout(() => {
      startScanner();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-card rounded-xl border border-border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col"
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between bg-muted/40">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Camera className="size-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground leading-tight">
              Сканер штрихкодов
            </h4>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Наведите камеру на штрихкод товара
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
          title="Закрыть сканер"
        >
          <X />
        </Button>
      </div>

      {/* Viewfinder Viewport */}
      <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[220px] max-h-[300px] h-[250px] w-full">
        <div
          id={containerId}
          className="w-full h-full flex items-center justify-center [&_video]:max-w-full [&_video]:max-h-full [&_video]:mx-auto [&_video]:object-contain"
        />

        {/* Scanner Overlay Sight & Laser animation */}
        {!error && !isStarting && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 sm:w-64 h-28 sm:h-32 border-2 border-primary/80 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              {/* Corner reticles */}
              <div className="absolute -top-1 -left-1 size-3.5 border-t-2 border-l-2 border-white rounded-tl-xs" />
              <div className="absolute -top-1 -right-1 size-3.5 border-t-2 border-r-2 border-white rounded-tr-xs" />
              <div className="absolute -bottom-1 -left-1 size-3.5 border-b-2 border-l-2 border-white rounded-bl-xs" />
              <div className="absolute -bottom-1 -right-1 size-3.5 border-b-2 border-r-2 border-white rounded-br-xs" />

              {/* Animated laser line */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Starting state */}
        {isStarting && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2 z-10">
            <RefreshCw className="size-5 animate-spin text-primary" />
            <span className="text-[11px] font-medium">Подключение камеры...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-black/90 text-white text-center gap-2 z-10">
            <AlertCircle className="size-6 text-destructive" />
            <div>
              <p className="text-xs font-semibold">Камера недоступна</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">{error}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={startScanner}
              className="mt-1"
            >
              Повторить попытку
            </Button>
          </div>
        )}
      </div>

      {/* Footer controls: switch camera, torch */}
      <div className="px-3 py-2 border-t border-border flex items-center justify-between bg-card text-xs">
        <div className="text-[10px] text-muted-foreground font-mono">
          EAN-13, EAN-8, CODE-128, QR
        </div>

        <div className="flex items-center gap-1.5">
          {hasTorch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleTorch}
              className="gap-1"
              title={torchOn ? 'Выключить фонарик' : 'Включить фонарик'}
            >
              {torchOn ? <ZapOff data-icon="inline-start" className="text-amber-500" /> : <Zap data-icon="inline-start" />}
              <span className="hidden sm:inline text-[11px]">Фонарик</span>
            </Button>
          )}

          {cameras.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwitchCamera}
              className="gap-1"
              title="Сменить камеру"
            >
              <RefreshCw data-icon="inline-start" />
              <span className="hidden sm:inline text-[11px]">Сменить камеру</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
