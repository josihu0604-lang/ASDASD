'use client';

import { Voucher } from '@/types';
import { Calendar, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { EmptyState } from '@/components/states';
import { Ticket } from 'lucide-react';

interface VoucherListProps {
  status: 'active' | 'used' | 'expired';
  vouchers: Voucher[];
  onOpen?: (voucherId: string) => void;
}

export default function VoucherList({
  status,
  vouchers,
  onOpen,
}: VoucherListProps) {
  // Filter vouchers by status
  const filteredVouchers = vouchers.filter((v) => v.status === status || 
    (status === 'active' && (v.status === 'active' || v.status === 'expiring_soon' || v.status === 'reserved')));

  // Empty state
  if (filteredVouchers.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title={
          status === 'active'
            ? '발급받은 체험권이 없습니다'
            : status === 'used'
            ? '사용한 체험권이 없습니다'
            : '만료된 체험권이 없습니다'
        }
        description={
          status === 'active'
            ? '오퍼에서 수락하세요.'
            : undefined
        }
      />
    );
  }

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (voucher: Voucher) => {
    const days = getDaysUntilExpiry(voucher.expiresAt);

    if (voucher.status === 'used') {
      return (
        <span className="px-2 py-0.5 bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)] typo-label font-medium rounded-full">
          사용완료
        </span>
      );
    }

    if (voucher.status === 'expired') {
      return (
        <span className="px-2 py-0.5 bg-[var(--danger)]/10 text-[var(--danger)] typo-label font-medium rounded-full">
          만료됨
        </span>
      );
    }

    if (voucher.status === 'expiring_soon' || days <= 2) {
      return (
        <span className="px-2 py-0.5 bg-[var(--warning)]/12 text-[var(--warning)] typo-label font-medium rounded-full flex items-center gap-1">
          <AlertCircle size={12} />
          D-{days}
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 bg-[var(--success)]/10 text-[var(--success)] typo-label font-medium rounded-full">
        사용가능
      </span>
    );
  };

  return (
    <div className="space-y-[var(--sp-3)]">
      {filteredVouchers.map((voucher) => {
        const days = getDaysUntilExpiry(voucher.expiresAt);
        const isExpiringSoon = days <= 2 && voucher.status === 'active';

        return (
          <button
            key={voucher.id}
            onClick={() => onOpen?.(voucher.id)}
            className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-lg)] p-[var(--sp-4)] shadow-[var(--elev-1)] hover:shadow-[var(--elev-2)] transition-all duration-[var(--dur-fast)] text-left animate-fade-up"
          >
            <div className="flex items-start gap-[var(--sp-3)]">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-subtle)] flex-shrink-0">
                <Image
                  src={voucher.pass.coverUrl}
                  alt={voucher.pass.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">
                    {voucher.pass.title}
                  </h3>
                  {getStatusBadge(voucher)}
                </div>

                <p className="typo-caption text-[var(--text-secondary)] mb-2 truncate">
                  {voucher.pass.benefit}
                </p>

                {/* Expiry info */}
                <div className="flex items-center gap-[var(--sp-2)] typo-label text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} strokeWidth={2} />
                    <span>
                      {voucher.expiresAt.toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      까지
                    </span>
                  </div>
                  {days > 0 && days <= 7 && (
                    <span className="text-[var(--warning)] font-medium">
                      {days}일 남음
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={20}
                className="text-[var(--text-tertiary)] flex-shrink-0 mt-1"
                strokeWidth={2}
              />
            </div>

            {/* Expiring soon warning */}
            {isExpiringSoon && status === 'active' && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[var(--warning)]">
                <AlertCircle size={16} strokeWidth={2} />
                <p className="typo-caption font-medium">
                  곧 만료됩니다! 서둘러 사용하세요
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
