'use client';

import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { getButtonClasses } from '@/lib/button-presets';
import { useEffect, useState } from 'react';

// 스펙: 4분기 - 성공/이미사용/만료/무효
export type VerifyResult = 'success' | 'used' | 'expired' | 'invalid';

interface VerifySheetProps {
  result: VerifyResult;
  voucherTitle?: string;
  voucherBenefit?: string;
  placeNam?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export default function VerifySheet({
  result,
  voucherTitle,
  voucherBenefit,
  placeName,
  onClose,
  onRetry,
}: VerifySheetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 애니메이션: bottom sheet 200ms
    setIsVisible(true);

    // 성공 시 햅틱 피드백 (모바일)
    if (result === 'success' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [result]);

  const getResultConfig = () => {
    switch (result) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-[var(--success)]',
          iconBg: 'bg-[var(--success)]/10',
          title: '사용 완료',
          message: voucherTitle
            ? `${voucherTitle}를 사용했습니다`
            : '체험권이 성공적으로 사용되었습니다',
          details: voucherBenefit,
          primaryButton: { label: '확인', onClick: onClose },
          animation: 'scale-98', // 스펙: scale 0.98 → 1.0
        };
      case 'used':
        return {
          icon: XCircle,
          iconColor: 'text-[var(--danger)]',
          iconBg: 'bg-[var(--danger)]/10',
          title: '이미 사용됨',
          message: '이 체험권은 이미 사용되었습니다',
          details: voucherTitle,
          primaryButton: { label: '확인', onClick: onClose },
          secondaryButton: onRetry
            ? { label: '다시 스캔', onClick: onRetry }
            : undefined,
        };
      case 'expired':
        return {
          icon: Clock,
          iconColor: 'text-[var(--warning)]',
          iconBg: 'bg-[var(--warning)]/10',
          title: '만료된 체험권',
          message: '이 체험권의 사용 기한이 지났습니다',
          details: voucherTitle,
          primaryButton: { label: '확인', onClick: onClose },
        };
      case 'invalid':
        return {
          icon: AlertCircle,
          iconColor: 'text-[var(--danger)]',
          iconBg: 'bg-[var(--danger)]/10',
          title: '유효하지 않은 QR 코드',
          message: '인식할 수 없는 QR 코드입니다',
          details: 'ZZIK LIVE 체험권 QR 코드를 스캔해 주세요',
          primaryButton: { label: '확인', onClick: onClose },
          secondaryButton: onRetry
            ? { label: '다시 스캔', onClick: onRetry }
            : undefined,
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[var(--scrim)] z-40 transition-opacity duration-[var(--dur-md)] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[var(--bg-base)] rounded-t-[var(--radius-xl)] shadow-[var(--elev-2)] z-50 pb-[env(safe-area-inset-bottom)] transition-transform duration-[var(--dur-md)] ease-[var(--ease-out)] ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        } ${result === 'success' ? config.animation : ''}`}
        style={{
          animation:
            result === 'success' && isVisible
              ? 'success-pop 180ms ease-out'
              : undefined,
        }}
      >
        <div className="p-[var(--sp-6)]">
          {/* Icon */}
          <div className={`rounded-full ${config.iconBg} p-4 mx-auto mb-4 w-fit`}>
            <Icon size={48} className={config.iconColor} strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            {config.title}
          </h2>

          {/* Message */}
          <p className="typo-body text-[var(--text-secondary)] text-center mb-1">
            {config.message}
          </p>

          {/* Details */}
          {config.details && (
            <p className="typo-caption text-[var(--text-tertiary)] text-center mb-6">
              {config.details}
            </p>
          )}

          {/* Place info for success */}
          {result === 'success' && placeName && (
            <div className="mb-6 p-3 bg-[var(--bg-subtle)] rounded-[var(--radius-md)]">
              <p className="typo-caption text-[var(--text-secondary)] text-center">
                사용 장소: <span className="font-medium text-[var(--text-primary)]">{placeName}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-[var(--sp-2)]">
            <button
              onClick={config.primaryButton.onClick}
              className={`${getButtonClasses('primary', 'lg')} min-h-[var(--touch-min)]`}
            >
              {config.primaryButton.label}
            </button>

            {config.secondaryButton && (
              <button
                onClick={config.secondaryButton.onClick}
                className={`${getButtonClasses('ghost', 'md')} min-h-[var(--touch-min)]`}
              >
                {config.secondaryButton.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Animation */}
      <style jsx>{`
        @keyframes success-pop {
          0% {
            transform: translateY(100%) scale(0.98);
            opacity: 0.8;
          }
          60% {
            transform: translateY(-8px) scale(1.01);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
