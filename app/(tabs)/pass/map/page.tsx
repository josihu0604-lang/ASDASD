'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import MapView from '@/components/pass/MapView';
import PlaceSheet from '@/components/pass/PlaceSheet';
import { MapPin, Place, Offer } from '@/types';
import { analytics } from '@/lib/analytics';

// Mock data (same as pass page)
const mockPins: MapPin[] = [
  { id: 'place1', lat: 37.5665, lng: 126.978, category: 'cafe' },
  { id: 'place2', lat: 37.5675, lng: 126.98, category: 'bar', count: 3 },
  { id: 'place3', lat: 37.565, lng: 126.975, category: 'activity' },
  { id: 'place4', lat: 37.5668, lng: 126.982, category: 'cafe' },
  { id: 'place5', lat: 37.564, lng: 126.977, category: 'bar' },
];

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
  place4: {
    id: 'place4',
    name: '스타벅스 강남점',
    category: 'cafe',
    lat: 37.5668,
    lng: 126.982,
    address: '서울 강남구 테헤란로 456',
    distance: 0.5,
    rating: 4.6,
    isOpen: true,
    businessHours: '매일 07:00-23:00',
    phone: '02-3456-7890',
  },
  place5: {
    id: 'place5',
    name: '더 바 강남',
    category: 'bar',
    lat: 37.564,
    lng: 126.977,
    address: '서울 강남구 역삼동 321',
    distance: 0.9,
    rating: 4.8,
    isOpen: true,
    businessHours: '매일 18:00-02:00',
    phone: '02-4567-8901',
  },
};

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
  place4: [
    {
      id: 'offer4',
      brandName: '스타벅스',
      brandLogo: 'https://images.unsplash.com/photo-1553909489-ec2175ef3f52?w=100',
      title: '음료 무료 업그레이드',
      benefit: '모든 음료 Grande → Venti 무료',
      conditions: ['매일 사용 가능', '멤버십 필수'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-06-30'),
      status: 'normal',
      places: [],
    },
  ],
  place5: [
    {
      id: 'offer5',
      brandName: '더 바 강남',
      brandLogo: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100',
      title: '칵테일 2+1',
      benefit: '하우스 칵테일 구매 시 1잔 무료',
      conditions: ['매일 19:00-21:00', '해피아워'],
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isNew: true,
      status: 'new',
      places: [],
    },
  ],
};

export default function FullMapPage() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeOffers, setPlaceOffers] = useState<Offer[]>([]);

  const handlePinTap = (placeId: string) => {
    const place = mockPlaces[placeId];
    if (place) {
      setSelectedPlace(place);
      setPlaceOffers(mockPlaceOffers[placeId] || []);
      
      analytics.pinTap(placeId);
      analytics.track({
        name: 'place_sheet_open',
        properties: { place_id: placeId, stage: 'half', source: 'full_map' },
      });
    }
  };

  const handlePlaceSheetClose = () => {
    setSelectedPlace(null);
    setPlaceOffers([]);
  };

  const handleOfferSelect = (offerId: string) => {
    analytics.track({ name: 'offer_view', properties: { offer_id: offerId, source: 'full_map' } });
    router.push(`/offers?highlight=${offerId}`);
    handlePlaceSheetClose();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="relative h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-[var(--bg-base)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center min-h-[var(--touch-min)] min-w-[var(--touch-min)] -ml-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-[var(--radius-md)]"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={24} className="text-[var(--text-primary)]" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-[var(--text-primary)] pr-12">
            전체 지도
          </h1>
        </div>
      </header>

      {/* Map View (Full Screen) */}
      <MapView
        pins={mockPins}
        onPinTap={handlePinTap}
        className="h-full"
        defaultLat={parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '37.5665')}
        defaultLng={parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '126.978')}
        defaultZoom={parseFloat(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || '14')}
      />

      {/* Place Sheet */}
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
