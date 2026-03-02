import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { useAuth } from '@/hooks/useAuth';
import { useProperty } from '@/hooks/useProperty';
import { PropertyCategory } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { properties, filterProperties } = useProperty();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user]);

  if (!user) return null;

  const categories: Array<{
    category: PropertyCategory;
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }> = [
    { category: 'home-rent', title: 'Home Rent', icon: 'home' },
    { category: 'home-buy', title: 'Home Buy', icon: 'house' },
    { category: 'home-sell', title: 'Home Sell', icon: 'sell' },
    { category: 'land-buy', title: 'Land Buy', icon: 'landscape' },
    { category: 'land-sell', title: 'Land Sell', icon: 'terrain' },
  ];

  const getCategoryCount = (category: PropertyCategory) => {
    return filterProperties({ category }).length;
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[theme.colors.gradient1, theme.colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user.name}</Text>
            <Text style={styles.role}>{user.role === 'finder' ? 'Property Finder' : 'Property Owner'}</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <MaterialIcons name="settings" size={24} color={theme.colors.white} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Browse Categories</Text>

        {categories.map((cat) => (
          <CategoryCard
            key={cat.category}
            category={cat.category}
            title={cat.title}
            icon={cat.icon}
            count={getCategoryCount(cat.category)}
            onPress={() =>
              router.push({
                pathname: '/properties/list',
                params: { category: cat.category },
              })
            }
          />
        ))}

        {user.role === 'owner' && (
          <>
            <Text style={styles.sectionTitle}>Owner Actions</Text>
            <Pressable
              onPress={() => router.push('/properties/add')}
              style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="add-circle" size={32} color={theme.colors.primary} />
              <Text style={styles.actionTitle}>Add New Property</Text>
              <Text style={styles.actionDescription}>List your property for sale or rent</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/properties/my-listings')}
              style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="list" size={32} color={theme.colors.secondary} />
              <Text style={styles.actionTitle}>My Listings</Text>
              <Text style={styles.actionDescription}>Manage your property listings</Text>
            </Pressable>
          </>
        )}

        {user.role === 'finder' && (
          <>
            <Text style={styles.sectionTitle}>Finder Actions</Text>
            <Pressable
              onPress={() => router.push('/properties/favorites')}
              style={({ pressed }) => [styles.actionCard, { opacity: pressed ? 0.7 : 1 }]}
            >
              <MaterialIcons name="favorite" size={32} color={theme.colors.error} />
              <Text style={styles.actionTitle}>Saved Properties</Text>
              <Text style={styles.actionDescription}>View your favorite listings</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  role: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  actionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  actionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
