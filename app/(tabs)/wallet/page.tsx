'use client';

import { useState } from 'react';
import WalletSummary from '@/components/wallet/WalletSummary';
import { WalletSummary as WalletSummaryType } from '@/types';
import { Ticket, History, CreditCard, ChevronRight } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

const mockSummary: WalletSummaryType = {
  points: 12500,
  stamps: 8,
  activeVouchers: 5,
  expiringVouchers: 2,
};

export default function WalletPage() {
  const router = useRouter();
  const [summary] = useState(mockSummary);

  useState(() => {
    analytics.walletView();
  });

  const handleSectionOpen = (
    section: 'passes' | 'transactions' | 'payments'
  ) => {
    analytics.walletSectionOpen(section);
    router.push(`/wallet/${section}`);
  };

  const sections = [
    {
      id: 'passes' as const,
      icon: Ticket,
      title: '보유 체험권',
      description: `${summary.activeVouchers}개 사용 가능`,
      badge: summary.expiringVouchers > 0 ? summary.expiringVouchers : undefined,
    },
    {
      id: 'transactions' as const,
      icon: History,
      title: '거래내역',
      description: '구매 및 사용 내역',
    },
    {
      id: 'payments' as const,
      icon: CreditCard,
      title: '결제수단',
      description: '카드 및 간편결제 관리',
    },
  ];

  return (
    <div className="p-4 space-y-[var(--sp-6)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          지갑
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          포인트, 스탬프, 체험권을 관리하세요
        </p>
      </div>

      {/* Summary Cards */}
      <WalletSummary summary={summary} />

      {/* Section Cards */}
      <div className="space-y-[var(--sp-3)]">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => handleSectionOpen(section.id)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--sp-4)] shadow-[var(--elev-1)] hover:bg-[var(--bg-subtle)] transition-colors duration-[var(--dur-md)] active:scale-[0.98]"
            >
              <div className="flex items-center gap-[var(--sp-4)]">
                <div className="h-12 w-12 rounded-full bg-[var(--brand)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon
                    size={24}
                    className="text-[var(--brand)]"
                    strokeWidth={2}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-[var(--sp-2)]">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {section.title}
                    </h3>
                    {section.badge && (
                      <span className="px-2 py-0.5 bg-[var(--warning)]/12 text-[var(--warning)] text-xs font-medium rounded-full">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {section.description}
                  </p>
                </div>

                <ChevronRight
                  size={20}
                  className="text-[var(--text-tertiary)] flex-shrink-0"
                  strokeWidth={2}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
