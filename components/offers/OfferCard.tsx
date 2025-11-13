'use client';

import { Offer } from '@/types';
import { Gift, MapPin, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { getButtonClasses } from '@/lib/button-presets';

interface OfferCardProps {
  offer: Offer;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

export default function OfferCard({
  offer,
  onAccept,
  onDismiss,
  onOpenDetail,
}: OfferCardProps) {
  const isNew = offer.status === 'new';
  const isExpiringSoon = offer.status === 'expiring_soon';
  const daysUntilExpiry = Math.ceil(
    (offer.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-md)] p-[var(--sp-4)] shadow-[var(--elev-1)] animate-fade-up">
      {/* Header with brand */}
      <div className="flex items-start gap-[var(--sp-3)] mb-3">
        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[var(--bg-subtle)] flex-shrink-0">
          <Image
            src={offer.brandLogo}
            alt={offer.brandName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[var(--sp-2)] mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {offer.brandName}
            </h3>
            {isNew && (
              <span className="px-2 py-0.5 bg-[var(--brand)]/12 text-[var(--brand)] text-xs font-medium rounded-full animate-badge-pop">
                NEW
              </span>
            )}
            {isExpiringSoon && (
              <span className="px-2 py-0.5 bg-[var(--warning)]/12 text-[var(--warning)] text-xs font-medium rounded-full animate-badge-pop">
                D-{daysUntilExpiry}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{offer.title}</p>
        </div>

        <button
          onClick={() => onOpenDetail(offer.id)}
          className="flex-shrink-0 p-2 -m-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="상세 보기"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Benefit */}
      <div className="flex items-start gap-[var(--sp-2)] mb-4 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-sm)]">
        <Gift
          size={20}
          className="text-[var(--brand)] flex-shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {offer.benefit}
        </p>
      </div>

      {/* Distance */}
      {offer.distance !== undefined && (
        <div className="flex items-center gap-[var(--sp-1)] mb-4 text-sm text-[var(--text-secondary)]">
          <MapPin size={16} strokeWidth={2} />
          <span>
            {offer.distance < 1
              ? `${Math.round(offer.distance * 1000)}m`
              : `${offer.distance.toFixed(1)}km`}{' '}
            거리
          </span>
        </div>
      )}

      {/* Actions - 스펙: 터치타겟 48x48px, 200ms 피드백 */}
      <div className="flex gap-[var(--sp-2)]">
        <button
          onClick={() => onAccept(offer.id)}
          className={`${getButtonClasses('primary', 'md')} flex-1 min-h-[var(--touch-min)] transition-all duration-[var(--dur-md)] hover:scale-[0.98] active:scale-95`}
          aria-label={`${offer.brandName} 오퍼 수락`}
        >
          수락
        </button>
        <button
          onClick={() => onDismiss(offer.id)}
          className={`${getButtonClasses('ghost', 'md')} min-h-[var(--touch-min)] transition-all duration-[var(--dur-md)] hover:scale-[0.98] active:scale-95`}
          aria-label="나중에 보기"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
