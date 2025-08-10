'use client';

import { Province } from '@/types';
import { PROVINCES } from '@/lib/constants';

interface ProvinceSelectorProps {
  selectedProvince: Province | null;
  onProvinceChange: (province: Province | null) => void;
}

export default function ProvinceSelector({ 
  selectedProvince, 
  onProvinceChange 
}: ProvinceSelectorProps) {
  return (
    <div className="w-full">
      <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
        เลือกจังหวัด
      </label>
      <select
        id="province"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedProvince?.code || ''}
        onChange={(e) => {
          const province = PROVINCES.find(p => p.code === e.target.value);
          onProvinceChange(province || null);
        }}
      >
        <option value="">ทั้งประเทศ</option>
        {PROVINCES.map((province) => (
          <option key={province.code} value={province.code}>
            {province.name}
          </option>
        ))}
      </select>
    </div>
  );
}