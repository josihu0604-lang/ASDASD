import Supercluster, { ClusterFeature, PointFeature } from 'supercluster';
import { MapPin } from '@/types';

export interface ClusterPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    pinId: string;
    category: string;
    cluster?: boolean;
    point_count?: number;
  };
}

export type ClusterOrPoint = ClusterFeature<{ pinId?: string; category?: string }> | PointFeature<{ pinId: string; category: string }>;

/**
 * Convert MapPin to GeoJSON Point Feature
 */
export function pinToFeature(pin: MapPin): ClusterPoint {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [pin.lng, pin.lat],
    },
    properties: {
      pinId: pin.id,
      category: pin.category,
    },
  };
}

/**
 * Create and configure Supercluster instance
 */
export function createClusterIndex(pins: MapPin[]) {
  const index = new Supercluster({
    radius: 60, // Cluster radius in pixels
    maxZoom: 16, // Max zoom to cluster points on
    minZoom: 0,
    minPoints: 2, // Minimum points to form a cluster
  });

  const features = pins.map(pinToFeature);
  index.load(features);

  return index;
}

/**
 * Get clusters and points for current viewport
 */
export function getClusters(
  index: Supercluster,
  bounds: [number, number, number, number], // [west, south, east, north]
  zoom: number
): ClusterOrPoint[] {
  return index.getClusters(bounds, Math.floor(zoom));
}

/**
 * Get pins that belong to a cluster
 */
export function getClusterExpansionZoom(
  index: Supercluster,
  clusterId: number
): number {
  return index.getClusterExpansionZoom(clusterId);
}

/**
 * Get children of a cluster
 */
export function getClusterLeaves(
  index: Supercluster,
  clusterId: number,
  limit: number = 100
): PointFeature<{ pinId: string; category: string }>[] {
  return index.getLeaves(clusterId, limit) as PointFeature<{ pinId: string; category: string }>[];
}
