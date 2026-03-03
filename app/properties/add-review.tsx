import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { useReview } from '@/hooks/useReview';
import { useAuth } from '@/hooks/useAuth';
import { useProperty } from '@/hooks/useProperty';
import { useAlert } from '@/template';

export default function AddReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { addReview } = useReview();
  const { user } = useAuth();
  const { getPropertyById } = useProperty();
  const { showAlert } = useAlert();

  const property = getPropertyById(propertyId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!property || !user) {
    router.back();
    return null;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      showAlert('Error', 'Please write a review comment');
      return;
    }

    setLoading(true);
    try {
      await addReview({
        propertyId,
        userId: user.id,
        userName: user.name,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      showAlert('Success', 'Review added successfully!');
      router.back();
    } catch (error) {
      showAlert('Error', 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rating</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} size={40} editable onRatingChange={setRating} />
            <Text style={styles.ratingText}>{rating} out of 5</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <Input
            placeholder="Share your experience with this property..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            style={{ minHeight: 150, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <Pressable onPress={pickImage} style={styles.imagePicker}>
            <MaterialIcons name="add-photo-alternate" size={32} color={theme.colors.primary} />
            <Text style={styles.imagePickerText}>Add Photos</Text>
            <Text style={styles.imagePickerSubtext}>Help others by showing what you saw</Text>
          </Pressable>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} contentFit="cover" />
                  <Pressable onPress={() => removeImage(index)} style={styles.removeButton}>
                    <MaterialIcons name="close" size={20} color={theme.colors.white} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.colors.secondary} />
            <Text style={styles.guidelineText}>Be honest and share your genuine experience</Text>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.colors.secondary} />
            <Text style={styles.guidelineText}>Focus on property features and condition</Text>
          </View>
          <View style={styles.guidelineItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.colors.secondary} />
            <Text style={styles.guidelineText}>Be respectful and constructive</Text>
          </View>
        </View>

        <Button title="Submit Review" onPress={handleSubmit} loading={loading} variant="gradient" size="large" />
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  propertyInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  propertyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  propertyLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  ratingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
  imagePicker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  imagePickerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginTop: theme.spacing.sm,
  },
  imagePickerSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  imagesList: {
    marginTop: theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
  guidelines: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  guidelinesTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  guidelineText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
