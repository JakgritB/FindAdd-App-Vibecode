export interface Location {
    lat: number;
    lon: number;
    id?: string;
    name?: string;
    address?: string;
    order?: number;
  }

  export interface CurrentLocation {
    lat: number;
    lon: number;
    accuracy?: number;
  }
  
  export interface SearchResult {
    id: string;
    name: string;
    lat: number;
    lon: number;
    address: string;
    type?: string;
  }
  
  export interface Province {
    code: string;
    name: string;
    nameEn: string;
    lat: number;
    lon: number;
  }