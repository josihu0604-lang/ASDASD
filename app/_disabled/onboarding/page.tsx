'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 'value',
    title: '현장 체험을 증명하는\nLIVE 릴스',
    description: '나노 크리에이터가 실제 방문으로 만드는 신뢰할 수 있는 콘텐츠',
    icon: '🎥',
  },
  {
    id: 'location',
    title: '내 주변\n체험권 발견',
    description: '지도에서 가까운 체험 기회를 찾아보세요. 위치 권한이 필요합니다.',
    icon: '📍',
  },
  {
    id: 'verification',
    title: 'QR 스캔으로\n간편 검증',
    description: 'GPS + QR + 영수증으로 실제 방문을 증명하고 보상을 받으세요',
    icon: '✅',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    router.push('/auth/login');
  };

  const slide = slides[currentSlide];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          aria-label="온보딩 건너뛰기"
        >
          건너뛰기
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24">
        {/* Icon */}
        <div className="text-8xl mb-8 animate-fade-in" key={`icon-${slide.id}`}>
          {slide.icon}
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold text-[var(--text)] text-center mb-4 whitespace-pre-line animate-fade-in-up"
          key={`title-${slide.id}`}
        >
          {slide.title}
        </h2>

        {/* Description */}
        <p
          className="text-[var(--text-muted)] text-center max-w-sm animate-fade-in-up animation-delay-200"
          key={`desc-${slide.id}`}
        >
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8 space-y-4">
        {/* Progress Indicators */}
        <div
          className="flex justify-center gap-2 mb-4"
          role="tablist"
          aria-label="온보딩 진행 상황"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-[var(--primary)]'
                  : 'w-2 bg-[var(--text-muted)] opacity-30'
              }`}
              onClick={() => setCurrentSlide(index)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>

        {/* Next/Complete Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-[var(--primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {currentSlide === slides.length - 1 ? '시작하기' : '다음'}
        </button>

        {/* Slide Counter */}
        <p className="text-center text-[var(--text-muted)] text-sm">
          {currentSlide + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
}
