'use client';

import { useState } from 'react';
import FilterChips from '@/components/pass/FilterChips';
import OfferCard from '@/components/offers/OfferCard';
import EmptyState from '@/components/states/EmptyState';
import { Filter, Offer } from '@/types';
import { Gift } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

const filterOptions: Filter[] = [
  { id: 'all', label: '전체', selected: true },
  { id: 'new', label: '새로온', selected: false },
  { id: 'expiring', label: '만료임박', selected: false },
];

// Mock data
const mockOffers: Offer[] = [
  {
    id: '1',
    brandName: '스타벅스',
    brandLogo: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=100',
    title: '신규 고객 환영 이벤트',
    benefit: '아메리카노 1잔 무료',
    conditions: ['첫 방문 시', '1인 1회 한정'],
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    distance: 0.5,
    isNew: true,
    status: 'new',
    places: [],
  },
  {
    id: '2',
    brandName: '올리브영',
    brandLogo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100',
    title: '뷰티 체험단 모집',
    benefit: '5만원 이상 구매 시 20% 할인',
    conditions: ['신규 가입 회원', '기간 내 사용'],
    validFrom: new Date('2024-01-15'),
    validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    distance: 1.2,
    status: 'expiring_soon',
    places: [],
  },
];

export default function OffersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Filter[]>(filterOptions);
  const [offers] = useState<Offer[]>(mockOffers);

  const activeFilter = filters.find((f) => f.selected)?.id || 'all';

  // Track page view
  useState(() => {
    analytics.offersView(activeFilter as 'all' | 'new' | 'expiring');
  });

  const filteredOffers = offers.filter((offer) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') return offer.status === 'new';
    if (activeFilter === 'expiring') return offer.status === 'expiring_soon';
    return true;
  });

  const handleFilterToggle = (id: string) => {
    setFilters((prev) =>
      prev.map((f) => ({
        ...f,
        selected: f.id === id,
      }))
    );
    analytics.offersView(id as 'all' | 'new' | 'expiring');
  };

  const handleAccept = (offerId: string) => {
    console.log('Accept offer:', offerId);
    analytics.offerAccept(offerId);
    // In production, save to wallet
  };

  const handleDismiss = (offerId: string) => {
    console.log('Dismiss offer:', offerId);
    analytics.offerDismiss(offerId);
    // In production, hide offer
  };

  const handleOpenDetail = (offerId: string) => {
    analytics.offerView(offerId);
    router.push(`/offers/${offerId}`);
  };

  return (
    <div className="p-4 space-y-[var(--sp-4)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          받은 오퍼
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          브랜드에서 보낸 맞춤 제안을 확인하세요
        </p>
      </div>

      {/* Filters */}
      <FilterChips filters={filters} onToggle={handleFilterToggle} />

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="받은 오퍼가 없습니다"
          description="브랜드에서 새로운 제안이 오면 여기에 표시됩니다."
        />
      ) : (
        <div className="space-y-[var(--sp-3)]">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
