import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { locations, currentLocation } = body;

        if (!locations || locations.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 locations are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.LONGDO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Sort locations to find optimal route
        const sortedLocations = sortRouteOptimally(locations, currentLocation);

        // Build route request
        const params = new URLSearchParams({
            key: apiKey,
            type: 't', // Traffic-aware routing
            mode: '1', // Driving
            locale: 'th'
        });

        // Add start point
        params.append('s', `${sortedLocations[0].lat},${sortedLocations[0].lon}`);

        // Add waypoints
        for (let i = 1; i < sortedLocations.length - 1; i++) {
            params.append('wp', `${sortedLocations[i].lat},${sortedLocations[i].lon}`);
        }

        // Add destination
        params.append('d', `${sortedLocations[sortedLocations.length - 1].lat},${sortedLocations[sortedLocations.length - 1].lon}`);

        const response = await fetch(
            `https://api.longdo.com/RouteService/json/route?${params.toString()}`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch route from Longdo API');
        }

        const data = await response.json();

        return NextResponse.json({
            route: data,
            orderedLocations: sortedLocations
        });
    } catch (error) {
        console.error('Route API error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate route' },
            { status: 500 }
        );
    }
}

// Simple TSP approximation using nearest neighbor
function sortRouteOptimally(locations: any[], startPoint?: any) {
    if (locations.length <= 1) return locations;

    const visited = new Set<number>();
    const sorted = [];

    // ถ้ามีตำแหน่งเริ่มต้น ให้เริ่มจากตำแหน่งที่ใกล้ที่สุด
    let current = 0;
    if (startPoint) {
        let minDistance = Infinity;
        for (let i = 0; i < locations.length; i++) {
            const distance = calculateDistance(
                startPoint.lat,
                startPoint.lon,
                locations[i].lat,
                locations[i].lon
            );
            if (distance < minDistance) {
                minDistance = distance;
                current = i;
            }
        }
    }

    sorted.push(locations[current]);
    visited.add(current);

    // วนหาจุดที่ใกล้ที่สุดต่อไป
    while (visited.size < locations.length) {
        let nearest = -1;
        let minDistance = Infinity;

        for (let i = 0; i < locations.length; i++) {
            if (!visited.has(i)) {
                const distance = calculateDistance(
                    locations[current].lat,
                    locations[current].lon,
                    locations[i].lat,
                    locations[i].lon
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = i;
                }
            }
        }

        if (nearest !== -1) {
            current = nearest;
            sorted.push(locations[current]);
            visited.add(current);
        }
    }

    return sorted;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}