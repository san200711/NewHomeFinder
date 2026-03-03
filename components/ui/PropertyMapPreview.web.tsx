import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Property } from '@/types';

interface PropertyMapPreviewProps {
  property: Property;
}

export function PropertyMapPreview({ property }: PropertyMapPreviewProps) {
  // Check if coordinates are available
  if (!property.coordinates) {
    return null; // Don't render map if no coordinates
  }

  const openGoogleMaps = () => {
    const { latitude, longitude } = property.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
        <Pressable onPress={openGoogleMaps} style={styles.directionsButton}>
          <MaterialIcons name="directions" size={20} color={theme.colors.primary} />
          <Text style={styles.directionsText}>View on Google Maps</Text>
        </Pressable>
      </View>

      <Pressable onPress={openGoogleMaps} style={styles.mapPlaceholder}>
        <MaterialIcons name="map" size={48} color={theme.colors.primary} />
        <Text style={styles.placeholderText}>Tap to view location on Google Maps</Text>
        <Text style={styles.addressText}>{property.address}</Text>
      </Pressable>
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
  mapPlaceholder: {
    height: 200,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    padding: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  addressText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
