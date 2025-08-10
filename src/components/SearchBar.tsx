'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchResult, Province } from '@/types';

interface SearchBarProps {
  selectedProvince: Province | null;
  onAddLocation: (location: SearchResult) => void;
}

export default function SearchBar({ selectedProvince, onAddLocation }: SearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (keyword.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ keyword });
        if (selectedProvince) {
          params.append('area', selectedProvince.code);
        }

        const response = await fetch(`/api/longdo/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const formattedResults: SearchResult[] = data.data?.map((item: any) => ({
            id: item.id || `${item.lat}-${item.lon}`,
            name: item.name || item.w || 'ไม่ระบุชื่อ',
            lat: item.lat,
            lon: item.lon,
            address: item.address || item.subPoi || item.poi || ''
          })) || [];
          setSuggestions(formattedResults);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, selectedProvince]);

  const handleSelectSuggestion = (suggestion: SearchResult) => {
    onAddLocation(suggestion);
    setKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="ค้นหาสถานที่ หรือใส่บ้านเลขที่..."
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="font-medium text-gray-900">{suggestion.name}</div>
              {suggestion.address && (
                <div className="text-sm text-gray-600 mt-1">{suggestion.address}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}