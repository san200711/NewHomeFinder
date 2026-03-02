import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { useProperty } from '@/hooks/useProperty';
import { Property } from '@/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { properties, favorites, toggleFavorite } = useProperty();

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = () => {
    const favProps = properties.filter((prop) => favorites.includes(prop.id));
    setFavoriteProperties(favProps);
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
        <Text style={styles.title}>Saved Properties</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorite={true}
            onPress={() =>
              router.push({
                pathname: '/properties/detail',
                params: { propertyId: item.id },
              })
            }
            onFavoritePress={() => handleFavoriteToggle(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>No saved properties</Text>
            <Text style={styles.emptySubtext}>Start exploring and save your favorite listings</Text>
            <Pressable
              onPress={() => router.push('/dashboard')}
              style={({ pressed }) => [styles.emptyButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="explore" size={24} color={theme.colors.white} />
              <Text style={styles.emptyButtonText}>Explore Properties</Text>
            </Pressable>
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
});
