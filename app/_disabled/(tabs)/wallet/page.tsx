'use client';

import { useState, useEffect } from 'react';
import WalletSummary from '@/components/wallet/WalletSummary';
import VoucherList from '@/components/wallet/VoucherList';
import LedgerList from '@/components/wallet/LedgerList';
import { WalletSummary as WalletSummaryType, Voucher, Transaction, Pass } from '@/types';
import { AlertCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

// Mock data
const mockPass: Pass = {
  id: 'p1',
  placeId: 'place1',
  title: '카페 블루 아메리카노',
  benefit: '아메리카노 1잔 무료',
  price: 0,
  coverUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200',
  mediaUrls: [],
  validUntil: new Date('2025-12-31'),
  remainingCount: 10,
  category: 'cafe',
  terms: ['평일 14:00-18:00', '1인 1회'],
};

const mockSummary: WalletSummaryType = {
  points: 12500,
  stamps: 8,
  activeVouchers: 3,
  expiringVouchers: 1,
};

const mockVouchers: Voucher[] = [
  {
    id: 'v1',
    passId: 'p1',
    pass: mockPass,
    status: 'expiring_soon',
    purchasedAt: new Date('2025-01-10'),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
  },
  {
    id: 'v2',
    passId: 'p1',
    pass: { ...mockPass, title: '맥심 레스토랑 런치세트', coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200' },
    status: 'active',
    purchasedAt: new Date('2025-01-12'),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
  },
  {
    id: 'v3',
    passId: 'p1',
    pass: { ...mockPass, title: '올리브영 뷰티 체험', coverUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200' },
    status: 'used',
    purchasedAt: new Date('2025-01-01'),
    expiresAt: new Date('2025-02-01'),
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'use',
    amount: 15000,
    title: '올리브영 뷰티 체험',
    description: '체험권 사용',
    timestamp: new Date(),
    voucherId: 'v3',
  },
  {
    id: 't2',
    type: 'earn',
    amount: 500,
    title: '포인트 적립',
    description: '체험권 사용 리워드',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
];

type TabType = 'vouchers' | 'ledger';

export default function WalletPage() {
  const router = useRouter();
  const [summary] = useState(mockSummary);
  const [vouchers] = useState(mockVouchers);
  const [transactions] = useState(mockTransactions);
  const [activeTab, setActiveTab] = useState<TabType>('vouchers');
  const [voucherFilter, setVoucherFilter] = useState<'active' | 'used' | 'expired'>('active');

  useEffect(() => {
    analytics.walletView();
  }, []);

  const handleVoucherOpen = (voucherId: string) => {
    analytics.track({ name: 'voucher_view', properties: { voucher_id: voucherId } });
    router.push(`/wallet/vouchers/${voucherId}`);
  };

  const handleTransactionClick = (transactionId: string) => {
    console.log('[Wallet] Transaction clicked:', transactionId);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-[calc(var(--sp-12)+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-base)] border-b border-[var(--border)] px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)]">
        <div className="mb-[var(--sp-4)]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            지갑
          </h1>
          <p className="typo-caption text-[var(--text-secondary)]">
            포인트, 스탬프, 체험권을 관리하세요
          </p>
        </div>

        {/* Summary Cards (스펙: 3열 요약) */}
        <WalletSummary summary={summary} />

        {/* Expiring Soon Warning (스펙: D≤2 상단 경고) */}
        {summary.expiringVouchers > 0 && (
          <div className="mt-[var(--sp-3)] p-[var(--sp-3)] bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-[var(--radius-md)] flex items-center gap-2">
            <AlertCircle size={16} className="text-[var(--warning)] flex-shrink-0" strokeWidth={2} />
            <p className="typo-caption text-[var(--warning)] font-medium">
              {summary.expiringVouchers}개의 체험권이 곧 만료됩니다
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-[var(--sp-4)] pt-[var(--sp-4)]">
        {/* Section Tabs */}
        <div className="flex gap-[var(--sp-2)] mb-[var(--sp-4)] border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`
              pb-[var(--sp-2)] px-[var(--sp-2)] typo-body font-medium transition-colors duration-[var(--dur-fast)]
              ${
                activeTab === 'vouchers'
                  ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]'
                  : 'text-[var(--text-secondary)]'
              }
            `}
            role="tab"
            aria-selected={activeTab === 'vouchers'}
          >
            보유 체험권
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`
              pb-[var(--sp-2)] px-[var(--sp-2)] typo-body font-medium transition-colors duration-[var(--dur-fast)]
              ${
                activeTab === 'ledger'
                  ? 'text-[var(--brand)] border-b-2 border-[var(--brand)]'
                  : 'text-[var(--text-secondary)]'
              }
            `}
            role="tab"
            aria-selected={activeTab === 'ledger'}
          >
            거래내역
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'vouchers' && (
          <div>
            {/* Voucher Filter */}
            <div className="flex gap-[var(--sp-2)] mb-[var(--sp-4)] overflow-x-auto scrollbar-hide">
              {(['active', 'used', 'expired'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setVoucherFilter(filter)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-[var(--radius-full)] typo-caption font-medium
                    transition-all duration-[var(--dur-fast)]
                    ${
                      voucherFilter === filter
                        ? 'bg-[var(--brand)] text-white'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                    }
                  `}
                >
                  {filter === 'active' ? '사용가능' : filter === 'used' ? '사용완료' : '만료됨'}
                </button>
              ))}
            </div>

            <VoucherList
              status={voucherFilter}
              vouchers={vouchers}
              onOpen={handleVoucherOpen}
            />
          </div>
        )}

        {activeTab === 'ledger' && (
          <LedgerList
            transactions={transactions}
            onTransactionClick={handleTransactionClick}
          />
        )}
      </div>
    </div>
  );
}
