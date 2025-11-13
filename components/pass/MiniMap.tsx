'use client';

import { MapPin as Crosshair, Navigation } from 'lucide-react';
import { MapPin } from '@/types';

interface MiniMapProps {
  pins: MapPin[];
  onPinTap: (placeId: string) => void;
  onMyLocation: () => void;
  className?: string;
}

export default function MiniMap({
  pins,
  onPinTap,
  onMyLocation,
  className = '',
}: MiniMapProps) {
  // This is a placeholder - in production, you'd integrate with Mapbox GL JS
  // For now, we'll show a styled placeholder with pins

  return (
    <div
      className={`relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border)] ${className}`}
      style={{ minHeight: '200px' }}
    >
      {/* Map placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-sm text-[var(--text-tertiary)]">
          지도 영역 (Mapbox 통합 필요)
        </p>
      </div>

      {/* Pins (overlay) */}
      <div className="absolute inset-0 pointer-events-none">
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => onPinTap(pin.id)}
            className="absolute pointer-events-auto animate-pin-pulse"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
            }}
            aria-label={`장소 ${pin.id}`}
          >
            <Crosshair
              size={28}
              className="text-[var(--brand)] drop-shadow-lg"
              fill="currentColor"
              strokeWidth={1.5}
            />
            {pin.count && pin.count > 1 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-[var(--danger)] text-xs font-bold text-white px-1">
                {pin.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Location FAB */}
      <button
        onClick={onMyLocation}
        className="absolute bottom-4 right-4 h-12 w-12 rounded-[var(--radius-full)] bg-[var(--bg-base)] shadow-[var(--elev-1)] flex items-center justify-center transition-transform duration-[var(--dur-md)] hover:scale-105 active:scale-95"
        aria-label="내 위치로 이동"
      >
        <Navigation
          size={20}
          className="text-[var(--brand)]"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
