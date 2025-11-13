'use client';

import { useState, useEffect } from 'react';
import { Place, Offer } from '@/types';
import { X, MapPin, Phone, Clock, ChevronRight, Gift } from 'lucide-react';
import { getButtonClasses } from '@/lib/button-presets';
import Image from 'next/image';

export type PlaceSheetStage = 'peek' | 'half' | 'full';

interface PlaceSheetProps {
  place: Place | null;
  offers?: Offer[];
  stage?: PlaceSheetStage;
  onClose: () => void;
  onOfferSelect: (offerId: string) => void;
}

export default function PlaceSheet({
  place,
  offers = [],
  stage = 'half',
  onClose,
  onOfferSelect,
}: PlaceSheetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (place) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [place]);

  if (!place) return null;

  const getStageClass = () => {
    switch (stage) {
      case 'peek':
        return 'translate-y-[calc(100%-120px)]';
      case 'half':
        return 'translate-y-[calc(100%-50%)]';
      case 'full':
        return 'translate-y-0';
      default:
        return 'translate-y-[calc(100%-50%)]';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[var(--scrim)] z-40 transition-opacity duration-[var(--dur-md)] ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[var(--bg-base)] rounded-t-[var(--radius-xl)] shadow-[var(--elev-2)] z-50 max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] transition-transform duration-[var(--dur-md)] ease-[var(--ease-out)] ${
          isVisible ? getStageClass() : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 bg-[var(--bg-base)] pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Header */}
        <div className="px-[var(--sp-4)] pb-[var(--sp-4)] border-b border-[var(--border)]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {place.name}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full typo-label font-medium ${
                    place.isOpen
                      ? 'bg-[var(--success)]/10 text-[var(--success)]'
                      : 'bg-[var(--danger)]/10 text-[var(--danger)]'
                  }`}
                >
                  {place.isOpen ? '영업중' : '영업종료'}
                </span>
                {place.rating && (
                  <span className="typo-label text-[var(--text-secondary)]">
                    ⭐ {place.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center flex-shrink-0"
              aria-label="닫기"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin
                size={16}
                className="text-[var(--text-tertiary)] flex-shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="typo-caption text-[var(--text-secondary)] flex-1">
                {place.address}
                {place.distance !== undefined && (
                  <span className="text-[var(--text-tertiary)] ml-2">
                    {place.distance < 1
                      ? `${Math.round(place.distance * 1000)}m`
                      : `${place.distance.toFixed(1)}km`}
                  </span>
                )}
              </p>
            </div>

            {place.businessHours && (
              <div className="flex items-start gap-2">
                <Clock
                  size={16}
                  className="text-[var(--text-tertiary)] flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <p className="typo-caption text-[var(--text-secondary)]">
                  {place.businessHours}
                </p>
              </div>
            )}

            {place.phone && (
              <div className="flex items-start gap-2">
                <Phone
                  size={16}
                  className="text-[var(--text-tertiary)} flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <a
                  href={`tel:${place.phone}`}
                  className="typo-caption text-[var(--brand)] hover:underline"
                >
                  {place.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className="px-[var(--sp-4)] py-[var(--sp-4)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Gift size={20} className="text-[var(--brand)]" strokeWidth={2} />
            이용 가능한 오퍼
            {offers.length > 0 && (
              <span className="typo-caption text-[var(--text-secondary)]">
                {offers.length}개
              </span>
            )}
          </h3>

          {offers.length === 0 ? (
            <div className="text-center py-8">
              <p className="typo-body text-[var(--text-secondary)]">
                현재 이용 가능한 오퍼가 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-[var(--sp-3)]">
              {offers.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => onOfferSelect(offer.id)}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[var(--radius-md)] p-[var(--sp-3)] hover:shadow-[var(--elev-1)] transition-all duration-[var(--dur-fast)] text-left"
                >
                  <div className="flex items-start gap-[var(--sp-3)]">
                    {/* Brand Logo */}
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[var(--bg-base)] flex-shrink-0">
                      <Image
                        src={offer.brandLogo}
                        alt={offer.brandName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--text-primary)] truncate">
                          {offer.brandName}
                        </h4>
                        {offer.isNew && (
                          <span className="px-2 py-0.5 bg-[var(--brand)]/12 text-[var(--brand)] typo-label font-medium rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="typo-caption text-[var(--text-secondary)] mb-1">
                        {offer.title}
                      </p>
                      <p className="typo-caption text-[var(--brand)] font-medium">
                        {offer.benefit}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={20}
                      className="text-[var(--text-tertiary)] flex-shrink-0 mt-2"
                      strokeWidth={2}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
