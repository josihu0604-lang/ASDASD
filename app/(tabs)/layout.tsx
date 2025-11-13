'use client';

import BottomTabBar from '@/components/navigation/BottomTabBar';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Track route views
    analytics.routeView(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      {/* Main content with safe area padding */}
      <main className="pt-[env(safe-area-inset-top)]">{children}</main>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </div>
  );
}
