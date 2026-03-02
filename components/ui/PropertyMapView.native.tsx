import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Property } from '@/types';

interface PropertyMapViewProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  initialRegion?: Region;
  showUserLocation?: boolean;
}

export function PropertyMapView({
  properties,
  selectedProperty,
  onPropertySelect,
  initialRegion,
  showUserLocation = true,
}: PropertyMapViewProps) {
  const mapRef = useRef<MapView>(null);

  const defaultRegion: Region = initialRegion || {
    latitude: properties[0]?.coordinates.latitude || 28.6139,
    longitude: properties[0]?.coordinates.longitude || 77.209,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const getMarkerColor = (category: Property['category']) => {
    switch (category) {
      case 'home-rent':
        return '#3B82F6';
      case 'home-buy':
      case 'home-sell':
        return '#10B981';
      case 'land-buy':
      case 'land-sell':
        return '#F59E0B';
      default:
        return theme.colors.primary;
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const focusOnProperty = (property: Property) => {
    mapRef.current?.animateToRegion({
      latitude: property.coordinates.latitude,
      longitude: property.coordinates.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {properties.map((property) => {
          const isSelected = selectedProperty?.id === property.id;
          return (
            <Marker
              key={property.id}
              coordinate={property.coordinates}
              onPress={() => {
                onPropertySelect?.(property);
                focusOnProperty(property);
              }}
              pinColor={getMarkerColor(property.category)}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                <MaterialIcons
                  name={property.category.includes('land') ? 'landscape' : 'home'}
                  size={isSelected ? 28 : 24}
                  color={isSelected ? theme.colors.white : getMarkerColor(property.category)}
                />
              </View>
              {isSelected && (
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <Text style={styles.calloutPrice}>{formatPrice(property.price)}</Text>
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  markerSelected: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.white,
    ...theme.shadows.lg,
  },
  callout: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    minWidth: 150,
    ...theme.shadows.md,
  },
  calloutTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  calloutPrice: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
});
