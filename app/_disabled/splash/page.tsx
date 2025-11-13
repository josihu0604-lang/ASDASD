'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for existing auth token
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');

        // Wait minimum 2 seconds for branding
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (token) {
          // User is authenticated, go to main app
          router.push('/pass');
        } else if (hasCompletedOnboarding) {
          // Onboarding completed, go to login
          router.push('/auth/login');
        } else {
          // First time user, show onboarding
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Splash screen error:', error);
        // Fallback to onboarding
        router.push('/onboarding');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-8">
      {/* Logo */}
      <div className="mb-8 animate-fade-in">
        <div className="h-24 w-24 rounded-2xl bg-[var(--primary)] flex items-center justify-center">
          <span className="text-4xl font-bold text-white">Z</span>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl font-bold text-[var(--text)] mb-2 animate-fade-in-up">
        ZZIK LIVE
      </h1>

      {/* Tagline */}
      <p className="text-[var(--text-muted)] text-center max-w-xs animate-fade-in-up animation-delay-200">
        지도로 증명되는 LIVE 체험
      </p>

      {/* Loading Indicator */}
      <div className="mt-12 animate-pulse">
        <div className="h-1 w-32 bg-[var(--primary)] rounded-full"></div>
      </div>
    </div>
  );
}
