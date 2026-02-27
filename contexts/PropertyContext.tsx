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
  const ownerNames = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'David Brown', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Lee', 'William Martinez', 'Mary Garcia'];
  const locations = ['Downtown', 'Green Valley', 'Riverside', 'Hillside', 'Lakeside', 'Oakwood', 'Maple Street', 'Pine Hills', 'Cedar Park', 'Elm Avenue'];
  
  const properties: Property[] = [];
  let idCounter = 1;

  // 50 Homes for Rent
  const rentalHomes = [
    { title: 'Modern 3BHK Apartment', desc: 'Spacious apartment with modern amenities, hardwood floors, and central heating. Located in prime residential area with easy access to public transport.', beds: 3, baths: 2, size: 1500, price: 25000, amenities: ['Parking', 'Gym', 'Swimming Pool', '24/7 Security'], img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' },
    { title: 'Luxury 2BHK Penthouse', desc: 'Premium penthouse with stunning city views, designer interiors, and private terrace. Perfect for professionals seeking upscale living.', beds: 2, baths: 2, size: 1800, price: 45000, amenities: ['Terrace', 'Lift', 'Power Backup', 'Clubhouse'], img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
    { title: 'Cozy 1BHK Studio', desc: 'Compact yet comfortable studio apartment ideal for singles or couples. Fully furnished with modern appliances and high-speed internet.', beds: 1, baths: 1, size: 650, price: 15000, amenities: ['Furnished', 'WiFi', 'Parking'], img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
    { title: 'Spacious 4BHK Family Home', desc: 'Large family home with separate dining area, modular kitchen, and ample storage. Surrounded by parks and schools.', beds: 4, baths: 3, size: 2200, price: 38000, amenities: ['Garden', 'Parking', 'Park View', 'Gated Community'], img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { title: 'Contemporary 2BHK Flat', desc: 'Well-ventilated apartment with contemporary design, modular kitchen, and premium fittings. Located in a vibrant neighborhood.', beds: 2, baths: 2, size: 1100, price: 22000, amenities: ['Lift', 'Water Supply', 'Security', 'Visitor Parking'], img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800' },
    { title: 'Elegant 3BHK Duplex', desc: 'Duplex apartment with high ceilings, large windows, and elegant interiors. Features separate living and dining areas.', beds: 3, baths: 2, size: 1900, price: 35000, amenities: ['Duplex', 'Balcony', 'Gym', 'Play Area'], img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    { title: 'Budget 1BHK Apartment', desc: 'Affordable apartment in a well-maintained building with basic amenities. Great for first-time renters.', beds: 1, baths: 1, size: 550, price: 12000, amenities: ['Water Supply', 'Security'], img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800' },
    { title: 'Premium 3BHK with Pool', desc: 'High-end apartment in a luxury complex with swimming pool, gym, and landscaped gardens. Includes premium fixtures throughout.', beds: 3, baths: 3, size: 2000, price: 50000, amenities: ['Swimming Pool', 'Gym', 'Garden', 'Clubhouse', 'Sauna'], img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
    { title: 'Bright 2BHK Corner Unit', desc: 'Corner apartment with excellent natural lighting, cross ventilation, and city views. Freshly painted and ready to move in.', beds: 2, baths: 2, size: 1250, price: 28000, amenities: ['Corner Unit', 'Balcony', 'Parking', 'Lift'], img: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800' },
    { title: 'Charming 1BHK Cottage', desc: 'Quaint cottage-style apartment with vintage charm and modern conveniences. Private entrance and small garden space.', beds: 1, baths: 1, size: 750, price: 18000, amenities: ['Garden', 'Parking', 'Pet Friendly'], img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    { title: 'Executive 4BHK Suite', desc: 'Executive suite with separate study room, walk-in closets, and premium bathrooms. Located in prestigious neighborhood.', beds: 4, baths: 4, size: 2800, price: 65000, amenities: ['Study Room', 'Walk-in Closet', 'Servant Room', 'Power Backup'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Modern 2BHK Loft', desc: 'Industrial-style loft with exposed brick, high ceilings, and open floor plan. Perfect for creative professionals.', beds: 2, baths: 1, size: 1400, price: 32000, amenities: ['High Ceiling', 'Open Plan', 'Parking'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Family 3BHK with Balcony', desc: 'Family-friendly apartment with spacious balconies, separate utility area, and children play area in complex.', beds: 3, baths: 2, size: 1600, price: 29000, amenities: ['Balcony', 'Play Area', 'Parking', 'Security'], img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    { title: 'Compact 1BHK Downtown', desc: 'Perfect city apartment near shopping, dining, and entertainment. Walk to metro station and business district.', beds: 1, baths: 1, size: 600, price: 20000, amenities: ['Metro Access', 'Shopping Nearby', 'Parking'], img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
    { title: 'Renovated 3BHK Classic', desc: 'Beautifully renovated classic apartment with hardwood floors, crown molding, and updated kitchen.', beds: 3, baths: 2, size: 1700, price: 33000, amenities: ['Renovated', 'Hardwood Floors', 'Updated Kitchen'], img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' },
    { title: 'Peaceful 2BHK Garden View', desc: 'Serene apartment overlooking community gardens with peaceful surroundings. Ideal for nature lovers.', beds: 2, baths: 2, size: 1300, price: 26000, amenities: ['Garden View', 'Peaceful', 'Parking', 'Security'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Stylish 1BHK Designer', desc: 'Designer apartment with contemporary furnishings, smart home features, and premium appliances included.', beds: 1, baths: 1, size: 800, price: 24000, amenities: ['Furnished', 'Smart Home', 'Premium Appliances'], img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800' },
    { title: 'Grand 4BHK Residence', desc: 'Luxurious residence with grand living spaces, formal dining room, and multiple balconies with panoramic views.', beds: 4, baths: 3, size: 3000, price: 70000, amenities: ['Panoramic View', 'Multiple Balconies', 'Formal Dining', 'Gym'], img: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800' },
    { title: 'Efficient 2BHK Smart Home', desc: 'Energy-efficient smart home with automated lighting, climate control, and security systems.', beds: 2, baths: 2, size: 1200, price: 30000, amenities: ['Smart Home', 'Energy Efficient', 'Security System'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Artistic 3BHK Loft Space', desc: 'Unique loft space with artist studio, large windows, and creative layouts. Perfect for artists and designers.', beds: 3, baths: 2, size: 1850, price: 36000, amenities: ['Studio Space', 'High Ceiling', 'Natural Light'], img: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800' },
    { title: 'Affordable 1BHK Starter', desc: 'Perfect starter home with essential amenities, well-maintained building, and friendly neighborhood.', beds: 1, baths: 1, size: 580, price: 13000, amenities: ['Affordable', 'Well Maintained', 'Friendly Area'], img: 'https://images.unsplash.com/photo-1600566752734-cd29f7c1f86a?w=800' },
    { title: 'Deluxe 3BHK Premium', desc: 'Premium apartment with Italian marble flooring, designer bathrooms, and modular kitchen with branded appliances.', beds: 3, baths: 3, size: 2100, price: 48000, amenities: ['Marble Flooring', 'Designer Bathrooms', 'Branded Kitchen'], img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    { title: 'Sunny 2BHK East Facing', desc: 'Bright and airy east-facing apartment with morning sunlight, good ventilation, and pleasant views.', beds: 2, baths: 2, size: 1150, price: 23000, amenities: ['East Facing', 'Good Ventilation', 'Balcony'], img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
    { title: 'Minimalist 1BHK Modern', desc: 'Minimalist design with clean lines, neutral colors, and efficient space utilization. Perfect for modern living.', beds: 1, baths: 1, size: 700, price: 19000, amenities: ['Modern Design', 'Efficient Layout', 'Parking'], img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' },
    { title: 'Spacious 4BHK Corner', desc: 'Corner unit with extra space, multiple balconies, and panoramic views from three sides.', beds: 4, baths: 3, size: 2500, price: 55000, amenities: ['Corner Unit', 'Multiple Balconies', 'Panoramic Views'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Classic 2BHK Heritage', desc: 'Heritage building apartment with period features, high ceilings, and modern renovations maintaining character.', beds: 2, baths: 2, size: 1400, price: 31000, amenities: ['Heritage Building', 'High Ceilings', 'Period Features'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Urban 3BHK Central', desc: 'Centrally located urban apartment near business districts, shopping centers, and major transport hubs.', beds: 3, baths: 2, size: 1650, price: 34000, amenities: ['Central Location', 'Transport Access', 'Shopping Nearby'], img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800' },
    { title: 'Secure 1BHK Gated', desc: 'Safe and secure apartment in gated community with 24/7 security, CCTV surveillance, and controlled access.', beds: 1, baths: 1, size: 650, price: 17000, amenities: ['24/7 Security', 'CCTV', 'Gated Community'], img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
    { title: 'Lavish 4BHK Luxury', desc: 'Ultra-luxury apartment with imported fixtures, home automation, and concierge services. Resort-style living.', beds: 4, baths: 4, size: 3200, price: 85000, amenities: ['Home Automation', 'Concierge', 'Resort Style', 'Imported Fixtures'], img: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800' },
    { title: 'Fresh 2BHK New Build', desc: 'Brand new apartment in newly constructed building with modern amenities and warranty on all fittings.', beds: 2, baths: 2, size: 1180, price: 27000, amenities: ['Brand New', 'Modern Building', 'Warranty'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Vintage 3BHK Character', desc: 'Charming vintage apartment with original features, renovated kitchen and bathrooms, and character throughout.', beds: 3, baths: 2, size: 1750, price: 32000, amenities: ['Vintage Charm', 'Renovated', 'Character Features'], img: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800' },
    { title: 'Smart 1BHK Tech', desc: 'Tech-enabled apartment with smart locks, voice control, and integrated home systems for modern lifestyle.', beds: 1, baths: 1, size: 720, price: 21000, amenities: ['Smart Technology', 'Voice Control', 'Automated'], img: 'https://images.unsplash.com/photo-1600566752734-cd29f7c1f86a?w=800' },
    { title: 'Expansive 4BHK Terrace', desc: 'Massive apartment with private terrace, outdoor kitchen, and entertainment area. Perfect for hosting.', beds: 4, baths: 3, size: 2900, price: 68000, amenities: ['Private Terrace', 'Outdoor Kitchen', 'Entertainment Area'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Practical 2BHK Family', desc: 'Practical family apartment with good storage, separate laundry area, and kid-friendly complex.', beds: 2, baths: 2, size: 1220, price: 24000, amenities: ['Good Storage', 'Laundry Area', 'Kid Friendly'], img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
    { title: 'Boutique 3BHK Designer', desc: 'Designer apartment in boutique building with limited units, personalized service, and exclusive amenities.', beds: 3, baths: 2, size: 1800, price: 42000, amenities: ['Boutique Building', 'Designer Interiors', 'Exclusive'], img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    { title: 'Green 1BHK Eco', desc: 'Eco-friendly apartment with rainwater harvesting, solar panels, and sustainable materials. Green living.', beds: 1, baths: 1, size: 680, price: 16000, amenities: ['Eco Friendly', 'Solar Power', 'Rainwater Harvesting'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Royal 4BHK Palace', desc: 'Palace-style apartment with ornate details, chandeliers, and regal interiors. Living like royalty.', beds: 4, baths: 4, size: 3500, price: 95000, amenities: ['Palace Style', 'Ornate Details', 'Luxury Finishes'], img: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800' },
    { title: 'Versatile 2BHK Flex', desc: 'Flexible layout apartment that can be configured as office space or additional bedroom. Multipurpose living.', beds: 2, baths: 2, size: 1280, price: 29000, amenities: ['Flexible Layout', 'Multipurpose', 'Home Office Ready'], img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800' },
    { title: 'Traditional 3BHK Classic', desc: 'Traditional style apartment with wooden furniture, ethnic decor, and cultural aesthetics.', beds: 3, baths: 2, size: 1680, price: 30000, amenities: ['Traditional Style', 'Wooden Interiors', 'Cultural'], img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' },
    { title: 'Tranquil 1BHK Quiet', desc: 'Peaceful apartment away from main road, soundproof windows, and serene environment for quiet living.', beds: 1, baths: 1, size: 620, price: 14000, amenities: ['Quiet Location', 'Soundproof', 'Peaceful'], img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
    { title: 'Magnificent 4BHK View', desc: 'Spectacular apartment on high floor with breathtaking city views, floor-to-ceiling windows throughout.', beds: 4, baths: 3, size: 2750, price: 72000, amenities: ['City Views', 'High Floor', 'Floor to Ceiling Windows'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Convenient 2BHK Access', desc: 'Highly accessible apartment near metro, schools, hospitals, and supermarkets. Ultimate convenience.', beds: 2, baths: 2, size: 1160, price: 25000, amenities: ['Metro Nearby', 'Schools Close', 'Hospital Access'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Premium 3BHK Skyline', desc: 'Premium apartment with skyline views, imported fittings, and membership to exclusive club.', beds: 3, baths: 3, size: 2050, price: 52000, amenities: ['Skyline Views', 'Imported Fittings', 'Club Membership'], img: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800' },
    { title: 'Homely 1BHK Comfort', desc: 'Comfortable and homely apartment with warm interiors, good neighborhood, and community feel.', beds: 1, baths: 1, size: 670, price: 15500, amenities: ['Homely', 'Good Neighborhood', 'Community'], img: 'https://images.unsplash.com/photo-1600566752734-cd29f7c1f86a?w=800' },
    { title: 'Elite 4BHK Prestige', desc: 'Prestigious address with elite living, valet parking, and access to premium lifestyle amenities.', beds: 4, baths: 4, size: 3100, price: 88000, amenities: ['Prestige Address', 'Valet Parking', 'Premium Lifestyle'], img: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800' },
    { title: 'Zen 2BHK Peaceful', desc: 'Zen-inspired apartment with minimalist design, meditation room, and calming aesthetics.', beds: 2, baths: 2, size: 1190, price: 26500, amenities: ['Zen Design', 'Meditation Room', 'Calming'], img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800' },
    { title: 'Charming 3BHK Warm', desc: 'Warm and inviting apartment with fireplace, wooden accents, and cozy ambiance throughout.', beds: 3, baths: 2, size: 1720, price: 33500, amenities: ['Fireplace', 'Wooden Accents', 'Cozy'], img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    { title: 'Dynamic 1BHK Youth', desc: 'Dynamic apartment perfect for young professionals with co-working space and social areas in building.', beds: 1, baths: 1, size: 710, price: 18500, amenities: ['Co-working Space', 'Social Areas', 'Youth Oriented'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Majestic 4BHK Grand', desc: 'Grand and majestic apartment with double-height living room, spiral staircase, and opulent finishes.', beds: 4, baths: 4, size: 3400, price: 92000, amenities: ['Double Height', 'Spiral Staircase', 'Opulent'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Refined 2BHK Elegant', desc: 'Refined and elegant apartment with sophisticated decor, quality finishes, and attention to detail.', beds: 2, baths: 2, size: 1240, price: 28500, amenities: ['Sophisticated', 'Quality Finishes', 'Elegant'], img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800' },
    { title: 'Blissful 3BHK Happy', desc: 'Happy home with positive vibes, lots of natural light, and cheerful interiors. Perfect family nest.', beds: 3, baths: 2, size: 1780, price: 35500, amenities: ['Natural Light', 'Positive Vibes', 'Family Friendly'], img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' }
  ];

  rentalHomes.forEach((home, index) => {
    properties.push({
      id: String(idCounter++),
      ownerId: `owner${Math.floor(Math.random() * 10) + 1}`,
      ownerName: ownerNames[Math.floor(Math.random() * ownerNames.length)],
      ownerMobile: `+91${9000000000 + Math.floor(Math.random() * 100000000)}`,
      category: 'home-rent',
      title: home.title,
      description: home.desc,
      price: home.price,
      location: locations[Math.floor(Math.random() * locations.length)],
      address: `${100 + index} ${locations[Math.floor(Math.random() * locations.length)]} Street`,
      size: home.size,
      sizeUnit: 'sqft',
      bedrooms: home.beds,
      bathrooms: home.baths,
      images: [home.img, 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800', 'https://images.unsplash.com/photo-1600566752229-250ed79470e6?w=800'],
      amenities: home.amenities,
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // 20 Homes for Sale
  const saleHomes = [
    { title: 'Luxury Villa with Pool', desc: 'Stunning luxury villa with private swimming pool, landscaped gardens, and premium imported fittings. Features include home theater, wine cellar, and smart home automation.', beds: 5, baths: 4, size: 4500, price: 12500000, amenities: ['Swimming Pool', 'Garden', 'Home Theater', 'Wine Cellar', 'Smart Home'], img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
    { title: 'Modern 3BHK Independent', desc: 'Contemporary independent house with open floor plan, Italian marble flooring, and designer modular kitchen. Located in premium gated community.', beds: 3, baths: 3, size: 2500, price: 8500000, amenities: ['Independent House', 'Marble Flooring', 'Gated Community', 'Parking'], img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    { title: 'Penthouse with Terrace', desc: 'Exclusive penthouse with 360-degree views, private terrace garden, and luxury amenities. Features imported fixtures and designer interiors.', beds: 4, baths: 4, size: 3800, price: 15000000, amenities: ['Terrace Garden', 'Penthouse', 'Imported Fixtures', '360 Views'], img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { title: 'Duplex Villa Premium', desc: 'Premium duplex villa with separate floors for living and bedrooms. Includes private gym, home office, and entertainment area.', beds: 4, baths: 3, size: 3200, price: 9800000, amenities: ['Duplex', 'Private Gym', 'Home Office', 'Entertainment Area'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Colonial Style Bungalow', desc: 'Charming colonial-style bungalow with high ceilings, vintage architecture, and modern renovations. Set in half-acre plot with mature gardens.', beds: 4, baths: 3, size: 3500, price: 11000000, amenities: ['Colonial Style', 'Large Plot', 'Mature Gardens', 'Heritage'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Contemporary 2BHK Condo', desc: 'Sleek contemporary condo with floor-to-ceiling windows, premium appliances, and resort-style amenities in building.', beds: 2, baths: 2, size: 1400, price: 5500000, amenities: ['Floor to Ceiling Windows', 'Premium Appliances', 'Resort Amenities'], img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
    { title: 'Farmhouse Style Villa', desc: 'Rustic farmhouse villa with exposed beams, stone features, and modern comforts. Includes vegetable garden and outdoor living spaces.', beds: 3, baths: 2, size: 2800, price: 7200000, amenities: ['Farmhouse Style', 'Vegetable Garden', 'Outdoor Living', 'Stone Features'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Beachfront Property', desc: 'Rare beachfront property with direct beach access, ocean views from every room, and outdoor deck for entertaining.', beds: 4, baths: 3, size: 3000, price: 18000000, amenities: ['Beachfront', 'Ocean Views', 'Direct Beach Access', 'Outdoor Deck'], img: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800' },
    { title: 'Smart Home Paradise', desc: 'Fully automated smart home with voice control, security systems, energy management, and integrated entertainment systems.', beds: 3, baths: 3, size: 2600, price: 9500000, amenities: ['Full Automation', 'Voice Control', 'Security Systems', 'Energy Management'], img: 'https://images.unsplash.com/photo-1600566752229-250ed79470e6?w=800' },
    { title: 'Eco Villa Sustainable', desc: 'Award-winning eco villa with solar panels, rainwater harvesting, organic gardens, and sustainable materials throughout.', beds: 3, baths: 2, size: 2400, price: 6800000, amenities: ['Solar Powered', 'Rainwater Harvesting', 'Organic Garden', 'Sustainable'], img: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800' },
    { title: 'Mountain View Retreat', desc: 'Serene mountain view retreat with panoramic vistas, multiple balconies, and peaceful surroundings. Perfect weekend home.', beds: 3, baths: 2, size: 2200, price: 7500000, amenities: ['Mountain Views', 'Multiple Balconies', 'Peaceful', 'Weekend Home'], img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800' },
    { title: 'Mediterranean Villa', desc: 'Mediterranean-inspired villa with arched doorways, terracotta tiles, courtyard, and fountain. Luxury meets old-world charm.', beds: 5, baths: 4, size: 4200, price: 14500000, amenities: ['Mediterranean Style', 'Courtyard', 'Fountain', 'Terracotta Tiles'], img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
    { title: 'Urban Loft Conversion', desc: 'Converted industrial loft with exposed brick, metal beams, and modern amenities. Unique urban living space.', beds: 2, baths: 2, size: 1800, price: 6200000, amenities: ['Loft Style', 'Exposed Brick', 'Industrial', 'Unique'], img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    { title: 'Golf Course Villa', desc: 'Prestigious villa overlooking championship golf course with club membership included. Luxury lifestyle living.', beds: 4, baths: 4, size: 3600, price: 16000000, amenities: ['Golf Course View', 'Club Membership', 'Prestigious', 'Luxury'], img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
    { title: 'Japanese Zen House', desc: 'Zen-inspired house with minimalist design, meditation garden, koi pond, and natural materials. Inner peace guaranteed.', beds: 3, baths: 2, size: 2300, price: 8200000, amenities: ['Zen Design', 'Meditation Garden', 'Koi Pond', 'Minimalist'], img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
    { title: 'Artist Studio Home', desc: 'Creative home with dedicated artist studio, gallery space, and inspiring interiors. Perfect for creative professionals.', beds: 2, baths: 2, size: 2000, price: 5800000, amenities: ['Artist Studio', 'Gallery Space', 'Creative', 'Natural Light'], img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
    { title: 'Riverside Mansion', desc: 'Grand riverside mansion with private boat dock, riverside views, and sprawling grounds. Ultimate luxury estate.', beds: 6, baths: 5, size: 5500, price: 22000000, amenities: ['Riverside', 'Boat Dock', 'Mansion', 'Sprawling Grounds'], img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
    { title: 'Modern Cube House', desc: 'Architectural marvel with cubic design, glass walls, and innovative use of space. Modern art piece to live in.', beds: 3, baths: 3, size: 2700, price: 10500000, amenities: ['Architectural', 'Glass Walls', 'Modern Design', 'Innovative'], img: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800' },
    { title: 'Heritage Haveli Restored', desc: 'Beautifully restored heritage haveli with traditional architecture, modern amenities, and historical significance.', beds: 5, baths: 4, size: 4000, price: 13500000, amenities: ['Heritage', 'Restored', 'Traditional', 'Historical'], img: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800' },
    { title: 'Sky Villa Penthouse', desc: 'Ultimate sky villa penthouse on top floor with infinity pool, helipad access, and unmatched luxury living.', beds: 4, baths: 4, size: 4800, price: 25000000, amenities: ['Infinity Pool', 'Helipad', 'Top Floor', 'Ultimate Luxury'], img: 'https://images.unsplash.com/photo-1600566752229-250ed79470e6?w=800' }
  ];

  saleHomes.forEach((home, index) => {
    properties.push({
      id: String(idCounter++),
      ownerId: `owner${Math.floor(Math.random() * 10) + 1}`,
      ownerName: ownerNames[Math.floor(Math.random() * ownerNames.length)],
      ownerMobile: `+91${9000000000 + Math.floor(Math.random() * 100000000)}`,
      category: 'home-buy',
      title: home.title,
      description: home.desc,
      price: home.price,
      location: locations[Math.floor(Math.random() * locations.length)],
      address: `${200 + index} ${locations[Math.floor(Math.random() * locations.length)]} Avenue`,
      size: home.size,
      sizeUnit: 'sqft',
      bedrooms: home.beds,
      bathrooms: home.baths,
      images: [home.img, 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800', 'https://images.unsplash.com/photo-1600566752229-250ed79470e6?w=800', 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800'],
      amenities: home.amenities,
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // 10 Land Properties
  const landProperties = [
    { title: 'Prime Commercial Plot', desc: 'Premium commercial plot in high-traffic business district with excellent road connectivity. Perfect for retail, office complex, or mixed-use development. Clear title and ready for construction.', size: 5000, price: 15000000, amenities: ['Commercial Zone', 'High Traffic', 'Road Connectivity', 'Clear Title'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Residential Development Land', desc: 'Large residential land parcel approved for housing development. All utilities available, flat terrain, and surrounded by developing neighborhoods.', size: 12000, price: 25000000, amenities: ['Residential Approved', 'Utilities Available', 'Flat Terrain', 'Development Ready'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Agricultural Farmland', desc: 'Fertile agricultural land with water source, ideal for organic farming or agribusiness. Includes existing fruit orchards and irrigation system.', size: 25000, price: 8000000, amenities: ['Agricultural', 'Water Source', 'Fruit Orchards', 'Irrigation'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Industrial Zone Plot', desc: 'Strategic industrial plot in designated industrial area with heavy vehicle access, power supply, and proximity to highway.', size: 8000, price: 18000000, amenities: ['Industrial Zone', 'Heavy Access', 'Power Supply', 'Highway Proximity'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Hilltop View Land', desc: 'Scenic hilltop land with panoramic valley views. Perfect for luxury resort, boutique hotel, or exclusive residential development.', size: 15000, price: 12000000, amenities: ['Hilltop', 'Panoramic Views', 'Scenic', 'Development Potential'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Waterfront Beach Land', desc: 'Rare beachfront land with direct beach access and ocean views. Ideal for resort development or luxury beach villas.', size: 10000, price: 35000000, amenities: ['Beachfront', 'Ocean Views', 'Direct Access', 'Tourism Zone'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Corner Plot Residential', desc: 'Premium corner residential plot in established neighborhood with all amenities. Ready to build your dream home.', size: 3000, price: 6500000, amenities: ['Corner Plot', 'Established Area', 'All Amenities', 'Residential'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'IT Park Development Land', desc: 'Large tract approved for IT park development in tech corridor. Excellent infrastructure and connectivity to major IT hubs.', size: 20000, price: 45000000, amenities: ['IT Park Approved', 'Tech Corridor', 'Infrastructure Ready', 'Connectivity'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Gated Community Plot', desc: 'Exclusive plot within gated villa community with club house, security, and landscaped common areas. Build your custom home.', size: 4500, price: 9800000, amenities: ['Gated Community', 'Club House', 'Security', 'Landscaped'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' },
    { title: 'Forest View Retreat Land', desc: 'Serene land parcel adjacent to forest reserve with nature views. Perfect for eco-resort or wellness retreat development.', size: 18000, price: 14500000, amenities: ['Forest Adjacent', 'Nature Views', 'Eco Tourism', 'Serene'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800' }
  ];

  landProperties.forEach((land, index) => {
    properties.push({
      id: String(idCounter++),
      ownerId: `owner${Math.floor(Math.random() * 10) + 1}`,
      ownerName: ownerNames[Math.floor(Math.random() * ownerNames.length)],
      ownerMobile: `+91${9000000000 + Math.floor(Math.random() * 100000000)}`,
      category: 'land-buy',
      title: land.title,
      description: land.desc,
      price: land.price,
      location: locations[Math.floor(Math.random() * locations.length)],
      address: `Plot ${300 + index}, ${locations[Math.floor(Math.random() * locations.length)]} District`,
      size: land.size,
      sizeUnit: 'sqft',
      images: [land.img, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      amenities: land.amenities,
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return properties;
}
