import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Property } from '@/types';

interface PropertyMapViewProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect?: (property: Property) => void;
  showUserLocation?: boolean;
}

export function PropertyMapView({
  properties,
  selectedProperty,
  onPropertySelect,
}: PropertyMapViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <MaterialIcons name="map" size={64} color={theme.colors.textLight} />
        <Text style={styles.placeholderText}>Map view available on mobile app</Text>
        <Text style={styles.placeholderSubtext}>
          Download the mobile app to view properties on an interactive map
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  placeholderText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
