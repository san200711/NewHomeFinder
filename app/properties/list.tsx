import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { PropertyMapView } from '@/components/ui/PropertyMapView';
import { useProperty } from '@/hooks/useProperty';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCategory, Property } from '@/types';
import * as Location from 'expo-location';

const { height } = Dimensions.get('window');

export default function PropertyListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category: PropertyCategory }>();
  const { filterProperties, toggleFavorite, favorites } = useProperty();
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<number>(10);

  useEffect(() => {
    loadProperties();
    requestLocationPermission();
  }, [category]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const loadProperties = () => {
    const filtered = filterProperties({ category });
    setProperties(filtered);
  };

  const loadNearbyProperties = () => {
    if (!userLocation) return;
    const filtered = filterProperties({
      category,
      nearLocation: userLocation,
      radiusKm: nearbyRadius,
    });
    setProperties(filtered);
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: '/properties/detail',
      params: { propertyId: property.id },
    });
  };

  const categoryTitles = {
    'home-rent': 'Homes for Rent',
    'home-buy': 'Homes for Sale',
    'home-sell': 'Homes for Sale',
    'land-buy': 'Land for Sale',
    'land-sell': 'Land for Sale',
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    await toggleFavorite(propertyId);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>{categoryTitles[category]}</Text>
        <View style={styles.headerActions}>
          {userLocation && (
            <Pressable
              onPress={loadNearbyProperties}
              style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="near-me" size={22} color={theme.colors.primary} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <MaterialIcons
              name={viewMode === 'list' ? 'map' : 'view-list'}
              size={22}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={favorites.includes(item.id)}
              onPress={() => handlePropertyPress(item)}
              onFavoritePress={user?.role === 'finder' ? () => handleFavoriteToggle(item.id) : undefined}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>No properties found</Text>
              <Text style={styles.emptySubtext}>Check back later for new listings</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <PropertyMapView
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={handlePropertySelect}
            showUserLocation={true}
          />
          {selectedProperty && (
            <View style={styles.selectedPropertyCard}>
              <PropertyCard
                property={selectedProperty}
                isFavorite={favorites.includes(selectedProperty.id)}
                onPress={() => handlePropertyPress(selectedProperty)}
                onFavoritePress={
                  user?.role === 'finder' ? () => handleFavoriteToggle(selectedProperty.id) : undefined
                }
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.md,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  selectedPropertyCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
});
