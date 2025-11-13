'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl';
import { MapPin as PinIcon, Navigation } from 'lucide-react';
import { MapPin } from '@/types';
import { createClusterIndex, getClusters, getClusterExpansionZoom, ClusterOrPoint } from '@/lib/map-clustering';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  pins: MapPin[];
  onPinTap: (placeId: string) => void;
  className?: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
}

export default function MapView({
  pins,
  onPinTap,
  className = '',
  defaultLat = 37.5665,
  defaultLng = 126.978,
  defaultZoom = 14,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewport, setViewport] = useState({
    latitude: defaultLat,
    longitude: defaultLng,
    zoom: defaultZoom,
  });
  const [clusters, setClusters] = useState<ClusterOrPoint[]>([]);
  const [clusterIndex, setClusterIndex] = useState<ReturnType<typeof createClusterIndex> | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Initialize cluster index when pins change
  useEffect(() => {
    if (pins.length > 0) {
      const index = createClusterIndex(pins);
      setClusterIndex(index);
    }
  }, [pins]);

  // Update clusters when viewport or index changes
  const updateClusters = useCallback(() => {
    if (!clusterIndex || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const zoom = map.getZoom();
    const newClusters = getClusters(clusterIndex, bbox, zoom);
    setClusters(newClusters);
  }, [clusterIndex]);

  useEffect(() => {
    updateClusters();
  }, [updateClusters, viewport]);

  const handleClusterClick = (clusterId: number, latitude: number, longitude: number) => {
    if (!clusterIndex || !mapRef.current) return;

    const expansionZoom = getClusterExpansionZoom(clusterIndex, clusterId);
    
    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: expansionZoom,
      duration: 500,
    });
  };

  const handlePinClick = (pinId: string) => {
    onPinTap(pinId);
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewport({
            latitude,
            longitude,
            zoom: 15,
          });
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1000,
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Fall back to default location
        }
      );
    }
  };

  if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border)] rounded-[var(--radius-lg)] ${className}`}
        style={{ minHeight: '400px' }}
      >
        <div className="text-center px-4">
          <p className="text-[var(--text-secondary)] mb-2">
            Mapbox 토큰이 설정되지 않았습니다
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            .env.local에 NEXT_PUBLIC_MAPBOX_TOKEN을 설정해주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        onMoveEnd={updateClusters}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        
        {/* Geolocate Control */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Render clusters and individual pins */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            // Render cluster
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
                onClick={() => handleClusterClick(cluster.id as number, latitude, longitude)}
              >
                <button
                  className="flex items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-[var(--elev-2)] transition-transform duration-[var(--dur-sm)] hover:scale-110 active:scale-95"
                  style={{
                    width: `${30 + (pointCount || 0) / pins.length * 20}px`,
                    height: `${30 + (pointCount || 0) / pins.length * 20}px`,
                  }}
                  aria-label={`${pointCount}개 장소 클러스터`}
                >
                  <span className="font-bold text-sm">
                    {pointCount}
                  </span>
                </button>
              </Marker>
            );
          }

          // Render individual pin
          const pinId = cluster.properties.pinId;
          if (!pinId) return null;

          return (
            <Marker
              key={`pin-${pinId}`}
              latitude={latitude}
              longitude={longitude}
              onClick={() => handlePinClick(pinId)}
            >
              <button
                className="animate-pin-pulse transition-transform duration-[var(--dur-sm)] hover:scale-110 active:scale-95"
                aria-label={`장소 ${pinId}`}
              >
                <PinIcon
                  size={32}
                  className="text-[var(--brand)] drop-shadow-lg"
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </button>
            </Marker>
          );
        })}
      </Map>

      {/* My Location FAB (Custom) */}
      <button
        onClick={handleMyLocation}
        className="absolute bottom-4 right-4 h-12 w-12 rounded-[var(--radius-full)] bg-[var(--bg-base)] shadow-[var(--elev-1)] flex items-center justify-center transition-transform duration-[var(--dur-md)] hover:scale-105 active:scale-95 z-10"
        aria-label="내 위치로 이동"
      >
        <Navigation
          size={20}
          className="text-[var(--brand)]"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
