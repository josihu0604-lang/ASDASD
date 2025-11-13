'use client';

import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownLeft, RotateCcw, Coins } from 'lucide-react';
import { EmptyState } from '@/components/states';

interface LedgerListProps {
  transactions: Transaction[];
  onTransactionClick?: (transactionId: string) => void;
}

export default function LedgerList({
  transactions,
  onTransactionClick,
}: LedgerListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Coins}
        title="거래 내역이 없습니다"
        description="체험권 구매 및 사용 내역이 여기에 표시됩니다."
      />
    );
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return {
          icon: ArrowUpRight,
          color: 'text-[var(--danger)]',
          bg: 'bg-[var(--danger)]/10',
        };
      case 'use':
        return {
          icon: ArrowDownLeft,
          color: 'text-[var(--warning)]',
          bg: 'bg-[var(--warning)]/10',
        };
      case 'refund':
        return {
          icon: RotateCcw,
          color: 'text-[var(--info)]',
          bg: 'bg-[var(--info)]/10',
        };
      case 'earn':
        return {
          icon: Coins,
          color: 'text-[var(--success)]',
          bg: 'bg-[var(--success)]/10',
        };
      default:
        return {
          icon: Coins,
          color: 'text-[var(--text-tertiary)]',
          bg: 'bg-[var(--bg-subtle)]',
        };
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return '구매';
      case 'use':
        return '사용';
      case 'refund':
        return '환불';
      case 'earn':
        return '적립';
      default:
        return '기타';
    }
  };

  const formatAmount = (type: Transaction['type'], amount: number) => {
    const sign = type === 'purchase' || type === 'use' ? '-' : '+';
    const color =
      type === 'purchase' || type === 'use'
        ? 'text-[var(--danger)]'
        : 'text-[var(--success)]';

    return (
      <span className={`font-semibold ${color}`}>
        {sign}₩{amount.toLocaleString()}
      </span>
    );
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.timestamp.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-[var(--sp-4)]">
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date}>
          {/* Date Header */}
          <h3 className="typo-caption font-medium text-[var(--text-secondary)] mb-[var(--sp-2)] px-1">
            {date}
          </h3>

          {/* Transactions for this date */}
          <div className="space-y-[var(--sp-2)]">
            {txs.map((transaction) => {
              const { icon: Icon, color, bg } = getTransactionIcon(transaction.type);

              return (
                <button
                  key={transaction.id}
                  onClick={() => onTransactionClick?.(transaction.id)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-md)] p-[var(--sp-3)] hover:shadow-[var(--elev-1)] transition-all duration-[var(--dur-fast)] text-left"
                >
                  <div className="flex items-center gap-[var(--sp-3)]">
                    {/* Icon */}
                    <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={color} strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="typo-label font-medium text-[var(--text-tertiary)]">
                          {getTransactionLabel(transaction.type)}
                        </span>
                      </div>
                      <h4 className="typo-body font-medium text-[var(--text-primary)] truncate">
                        {transaction.title}
                      </h4>
                      {transaction.description && (
                        <p className="typo-caption text-[var(--text-secondary)] truncate mt-0.5">
                          {transaction.description}
                        </p>
                      )}
                    </div>

                    {/* Amount & Time */}
                    <div className="text-right flex-shrink-0">
                      <div className="typo-body">
                        {formatAmount(transaction.type, transaction.amount)}
                      </div>
                      <div className="typo-label text-[var(--text-tertiary)] mt-0.5">
                        {transaction.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
