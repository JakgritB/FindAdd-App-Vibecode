'use client';

import { Location } from '@/types';

interface LocationListProps {
  locations: Location[];
  onRemoveLocation: (index: number) => void;
  onClearAll: () => void;
  onCalculateRoute: () => void;
  isCalculatingRoute: boolean;
}

export default function LocationList({
  locations,
  onRemoveLocation,
  onClearAll,
  onCalculateRoute,
  isCalculatingRoute
}: LocationListProps) {
  const handleNavigate = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          รายการสถานที่ ({locations.length}/100)
        </h3>
        {locations.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            ลบทั้งหมด
          </button>
        )}
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ยังไม่มีสถานที่ที่เลือก
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
            {locations.map((location, index) => (
              <div
                key={`${location.lat}-${location.lon}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {location.order && (
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                        {location.order}
                      </span>
                    )}
                    <div>
                      <div className="font-medium">{location.name || `สถานที่ ${index + 1}`}</div>
                      {location.address && (
                        <div className="text-sm text-gray-600">{location.address}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNavigate(location)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    title="นำทางด้วย Google Maps"
                  >
                    นำทาง
                  </button>
                  <button
                    onClick={() => onRemoveLocation(index)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {locations.length >= 2 && (
            <button
              onClick={onCalculateRoute}
              disabled={isCalculatingRoute}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCalculatingRoute ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังคำนวณเส้นทาง...
                </span>
              ) : (
                'คำนวณเส้นทางที่ดีที่สุด'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}