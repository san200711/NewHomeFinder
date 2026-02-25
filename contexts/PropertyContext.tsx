import { createContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyCategory, PropertyFilter } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PropertyContextType {
  properties: Property[];
  favorites: string[];
  isLoading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  filterProperties: (filter: PropertyFilter) => Property[];
  getOwnerProperties: (ownerId: string) => Property[];
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROPERTIES: '@newhomefinder_properties',
  FAVORITES: '@newhomefinder_favorites',
};

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propertiesData, favoritesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROPERTIES),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
      ]);

      if (propertiesData) {
        setProperties(JSON.parse(propertiesData));
      } else {
        // Initialize with sample data
        const sampleProperties = generateSampleProperties();
        setProperties(sampleProperties);
        await AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(sampleProperties));
      }

      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProperty: Property = {
      ...propertyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    await AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updatedProperties));
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const updatedProperties = properties.map((prop) =>
      prop.id === id ? { ...prop, ...updates, updatedAt: new Date().toISOString() } : prop
    );
    setProperties(updatedProperties);
    await AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updatedProperties));
  };

  const deleteProperty = async (id: string) => {
    const updatedProperties = properties.filter((prop) => prop.id !== id);
    setProperties(updatedProperties);
    await AsyncStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(updatedProperties));
  };

  const toggleFavorite = async (propertyId: string) => {
    const updatedFavorites = favorites.includes(propertyId)
      ? favorites.filter((id) => id !== propertyId)
      : [...favorites, propertyId];

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
  };

  const getPropertyById = (id: string) => {
    return properties.find((prop) => prop.id === id);
  };

  const filterProperties = (filter: PropertyFilter) => {
    return properties.filter((prop) => {
      if (filter.category && prop.category !== filter.category) return false;
      if (filter.minPrice !== undefined && prop.price < filter.minPrice) return false;
      if (filter.maxPrice !== undefined && prop.price > filter.maxPrice) return false;
      if (filter.location && !prop.location.toLowerCase().includes(filter.location.toLowerCase())) return false;
      if (filter.minSize !== undefined && prop.size < filter.minSize) return false;
      if (filter.maxSize !== undefined && prop.size > filter.maxSize) return false;
      if (filter.bedrooms && prop.bedrooms && prop.bedrooms < filter.bedrooms) return false;
      if (filter.bathrooms && prop.bathrooms && prop.bathrooms < filter.bathrooms) return false;
      return true;
    });
  };

  const getOwnerProperties = (ownerId: string) => {
    return properties.filter((prop) => prop.ownerId === ownerId);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        favorites,
        isLoading,
        addProperty,
        updateProperty,
        deleteProperty,
        toggleFavorite,
        getPropertyById,
        filterProperties,
        getOwnerProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

function generateSampleProperties(): Property[] {
  return [
    {
      id: '1',
      ownerId: 'owner1',
      ownerName: 'John Smith',
      ownerMobile: '+1234567890',
      category: 'home-rent',
      title: 'Modern 3BHK Apartment',
      description: 'Spacious apartment with modern amenities in prime location',
      price: 25000,
      location: 'Downtown',
      address: '123 Main Street, Downtown',
      size: 1500,
      sizeUnit: 'sqft',
      bedrooms: 3,
      bathrooms: 2,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: ['Parking', 'Gym', 'Swimming Pool'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      ownerId: 'owner2',
      ownerName: 'Sarah Johnson',
      ownerMobile: '+1234567891',
      category: 'home-buy',
      title: 'Luxury Villa with Garden',
      description: 'Beautiful villa with private garden and premium finishes',
      price: 8500000,
      location: 'Suburbs',
      address: '456 Oak Avenue, Green Valley',
      size: 3500,
      sizeUnit: 'sqft',
      bedrooms: 4,
      bathrooms: 3,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      amenities: ['Garden', 'Garage', 'Home Theater'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      ownerId: 'owner3',
      ownerName: 'Mike Wilson',
      ownerMobile: '+1234567892',
      category: 'land-buy',
      title: 'Prime Commercial Land',
      description: 'Corner plot suitable for commercial development',
      price: 12000000,
      location: 'City Center',
      address: 'Plot 789, Commercial Zone',
      size: 5000,
      sizeUnit: 'sqft',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
