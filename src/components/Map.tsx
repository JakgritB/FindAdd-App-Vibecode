'use client';

import { useEffect, useRef, useState } from 'react';
import { Location, Province, CurrentLocation } from '@/types';

declare global {
    interface Window {
        longdo: any;
    }
}

interface MapProps {
    locations: Location[];
    selectedProvince: Province | null;
    routePath?: any;
    currentLocation?: CurrentLocation | null;
    onMapReady?: (mapInstance: any) => void;
    showRouteLines?: boolean;
}

export default function Map({ locations, selectedProvince, routePath, currentLocation, onMapReady, showRouteLines }: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const routeLineRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const currentLocationMarkerRef = useRef<any>(null);
    const routeLinesRef = useRef<any[]>([]);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || isMapLoaded) return;

        const script = document.createElement('script');
        script.src = `https://api.longdo.com/map/?key=${process.env.NEXT_PUBLIC_LONGDO_API_KEY}`;
        script.async = true;

        script.onload = () => {
            if (window.longdo && mapContainer.current) {
                mapInstance.current = new window.longdo.Map({
                    placeholder: mapContainer.current,
                    zoom: selectedProvince ? 12 : 6,
                    location: {
                        lon: selectedProvince?.lon || 100.5018,
                        lat: selectedProvince?.lat || 13.7563
                    }
                });
                setIsMapLoaded(true);
                if (onMapReady) {
                    onMapReady(mapInstance.current);
                }
            }
        };

        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Update map center when province changes
    useEffect(() => {
        if (!mapInstance.current || !isMapLoaded) return;

        if (selectedProvince) {
            mapInstance.current.location({
                lon: selectedProvince.lon,
                lat: selectedProvince.lat
            }, true);
            mapInstance.current.zoom(12, true);
        } else {
            mapInstance.current.location({ lon: 100.5018, lat: 13.7563 }, true);
            mapInstance.current.zoom(6, true);
        }
    }, [selectedProvince, isMapLoaded]);

    // Update current location marker
    useEffect(() => {
        if (!mapInstance.current || !isMapLoaded) return;

        // Remove existing current location marker
        if (currentLocationMarkerRef.current) {
            mapInstance.current.Overlays.remove(currentLocationMarkerRef.current);
            currentLocationMarkerRef.current = null;
        }

        // Add current location marker
        if (currentLocation) {
            const marker = new window.longdo.Marker(
                { lon: currentLocation.lon, lat: currentLocation.lat },
                {
                    title: 'ตำแหน่งของคุณ',
                    detail: 'ตำแหน่งปัจจุบัน',
                    visibleRange: { min: 0, max: 20 },
                    icon: {
                        url: 'https://map.longdo.com/mmmap/images/pin_mark_blue.png',
                        offset: { x: 12, y: 45 }
                    }
                }
            );

            mapInstance.current.Overlays.add(marker);
            currentLocationMarkerRef.current = marker;
        }
    }, [currentLocation, isMapLoaded]);

    // Update markers
    useEffect(() => {
        if (!mapInstance.current || !isMapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            mapInstance.current.Overlays.remove(marker);
        });
        markersRef.current = [];

        // Add new markers
        locations.forEach((location, index) => {
            const marker = new window.longdo.Marker(
                { lon: location.lon, lat: location.lat },
                {
                    title: location.name || `สถานที่ ${index + 1}`,
                    detail: location.address || '',
                    label: location.order ? location.order.toString() : (index + 1).toString(),
                    visibleRange: { min: 0, max: 20 },
                    icon: {
                        url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
                        offset: { x: 12, y: 45 }
                    }
                }
            );

            mapInstance.current.Overlays.add(marker);
            markersRef.current.push(marker);
        });

        // Auto-fit bounds if there are markers
        if (locations.length > 0) {
            const bounds = locations.reduce(
                (acc, loc) => ({
                    minLat: Math.min(acc.minLat, loc.lat),
                    maxLat: Math.max(acc.maxLat, loc.lat),
                    minLon: Math.min(acc.minLon, loc.lon),
                    maxLon: Math.max(acc.maxLon, loc.lon)
                }),
                {
                    minLat: locations[0].lat,
                    maxLat: locations[0].lat,
                    minLon: locations[0].lon,
                    maxLon: locations[0].lon
                }
            );

            const centerLat = (bounds.minLat + bounds.maxLat) / 2;
            const centerLon = (bounds.minLon + bounds.maxLon) / 2;

            mapInstance.current.location({ lon: centerLon, lat: centerLat }, true);

            // Calculate appropriate zoom level
            const latDiff = bounds.maxLat - bounds.minLat;
            const lonDiff = bounds.maxLon - bounds.minLon;
            const maxDiff = Math.max(latDiff, lonDiff);

            let zoom = 15;
            if (maxDiff > 0.5) zoom = 10;
            else if (maxDiff > 0.2) zoom = 12;
            else if (maxDiff > 0.1) zoom = 13;
            else if (maxDiff > 0.05) zoom = 14;

            mapInstance.current.zoom(zoom, true);
        }
    }, [locations, isMapLoaded]);

    // Draw connecting lines between points
    useEffect(() => {
        if (!mapInstance.current || !isMapLoaded) return;

        // Clear existing lines
        routeLinesRef.current.forEach(line => {
            mapInstance.current.Overlays.remove(line);
        });
        routeLinesRef.current = [];

        // Draw new lines if showRouteLines is true and we have ordered locations
        if (showRouteLines && locations.length > 1) {
            // Sort locations by order if they have order property
            const sortedLocations = [...locations].sort((a, b) => {
                if (a.order && b.order) return a.order - b.order;
                return 0;
            });

            // Draw lines between consecutive points
            for (let i = 0; i < sortedLocations.length - 1; i++) {
                const line = new window.longdo.Polyline(
                    [
                        { lon: sortedLocations[i].lon, lat: sortedLocations[i].lat },
                        { lon: sortedLocations[i + 1].lon, lat: sortedLocations[i + 1].lat }
                    ],
                    {
                        lineWidth: 3,
                        lineColor: 'rgba(59, 130, 246, 0.6)', // Blue color with transparency
                        lineStyle: window.longdo.LineStyle.Dashed
                    }
                );
                mapInstance.current.Overlays.add(line);
                routeLinesRef.current.push(line);
            }
        }
    }, [locations, showRouteLines, isMapLoaded]);

    // Draw route
    useEffect(() => {
        if (!mapInstance.current || !isMapLoaded || !routePath) return;

        // Remove existing route
        if (routeLineRef.current) {
            mapInstance.current.Overlays.remove(routeLineRef.current);
        }

        // Draw new route
        if (routePath && routePath.length > 0) {
            const routeLine = new window.longdo.Polyline(
                routePath.map((point: any) => ({ lon: point.lon, lat: point.lat })),
                {
                    lineWidth: 4,
                    lineColor: 'rgba(0, 120, 255, 0.8)'
                }
            );
            mapInstance.current.Overlays.add(routeLine);
            routeLineRef.current = routeLine;
        }
    }, [routePath, isMapLoaded]);

    return (
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">กำลังโหลดแผนที่...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
