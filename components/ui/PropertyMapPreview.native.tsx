import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Property } from '@/types';

interface PropertyMapPreviewProps {
  property: Property;
}

export function PropertyMapPreview({ property }: PropertyMapPreviewProps) {
  const openDirections = () => {
    const { latitude, longitude } = property.coordinates;
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?daddr=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}(${property.title})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
        <Pressable onPress={openDirections} style={styles.directionsButton}>
          <MaterialIcons name="directions" size={20} color={theme.colors.primary} />
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: property.coordinates.latitude,
            longitude: property.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={property.coordinates}
            title={property.title}
            description={property.address}
          >
            <View style={styles.markerContainer}>
              <MaterialIcons name="location-on" size={32} color={theme.colors.error} />
            </View>
          </Marker>
        </MapView>

        <Pressable style={styles.mapOverlay} onPress={openDirections}>
          <View style={styles.overlayIcon}>
            <MaterialIcons name="open-in-new" size={20} color={theme.colors.white} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  directionsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  mapContainer: {
    height: 200,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  overlayIcon: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
});
