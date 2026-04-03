import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useProperty } from '@/hooks/useProperty';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCategory } from '@/types';
import { useAlert } from '@/template';
import { Image } from 'expo-image';

export default function AddPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addProperty } = useProperty();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [category, setCategory] = useState<PropertyCategory>('home-rent');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [size, setSize] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [amenities, setAmenities] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ latitude: 28.6139, longitude: 77.209 });

  const categories = [
    { value: 'home-rent', label: 'Home Rent' },
    { value: 'home-buy', label: 'Home Buy' },
    { value: 'home-sell', label: 'Home Sell' },
    { value: 'land-buy', label: 'Land Buy' },
    { value: 'land-sell', label: 'Land Sell' },
  ];

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
    if (!title || !description || !price || !location || !address || !size) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    // Add small random offset to coordinates for new properties
    const randomCoords = {
      latitude: coordinates.latitude + (Math.random() - 0.5) * 0.05,
      longitude: coordinates.longitude + (Math.random() - 0.5) * 0.05,
    };

    if (images.length === 0) {
      showAlert('Error', 'Please add at least one image');
      return;
    }

    if (!user) {
      showAlert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      await addProperty({
        ownerId: user.id,
        ownerName: user.name,
        ownerMobile: user.mobile || '',
        category,
        title,
        description,
        price: parseFloat(price),
        location,
        address,
        coordinates: randomCoords,
        size: parseFloat(size),
        sizeUnit: 'sqft',
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        images,
        amenities: amenities ? amenities.split(',').map((a) => a.trim()) : [],
        status: 'active',
      });

      showAlert('Success', 'Property added successfully!');
      router.back();
    } catch (error) {
      showAlert('Error', 'Failed to add property');
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
        <Text style={styles.title}>Add Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <Pressable
              key={cat.value}
              onPress={() => setCategory(cat.value as PropertyCategory)}
              style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, category === cat.value && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Property Details</Text>
        <Input label="Title *" placeholder="Modern 3BHK Apartment" value={title} onChangeText={setTitle} />

        <Input
          label="Description *"
          placeholder="Describe your property..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Input
          label="Price (₹) *"
          placeholder="25000"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          leftIcon="currency-rupee"
        />

        <Input
          label="Location *"
          placeholder="Downtown"
          value={location}
          onChangeText={setLocation}
          leftIcon="place"
        />

        <Input
          label="Full Address *"
          placeholder="123 Main Street, City"
          value={address}
          onChangeText={setAddress}
          leftIcon="location-on"
        />

        <Input
          label="Size (sqft) *"
          placeholder="1500"
          value={size}
          onChangeText={setSize}
          keyboardType="numeric"
          leftIcon="square-foot"
        />

        {(category === 'home-rent' || category === 'home-buy' || category === 'home-sell') && (
          <>
            <Input
              label="Bedrooms"
              placeholder="3"
              value={bedrooms}
              onChangeText={setBedrooms}
              keyboardType="numeric"
              leftIcon="bed"
            />

            <Input
              label="Bathrooms"
              placeholder="2"
              value={bathrooms}
              onChangeText={setBathrooms}
              keyboardType="numeric"
              leftIcon="bathtub"
            />
          </>
        )}

        <Input
          label="Amenities (comma separated)"
          placeholder="Parking, Gym, Swimming Pool"
          value={amenities}
          onChangeText={setAmenities}
          leftIcon="checklist"
        />

        <Text style={styles.sectionTitle}>Images *</Text>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          <MaterialIcons name="add-photo-alternate" size={32} color={theme.colors.primary} />
          <Text style={styles.imagePickerText}>Add Images</Text>
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

        <Button title="Add Property" onPress={handleSubmit} loading={loading} variant="gradient" size="large" />
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  categoryScroll: {
    marginBottom: theme.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  categoryTextActive: {
    color: theme.colors.white,
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
  imagesList: {
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  image: {
    width: 120,
    height: 120,
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
});
