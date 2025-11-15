'use client';

import { useState, useEffect } from 'react';
import { Offer } from '@/types';
import OfferCard from './OfferCard';
import { LoadingState, SkeletonList, EmptyState } from '@/components/states';
import { Gift } from 'lucide-react';

// Filter types
export type OfferFilter = 'all' | 'new' | 'expiring';

interface OfferListProps {
  filter?: OfferFilter;
  cursor?: string;
  limit?: number;
  onAccept: (offerId: string) => void;
  onLater: (offerId: string) => void;
  onOpenDetail?: (offerId: string) => void;
}

export default function OfferList({
  filter = 'all',
  cursor,
  limit = 10,
  onAccept,
  onLater,
  onOpenDetail,
}: OfferListProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Mock data fetching - replace with actual API call
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Mock offers data
        const mockOffers: Offer[] = [
          {
            id: '1',
            brandName: '카페 블루',
            brandLogo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100',
            title: '아메리카노 1+1',
            benefit: '모든 음료 20% 할인',
            conditions: ['평일 14:00-18:00', '1인 1회'],
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            distance: 0.3,
            isNew: true,
            status: 'new',
            places: [],
          },
          {
            id: '2',
            brandName: '맥심 레스토랑',
            brandLogo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
            title: '메인 메뉴 할인',
            benefit: '런치세트 30% 할인',
            conditions: ['평일 런치타임'],
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-02-28'),
            distance: 0.8,
            status: 'expiring_soon',
            places: [],
          },
        ];

        // Filter based on selected filter
        let filtered = mockOffers;
        if (filter === 'new') {
          filtered = mockOffers.filter((o) => o.status === 'new');
        } else if (filter === 'expiring') {
          filtered = mockOffers.filter((o) => o.status === 'expiring_soon');
        }

        setOffers(filtered);
        setHasMore(filtered.length >= limit);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [filter, cursor, limit]);

  const handleAccept = async (offerId: string) => {
    // Show loading feedback (200ms within spec)
    const offerElement = document.querySelector(`[data-offer-id="${offerId}"]`);
    if (offerElement) {
      offerElement.classList.add('opacity-50', 'pointer-events-none');
    }

    try {
      await onAccept(offerId);
      // Remove from list after successful accept
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch (error) {
      // Restore UI on error
      if (offerElement) {
        offerElement.classList.remove('opacity-50', 'pointer-events-none');
      }
    }
  };

  const handleLater = (offerId: string) => {
    onLater(offerId);
    // Remove from current view
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-[var(--sp-3)]">
        <SkeletonList count={6} />
      </div>
    );
  }

  // Empty state
  if (offers.length === 0) {
    return (
      <EmptyState
        icon={Gift}
        title="오퍼가 없습니다"
        description={
          filter === 'new'
            ? '새로운 오퍼가 도착하면 알려드릴게요.'
            : filter === 'expiring'
            ? '만료 임박 오퍼가 없습니다.'
            : '주변 가게의 오퍼가 도착하면 여기에 표시됩니다.'
        }
      />
    );
  }

  return (
    <div className="space-y-[var(--sp-3)]">
      {offers.map((offer) => (
        <div key={offer.id} data-offer-id={offer.id} className="transition-opacity duration-200">
          <OfferCard
            offer={offer}
            onAccept={handleAccept}
            onDismiss={handleLater}
            onOpenDetail={onOpenDetail || (() => {})}
          />
        </div>
      ))}

      {/* Infinite scroll placeholder */}
      {hasMore && (
        <div className="py-4 text-center">
          <button
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => {
              // Implement load more
              console.log('Load more offers');
            }}
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
