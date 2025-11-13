'use client';

import { useState, useEffect } from 'react';
import OfferFilters from '@/components/offers/OfferFilters';
import OfferList, { OfferFilter } from '@/components/offers/OfferList';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

export default function OffersPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<OfferFilter>('all');
  const [walletCount, setWalletCount] = useState(0);

  // Track page view on mount
  useEffect(() => {
    analytics.offersView(selectedFilter);
  }, [selectedFilter]);

  const handleFilterChange = (filter: OfferFilter) => {
    setSelectedFilter(filter);
    analytics.offersView(filter);
  };

  const handleAccept = async (offerId: string) => {
    try {
      // Track analytics event (스펙: offer_save)
      analytics.offerAccept(offerId);
      console.log('[Offers] Accept offer:', offerId);

      // Simulate API call for wallet issuance
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update wallet count (스펙: 지갑 탭 뱃지+1)
      setWalletCount((prev) => prev + 1);

      // Show success toast (스펙: "지갑에 발급됨" 토스트)
      if (typeof window !== 'undefined') {
        // Simple toast implementation - can be replaced with proper toast library
        const toast = document.createElement('div');
        toast.textContent = '지갑에 발급됨 ✓';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-[var(--success)] text-white px-4 py-2 rounded-[var(--radius-md)] shadow-[var(--elev-2)] z-50 animate-fade-up typo-caption font-medium';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    } catch (error) {
      console.error('[Offers] Failed to accept:', error);
      // Show error toast
      if (typeof window !== 'undefined') {
        const toast = document.createElement('div');
        toast.textContent = '오류가 발생했습니다';
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-[var(--danger)] text-white px-4 py-2 rounded-[var(--radius-md)] shadow-[var(--elev-2)] z-50 animate-fade-up typo-caption font-medium';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    }
  };

  const handleLater = (offerId: string) => {
    analytics.offerDismiss(offerId);
    console.log('[Offers] Dismiss offer:', offerId);
  };

  const handleOpenDetail = (offerId: string) => {
    analytics.offerView(offerId);
    router.push(`/offers/${offerId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-[calc(var(--sp-12)+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-base)] border-b border-[var(--border)] px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)]">
        <div className="mb-[var(--sp-3)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            받은 오퍼
          </h1>
          <p className="typo-caption text-[var(--text-secondary)]">
            브랜드에서 보낸 맞춤 제안을 확인하세요
          </p>
        </div>

        {/* Filters (스펙: 수평 스크롤, active 상태 명확) */}
        <OfferFilters selected={selectedFilter} onChange={handleFilterChange} />
      </div>

      {/* Content */}
      <div className="px-[var(--sp-4)] pt-[var(--sp-4)]">
        <OfferList
          filter={selectedFilter}
          limit={10}
          onAccept={handleAccept}
          onLater={handleLater}
          onOpenDetail={handleOpenDetail}
        />
      </div>

      {/* Hidden wallet count for badge sync (can be moved to context/store) */}
      {walletCount > 0 && (
        <div className="sr-only" aria-live="polite">
          지갑에 {walletCount}개의 체험권이 추가되었습니다
        </div>
      )}
    </div>
  );
}
