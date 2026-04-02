
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { useAuth } from '@/hooks/useAuth';
import { useProperty } from '@/hooks/useProperty';
import { useReview } from '@/hooks/useReview';
import { PropertyCategory } from '@/types';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { properties, filterProperties, favorites, toggleFavorite, getOwnerProperties } = useProperty();
  const { getPropertyStats } = useReview();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));

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

  const recentProperties = properties
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const featuredProperties = properties
    .filter((p) => {
      const stats = getPropertyStats(p.id);
      return stats.averageRating >= 4 || stats.totalReviews >= 3;
    })
    .slice(0, 5);

  const ownerStats = user?.role === 'owner' ? {
    totalListings: getOwnerProperties(user.id).length,
    activeListings: getOwnerProperties(user.id).filter(p => p.status === 'active').length,
  } : null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/properties/list',
        params: { category: 'home-rent', search: searchQuery },
      });
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/properties/detail',
      params: { propertyId },
    });
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    await toggleFavorite(propertyId);
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.gradient1, theme.colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#A78BFA', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.role}>{user.role === 'finder' ? '🔍 Property Finder' : '🏢 Property Owner'}</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton}>
              <MaterialIcons name="settings" size={26} color={theme.colors.white} />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              placeholder="Search properties, locations..."
              placeholderTextColor={theme.colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <MaterialIcons name="close" size={18} color={theme.colors.textLight} />
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {ownerStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="home-work" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{ownerStats.totalListings}</Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.statValue}>{ownerStats.activeListings}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="favorite" size={24} color={theme.colors.error} />
              </View>
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        )}

        {featuredProperties.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Featured Properties</Text>
              <Pressable onPress={() => router.push({ pathname: '/properties/list', params: { category: 'home-rent' } })}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {featuredProperties.map((property) => (
                <View key={property.id} style={styles.featuredCard}>
                  <PropertyCard
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onPress={() => handlePropertyPress(property.id)}
                    onFavoritePress={user?.role === 'finder' ? () => handleFavoriteToggle(property.id) : undefined}
                    averageRating={getPropertyStats(property.id).averageRating}
                    reviewCount={getPropertyStats(property.id).totalReviews}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏘️ Browse by Category</Text>
        </View>
        <View style={styles.categoriesGrid}>
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
        </View>

        {recentProperties.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🆕 Recently Added</Text>
              <Pressable onPress={() => router.push({ pathname: '/properties/list', params: { category: 'home-rent' } })}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            {recentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onPress={() => handlePropertyPress(property.id)}
                onFavoritePress={user?.role === 'finder' ? () => handleFavoriteToggle(property.id) : undefined}
                averageRating={getPropertyStats(property.id).averageRating}
                reviewCount={getPropertyStats(property.id).totalReviews}
              />
            ))}
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          {user.role === 'owner' ? (
            <>
              <Pressable
                onPress={() => router.push('/properties/add')}
                style={({ pressed }) => [styles.quickActionCard, styles.quickActionPrimary, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="add-circle-outline" size={28} color={theme.colors.white} />
                  <Text style={styles.quickActionTitle}>Add Property</Text>
                  <Text style={styles.quickActionSubtitle}>List new property</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => router.push('/properties/my-listings')}
                style={({ pressed }) => [styles.quickActionCard, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="business-center" size={28} color={theme.colors.white} />
                  <Text style={styles.quickActionTitle}>My Listings</Text>
                  <Text style={styles.quickActionSubtitle}>{ownerStats?.totalListings || 0} properties</Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => router.push('/properties/favorites')}
                style={({ pressed }) => [styles.quickActionCard, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="favorite" size={28} color={theme.colors.white} />
                  <Text style={styles.quickActionTitle}>Favorites</Text>
                  <Text style={styles.quickActionSubtitle}>{favorites.length} saved</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => router.push({ pathname: '/properties/list', params: { category: 'home-rent' } })}
                style={({ pressed }) => [styles.quickActionCard, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickActionGradient}
                >
                  <MaterialIcons name="explore" size={28} color={theme.colors.white} />
                  <Text style={styles.quickActionTitle}>Explore</Text>
                  <Text style={styles.quickActionSubtitle}>Find properties</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    zIndex: 1000,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  role: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: theme.fontWeight.medium,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  horizontalScroll: {
    marginBottom: theme.spacing.xl,
  },
  featuredCard: {
    width: 280,
    marginRight: theme.spacing.md,
  },
  categoriesGrid: {
    marginBottom: theme.spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  quickActionPrimary: {
    flex: 1,
  },
  quickActionGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  quickActionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
  },
  quickActionSubtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing.xs,
  },
});
