import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export function PropertyCard({ property, isFavorite, onPress, onFavoritePress }: PropertyCardProps) {
  const categoryLabels = {
    'home-rent': 'For Rent',
    'home-buy': 'For Sale',
    'home-sell': 'For Sale',
    'land-buy': 'Land Sale',
    'land-sell': 'Land Sale',
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.95 : 1 }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryLabels[property.category]}</Text>
        </View>
        {onFavoritePress && (
          <Pressable onPress={onFavoritePress} style={styles.favoriteButton}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? theme.colors.error : theme.colors.white}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.location}>
          <MaterialIcons name="place" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <View style={styles.details}>
          {property.bedrooms && (
            <View style={styles.detail}>
              <MaterialIcons name="bed" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{property.bedrooms} Bed</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.detail}>
              <MaterialIcons name="bathtub" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{property.bathrooms} Bath</Text>
            </View>
          )}
          <View style={styles.detail}>
            <MaterialIcons name="square-foot" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{property.size} {property.sizeUnit}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  content: {
    padding: theme.spacing.md,
  },
  price: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
});
