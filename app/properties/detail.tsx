import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { PropertyMapPreview } from '@/components/ui/PropertyMapPreview';
import { useProperty } from '@/hooks/useProperty';
import { Property } from '@/types';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { getPropertyById, toggleFavorite, favorites } = useProperty();

  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const prop = getPropertyById(propertyId);
    if (prop) {
      setProperty(prop);
    }
  }, [propertyId]);

  if (!property) {
    return null;
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Crore`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.ownerMobile}`);
  };

  const handleFavorite = async () => {
    await toggleFavorite(property.id);
  };

  const isFavorite = favorites.includes(property.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {property.images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
              cachePolicy="memory-disk"
            />
          ))}
        </ScrollView>

        <View style={styles.imageOverlay}>
          <Pressable onPress={() => router.back()} style={styles.overlayButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.white} />
          </Pressable>
          <Pressable onPress={handleFavorite} style={styles.overlayButton}>
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? theme.colors.error : theme.colors.white}
            />
          </Pressable>
        </View>

        <View style={styles.pagination}>
          {property.images.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === currentImageIndex && styles.paginationDotActive]} />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.title}>{property.title}</Text>

        <View style={styles.location}>
          <MaterialIcons name="place" size={20} color={theme.colors.primary} />
          <Text style={styles.locationText}>{property.address}</Text>
        </View>

        <View style={styles.details}>
          {property.bedrooms && (
            <View style={styles.detailItem}>
              <MaterialIcons name="bed" size={24} color={theme.colors.primary} />
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.detailItem}>
              <MaterialIcons name="bathtub" size={24} color={theme.colors.primary} />
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <MaterialIcons name="square-foot" size={24} color={theme.colors.primary} />
            <Text style={styles.detailValue}>{property.size}</Text>
            <Text style={styles.detailLabel}>{property.sizeUnit}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenity}>
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.secondary} />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <PropertyMapPreview property={property} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <MaterialIcons name="person" size={32} color={theme.colors.white} />
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{property.ownerName}</Text>
              <Text style={styles.ownerMobile}>{property.ownerMobile}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || theme.spacing.md }]}>
        <Button title="Call Owner" onPress={handleCall} variant="gradient" size="large" style={styles.callButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width,
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  pagination: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: theme.colors.white,
    width: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  price: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  locationText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  amenities: {
    gap: theme.spacing.sm,
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  amenityText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  ownerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  ownerMobile: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  callButton: {
    width: '100%',
  },
});
