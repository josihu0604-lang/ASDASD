'use client';

import { useState } from 'react';
import QRScannerView from '@/components/scan/QRScannerView';
import VerifySheet, { VerifyResult } from '@/components/scan/VerifySheet';
import { ScanError } from '@/types';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(true);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [voucherData, setVoucherData] = useState<{
    title?: string;
    benefit?: string;
    placeName?: string;
  }>({});

  const handleScanResult = async (payload: string) => {
    console.log('[Scan] QR detected:', payload);
    setShowScanner(false);

    // Parse and verify QR code
    // 스펙: 왕복 ≤800ms (네트워크 환경 보통)
    try {
      // Simulate API call for verification
      const startTime = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (payload.startsWith('VOUCHER:')) {
        const voucherId = payload.replace('VOUCHER:', '');

        // Mock verification logic - replace with actual API
        // 스펙: 4분기 - success/used/expired/invalid
        const mockResult = Math.random();

        if (mockResult > 0.7) {
          // 성공 (30%)
          setVerifyResult('success');
          setVoucherData({
            title: '카페 블루 아메리카노',
            benefit: '아메리카노 1잔 무료',
            placeName: '카페 블루 강남점',
          });
          analytics.track({
            name: 'qr_verify',
            properties: { result: 'success', voucher_id: voucherId },
          });
          analytics.track({
            name: 'voucher_use',
            properties: { voucher_id: voucherId },
          });
        } else if (mockResult > 0.5) {
          // 이미 사용됨 (20%)
          setVerifyResult('used');
          setVoucherData({ title: '카페 블루 아메리카노' });
          analytics.track({
            name: 'qr_verify',
            properties: { result: 'used', voucher_id: voucherId },
          });
        } else if (mockResult > 0.3) {
          // 만료됨 (20%)
          setVerifyResult('expired');
          setVoucherData({ title: '카페 블루 아메리카노' });
          analytics.track({
            name: 'qr_verify',
            properties: { result: 'expired', voucher_id: voucherId },
          });
        } else {
          // 무효 (30%)
          setVerifyResult('invalid');
          analytics.track({
            name: 'qr_verify',
            properties: { result: 'invalid', voucher_id: voucherId },
          });
        }

        const elapsed = Date.now() - startTime;
        console.log(`[Scan] Verification completed in ${elapsed}ms`);
      } else {
        // 인식할 수 없는 QR 코드
        setVerifyResult('invalid');
        analytics.qrScanResult('unknown');
      }
    } catch (error) {
      console.error('[Scan] Verification failed:', error);
      setVerifyResult('invalid');
    }
  };

  const handleScanError = (code: ScanError) => {
    console.error('[Scan] Error:', code);
    analytics.qrError(code);
    // 스펙: 오프라인 시 안내 및 재시도 큐잉
    if (code === 'unavailable') {
      // Could show OfflineState here
    }
  };

  const handleCloseSheet = () => {
    setVerifyResult(null);
    setVoucherData({});
    setShowScanner(true);
    analytics.qrScanStart();
  };

  const handleRetry = () => {
    setVerifyResult(null);
    setVoucherData({});
    setShowScanner(true);
    analytics.qrScanStart();
  };

  const handleCloseScanner = () => {
    router.back();
  };

  return (
    <>
      {showScanner && (
        <QRScannerView
          onResult={handleScanResult}
          onError={handleScanError}
          onClose={handleCloseScanner}
        />
      )}

      {verifyResult && (
        <VerifySheet
          result={verifyResult}
          voucherTitle={voucherData.title}
          voucherBenefit={voucherData.benefit}
          placeName={voucherData.placeName}
          onClose={handleCloseSheet}
          onRetry={handleRetry}
        />
      )}
    </>
  );
}
