'use client';

import { WalletSummary as WalletSummaryType } from '@/types';
import { Coins, Stamp, Ticket } from 'lucide-react';

interface WalletSummaryProps {
  summary: WalletSummaryType;
}

export default function WalletSummary({ summary }: WalletSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-[var(--sp-3)]">
      {/* Points */}
      <div className="bg-[var(--bg-elev-1)] rounded-[var(--radius-lg)] p-4 shadow-[var(--elev-1)]">
        <div className="flex items-center gap-[var(--sp-2)] mb-2">
          <div className="h-8 w-8 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
            <Coins size={18} className="text-[var(--brand)]" strokeWidth={2} />
          </div>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          {summary.points.toLocaleString()}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">포인트</p>
      </div>

      {/* Stamps */}
      <div className="bg-[var(--bg-elev-1)] rounded-[var(--radius-lg)] p-4 shadow-[var(--elev-1)]">
        <div className="flex items-center gap-[var(--sp-2)] mb-2">
          <div className="h-8 w-8 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
            <Stamp size={18} className="text-[var(--success)]" strokeWidth={2} />
          </div>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          {summary.stamps}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">스탬프</p>
      </div>

      {/* Active Vouchers */}
      <div className="bg-[var(--bg-elev-1)] rounded-[var(--radius-lg)] p-4 shadow-[var(--elev-1)]">
        <div className="flex items-center gap-[var(--sp-2)] mb-2">
          <div className="h-8 w-8 rounded-full bg-[var(--info)]/10 flex items-center justify-center">
            <Ticket size={18} className="text-[var(--info)]" strokeWidth={2} />
          </div>
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          {summary.activeVouchers}
        </p>
        <p className="text-xs text-[var(--text-secondary)]">보유 체험권</p>
        {summary.expiringVouchers > 0 && (
          <p className="text-xs text-[var(--warning)] font-medium mt-1">
            {summary.expiringVouchers}개 만료 임박
          </p>
        )}
      </div>
    </div>
  );
}
