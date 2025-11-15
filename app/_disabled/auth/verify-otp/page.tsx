'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPVerifyBodySchema } from '@/lib/schemas/api';
import { z } from 'zod';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!phone) {
      router.push('/auth/login');
    }
  }, [phone, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validated = OTPVerifyBodySchema.parse({ phone, code });

      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || '인증 실패');
      }

      const data = await response.json();
      
      // Store auth token
      localStorage.setItem('auth_token', data.token);
      
      // Navigate to main app
      router.push('/pass');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('인증 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error('재전송 실패');
      }

      alert('인증 코드를 재전송했습니다');
    } catch (err) {
      setError('재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] p-8">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={() => router.back()}
          className="text-[var(--text-muted)] hover:text-[var(--text)] mb-4"
          aria-label="뒤로 가기"
        >
          ← 뒤로
        </button>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          인증 코드 입력
        </h1>
        <p className="text-[var(--text-muted)]">
          {phone}로 전송된 6자리 코드를 입력해주세요
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label
            htmlFor="otp-code"
            className="block text-sm font-medium text-[var(--text)] mb-2"
          >
            인증 코드
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full px-4 py-4 bg-[var(--surface)] border border-[var(--text-muted)]/20 rounded-lg text-[var(--text)] text-center text-2xl tracking-widest placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            required
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? 'otp-error' : undefined}
            autoFocus
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="otp-error"
            className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg text-[var(--danger)] text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-4 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {loading ? '인증 중...' : '인증하기'}
        </button>

        {/* Resend Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full py-3 text-[var(--text-muted)] hover:text-[var(--text)] text-sm transition-colors disabled:opacity-50"
        >
          {resending ? '재전송 중...' : '인증 코드 재전송'}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
