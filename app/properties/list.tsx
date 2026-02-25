import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { useProperty } from '@/hooks/useProperty';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCategory, Property } from '@/types';

export default function PropertyListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category: PropertyCategory }>();
  const { filterProperties, toggleFavorite, favorites } = useProperty();
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, [category]);

  const loadProperties = () => {
    const filtered = filterProperties({ category });
    setProperties(filtered);
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
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorite={favorites.includes(item.id)}
            onPress={() =>
              router.push({
                pathname: '/properties/detail',
                params: { propertyId: item.id },
              })
            }
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
  },
  list: {
    padding: theme.spacing.md,
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
