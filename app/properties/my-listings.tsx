import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { useProperty } from '@/hooks/useProperty';
import { useAuth } from '@/hooks/useAuth';
import { Property } from '@/types';
import { useAlert } from '@/template';

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getOwnerProperties, deleteProperty } = useProperty();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    if (user) {
      const ownerProps = getOwnerProperties(user.id);
      setProperties(ownerProps);
    }
  };

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    showAlert('Confirm Delete', `Are you sure you want to delete "${propertyTitle}"?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProperty(propertyId);
          loadProperties();
          showAlert('Success', 'Property deleted successfully');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>My Listings</Text>
        <Pressable onPress={() => router.push('/properties/add')} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.propertyItem}>
            <PropertyCard
              property={item}
              onPress={() =>
                router.push({
                  pathname: '/properties/detail',
                  params: { propertyId: item.id },
                })
              }
            />
            <View style={styles.actions}>
              <Pressable
                onPress={() => handleDelete(item.id, item.title)}
                style={({ pressed }) => [styles.actionButton, styles.deleteButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <MaterialIcons name="delete" size={20} color={theme.colors.white} />
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="home-work" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>No listings yet</Text>
            <Text style={styles.emptySubtext}>Start by adding your first property</Text>
            <Pressable
              onPress={() => router.push('/properties/add')}
              style={({ pressed }) => [styles.emptyButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="add" size={24} color={theme.colors.white} />
              <Text style={styles.emptyButtonText}>Add Property</Text>
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
  addButton: {
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
  propertyItem: {
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.white,
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
