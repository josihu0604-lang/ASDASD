'use client';

import { useState } from 'react';
import SearchBar from '@/components/pass/SearchBar';
import FilterChips from '@/components/pass/FilterChips';
import ReelsCarousel from '@/components/pass/ReelsCarousel';
import MiniMap from '@/components/pass/MiniMap';
import PlaceSheet from '@/components/pass/PlaceSheet';
import { Filter, Reel, MapPin, Place, Offer } from '@/types';
import { analytics } from '@/lib/analytics';
import { useRouter } from 'next/navigation';

// Mock data
const mockFilters: Filter[] = [
  { id: 'cafe', label: '카페', selected: false },
  { id: 'bar', label: '바/술집', selected: false },
  { id: 'activity', label: '액티비티', selected: false },
  { id: 'nearby', label: '가까운 순', selected: false },
  { id: 'discount', label: '할인율 높은 순', selected: false },
];

const mockReels: Reel[] = [
  {
    id: '1',
    placeId: 'place1',
    coverUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    videoUrl: '/videos/reel1.mp4',
    duration: 15,
    viewCount: 1200,
  },
  {
    id: '2',
    placeId: 'place2',
    coverUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400',
    videoUrl: '/videos/reel2.mp4',
    duration: 20,
    viewCount: 850,
  },
  {
    id: '3',
    placeId: 'place3',
    coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
    videoUrl: '/videos/reel3.mp4',
    duration: 18,
    viewCount: 2300,
  },
];

const mockPins: MapPin[] = [
  { id: 'place1', lat: 37.5665, lng: 126.978, category: 'cafe' },
  { id: 'place2', lat: 37.5675, lng: 126.98, category: 'bar', count: 3 },
  { id: 'place3', lat: 37.565, lng: 126.975, category: 'activity' },
];

// Mock places data
const mockPlaces: Record<string, Place> = {
  place1: {
    id: 'place1',
    name: '카페 블루',
    category: 'cafe',
    lat: 37.5665,
    lng: 126.978,
    address: '서울 강남구 테헤란로 123',
    distance: 0.3,
    rating: 4.5,
    isOpen: true,
    businessHours: '평일 09:00-22:00',
    phone: '02-1234-5678',
  },
  place2: {
    id: 'place2',
    name: '맥심 레스토랑',
    category: 'bar',
    lat: 37.5675,
    lng: 126.98,
    address: '서울 강남구 역삼동 456',
    distance: 0.8,
    rating: 4.7,
    isOpen: true,
    businessHours: '매일 11:00-23:00',
    phone: '02-2345-6789',
  },
  place3: {
    id: 'place3',
    name: '액티브 짐',
    category: 'activity',
    lat: 37.565,
    lng: 126.975,
    address: '서울 강남구 선릉역 789',
    distance: 1.2,
    rating: 4.3,
    isOpen: false,
    businessHours: '평일 06:00-23:00, 주말 08:00-20:00',
  },
};

// Mock offers per place
const mockPlaceOffers: Record<string, Offer[]> = {
  place1: [
    {
      id: 'offer1',
      brandName: '카페 블루',
      brandLogo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100',
      title: '아메리카노 1+1',
      benefit: '모든 음료 20% 할인',
      conditions: ['평일 14:00-18:00', '1인 1회'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      distance: 0.3,
      isNew: true,
      status: 'new',
      places: [],
    },
  ],
  place2: [
    {
      id: 'offer2',
      brandName: '맥심 레스토랑',
      brandLogo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100',
      title: '런치세트 30% 할인',
      benefit: '메인 메뉴 30% 할인',
      conditions: ['평일 런치타임'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      status: 'normal',
      places: [],
    },
  ],
  place3: [],
};

export default function PassPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter[]>(mockFilters);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeOffers, setPlaceOffers] = useState<Offer[]>([]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    analytics.track('search_submit', { query });
  };

  const handleFilterToggle = (id: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
    analytics.track('filter_toggle', { id });
  };

  const handleFilterClear = () => {
    setFilters((prev) => prev.map((f) => ({ ...f, selected: false })));
  };

  const handleReelOpen = (reelId: string) => {
    // 스펙: 릴스 타일 클릭 → PlaceSheet 표시
    const reel = mockReels.find((r) => r.id === reelId);
    if (reel?.placeId) {
      const place = mockPlaces[reel.placeId];
      if (place) {
        openPlaceSheet(place);
        analytics.track({ name: 'reel_open', properties: { reel_id: reelId } });
        analytics.track({
          name: 'reel_place_open',
          properties: { reel_id: reelId, place_id: place.id },
        });
      }
    }
  };

  const handlePinTap = (placeId: string) => {
    // 스펙: 핀 클릭 → PlaceSheet 표시
    const place = mockPlaces[placeId];
    if (place) {
      openPlaceSheet(place);
      analytics.pinTap(placeId);
      analytics.track({
        name: 'place_sheet_open',
        properties: { place_id: placeId, stage: 'half' },
      });
    }
  };

  const openPlaceSheet = (place: Place) => {
    setSelectedPlace(place);
    setPlaceOffers(mockPlaceOffers[place.id] || []);
  };

  const handlePlaceSheetClose = () => {
    setSelectedPlace(null);
    setPlaceOffers([]);
  };

  const handleOfferSelect = (offerId: string) => {
    // 스펙: 오퍼 CTA 클릭 → 오퍼 상세 또는 수락 플로우
    console.log('[Pass] Offer selected:', offerId);
    analytics.track({ name: 'offer_view', properties: { offer_id: offerId } });
    
    // Navigate to offers tab with this offer pre-selected
    router.push(`/offers?highlight=${offerId}`);
    
    // Close sheet
    handlePlaceSheetClose();
  };

  const handleMyLocation = () => {
    console.log('Navigate to my location');
    analytics.track({ name: 'my_location_click' });
  };

  return (
    <div className="space-y-[var(--sp-6)]">
      {/* Search & Filters */}
      <div className="px-4 pt-4 space-y-[var(--sp-3)]">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
        />
        <FilterChips
          filters={filters}
          onToggle={handleFilterToggle}
          onClear={handleFilterClear}
        />
      </div>

      {/* LIVE Reels Carousel */}
      <ReelsCarousel items={mockReels} onOpen={handleReelOpen} />

      {/* Mini Map */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            주변 체험권
          </h2>
          <button
            onClick={() => router.push('/pass/map')}
            className="text-sm font-medium text-[var(--brand)] hover:underline"
          >
            전체 지도 보기
          </button>
        </div>
        <MiniMap
          pins={mockPins}
          onPinTap={handlePinTap}
          onMyLocation={handleMyLocation}
          className="h-[300px]"
        />
      </div>

      {/* Additional content sections can be added here */}

      {/* Place Sheet (스펙: 릴스/지도 → PlaceSheet → 오퍼 CTA) */}
      <PlaceSheet
        place={selectedPlace}
        offers={placeOffers}
        stage="half"
        onClose={handlePlaceSheetClose}
        onOfferSelect={handleOfferSelect}
      />
    </div>
  );
}
