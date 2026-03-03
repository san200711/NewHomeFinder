export type UserRole = 'finder' | 'owner';

export interface User {
  id: string;
  mobile: string;
  role: UserRole;
  name: string;
  email?: string;
  createdAt: string;
}

export type PropertyCategory = 'home-rent' | 'home-buy' | 'home-sell' | 'land-buy' | 'land-sell';

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerMobile: string;
  category: PropertyCategory;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  coordinates?: PropertyCoordinates; // Optional for backward compatibility
  size: number;
  sizeUnit: 'sqft' | 'sqm' | 'acre' | 'cent';
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  status: 'active' | 'pending' | 'sold' | 'rented';
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface PropertyFilter {
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minSize?: number;
  maxSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  nearLocation?: PropertyCoordinates;
  radiusKm?: number;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  finderId: string;
  finderName: string;
  finderMobile: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  unhelpfulCount: number;
  helpfulVotes: string[]; // User IDs who voted helpful
  unhelpfulVotes: string[]; // User IDs who voted unhelpful
}

export interface PropertyStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
