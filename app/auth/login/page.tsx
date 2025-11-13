'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagicLinkBodySchema, OTPSendBodySchema } from '@/lib/schemas/api';
import { z } from 'zod';

type LoginMode = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('email');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'email') {
        // Validate email
        const validated = MagicLinkBodySchema.parse({ email: input });

        // Send magic link
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || '로그인 링크 전송 실패');
        }

        setSuccess('로그인 링크를 이메일로 전송했습니다. 확인해주세요.');
      } else {
        // Validate phone
        const validated = OTPSendBodySchema.parse({ phone: input });

        // Send OTP
        const response = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'OTP 전송 실패');
        }

        // Navigate to OTP verification
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(input)}`);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">로그인</h1>
        <p className="text-[var(--text-muted)]">
          ZZIK LIVE에 오신 것을 환영합니다
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6" role="tablist">
        <button
          onClick={() => {
            setMode('email');
            setInput('');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            mode === 'email'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface)]/80'
          }`}
          role="tab"
          aria-selected={mode === 'email'}
        >
          이메일
        </button>
        <button
          onClick={() => {
            setMode('phone');
            setInput('');
            setError('');
            setSuccess('');
          }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            mode === 'phone'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface)]/80'
          }`}
          role="tab"
          aria-selected={mode === 'phone'}
        >
          휴대폰
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-input"
            className="block text-sm font-medium text-[var(--text)] mb-2"
          >
            {mode === 'email' ? '이메일 주소' : '휴대폰 번호'}
          </label>
          <input
            id="login-input"
            type={mode === 'email' ? 'email' : 'tel'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'email' ? 'example@zzik.live' : '01012345678'
            }
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--text-muted)]/20 rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            required
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="login-error"
            className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg text-[var(--danger)] text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="p-3 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg text-[var(--success)] text-sm"
            role="status"
          >
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !input}
          className="w-full py-4 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {loading
            ? '전송 중...'
            : mode === 'email'
            ? '로그인 링크 받기'
            : '인증 코드 받기'}
        </button>
      </form>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
        <p>계정이 없으신가요?</p>
        <p className="mt-1">
          첫 로그인 시 자동으로 가입됩니다
        </p>
      </div>

      {/* Terms */}
      <div className="mt-auto pt-8 text-xs text-[var(--text-muted)] text-center">
        로그인하면{' '}
        <a href="/terms" className="underline hover:text-[var(--text)]">
          이용약관
        </a>
        과{' '}
        <a href="/privacy" className="underline hover:text-[var(--text)]">
          개인정보처리방침
        </a>
        에 동의하는 것으로 간주됩니다.
      </div>
    </div>
  );
}
