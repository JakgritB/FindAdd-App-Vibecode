'use client';

import { useState, useEffect } from 'react';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import LocationList from '@/components/LocationList';
import ProvinceSelector from '@/components/ProvinceSelector';
import { Location, SearchResult, Province, CurrentLocation } from '@/types';

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [routePath, setRoutePath] = useState<any>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('ไม่สามารถระบุตำแหน่งได้ กรุณาเปิด GPS');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง');
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleAddLocation = (result: SearchResult) => {
    if (locations.length >= 100) {
      alert('จำกัดสูงสุด 100 สถานที่');
      return;
    }

    const newLocation: Location = {
      lat: result.lat,
      lon: result.lon,
      id: result.id,
      name: result.name,
      address: result.address
    };

    setLocations([...locations, newLocation]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
    setRoutePath(null);
  };

  const handleClearAll = () => {
    setLocations([]);
    setRoutePath(null);
  };

  const handleCalculateRoute = async () => {
    if (locations.length < 2) return;

    setIsCalculatingRoute(true);
    try {
      const response = await fetch('/api/longdo/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, currentLocation })
      });

      if (response.ok) {
        const data = await response.json();

        // Update locations with order
        if (data.orderedLocations) {
          const orderedWithNumbers = data.orderedLocations.map((loc: Location, index: number) => ({
            ...loc,
            order: index + 1
          }));
          setLocations(orderedWithNumbers);
        }

        // Set route path if available
        if (data.route?.data?.route) {
          setRoutePath(data.route.data.route);
        }
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('เกิดข้อผิดพลาดในการคำนวณเส้นทาง');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          FindAdd V1.0
          <br/>
          ระบบจัดเส้นทางส่งพัสดุ
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            <ProvinceSelector
              selectedProvince={selectedProvince}
              onProvinceChange={setSelectedProvince}
            />

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">ตำแหน่งปัจจุบัน</h4>
                  {currentLocation ? (
                    <p className="text-sm text-gray-600">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">ยังไม่ได้ระบุตำแหน่ง</p>
                  )}
                </div>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isGettingLocation ? 'กำลังระบุ...' : 'ระบุตำแหน่ง'}
                </button>
              </div>
            </div>

            <SearchBar
              selectedProvince={selectedProvince}
              onAddLocation={handleAddLocation}
            />

            <LocationList
              locations={locations}
              onRemoveLocation={handleRemoveLocation}
              onClearAll={handleClearAll}
              onCalculateRoute={handleCalculateRoute}
              isCalculatingRoute={isCalculatingRoute}
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-2 h-[600px] lg:h-[800px]">
            <Map
              locations={locations}
              selectedProvince={selectedProvince}
              routePath={routePath}
              currentLocation={currentLocation}
            />
          </div>

        </div>

        {/* Footer Credit */}
        <footer className="mt-8 py-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>
              พัฒนาโดย <span className="font-semibold text-gray-800">นายจักรกฤษณ์ บุตตพักตร์</span> |
              <a
                href="https://github.com/JakgritB"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:text-blue-700"
              >
                GitHub
              </a> |
            </p>
            <p className="mt-1 text-xs text-gray-500">
              © 2025 FindAdd V1.0 - ระบบจัดเส้นทางส่งพัสดุ
              <br/>
              Powered by Longdo Map API
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}