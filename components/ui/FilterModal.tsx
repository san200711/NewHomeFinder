import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyFilter, PropertyCategory } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PropertyFilter) => void;
  currentCategory?: PropertyCategory;
  initialFilters?: PropertyFilter;
}

export function FilterModal({ visible, onClose, onApply, currentCategory, initialFilters }: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const [listingType, setListingType] = useState<'rent' | 'buy'>('rent');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [bathrooms, setBathrooms] = useState<number | undefined>();
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (visible) {
      // Initialize from current category
      if (currentCategory?.includes('rent')) {
        setListingType('rent');
      } else if (currentCategory?.includes('buy')) {
        setListingType('buy');
      }

      // Initialize from initial filters if provided
      if (initialFilters) {
        setMinPrice(initialFilters.minPrice?.toString() || '');
        setMaxPrice(initialFilters.maxPrice?.toString() || '');
        setMinSize(initialFilters.minSize?.toString() || '');
        setMaxSize(initialFilters.maxSize?.toString() || '');
        setBedrooms(initialFilters.bedrooms);
        setBathrooms(initialFilters.bathrooms);
        setLocation(initialFilters.location || '');
      }
    }
  }, [visible, currentCategory, initialFilters]);

  const propertyTypeOptions = currentCategory?.includes('land')
    ? ['Commercial', 'Residential', 'Agricultural', 'Industrial']
    : ['Apartment', 'House', 'Villa', 'Townhouse', 'Penthouse', 'Studio'];

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t) => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const handleReset = () => {
    setPropertyTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setMaxSize('');
    setBedrooms(undefined);
    setBathrooms(undefined);
    setLocation('');
  };

  const handleApply = () => {
    const filters: PropertyFilter = {
      category: currentCategory,
    };

    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (minSize) filters.minSize = parseInt(minSize);
    if (maxSize) filters.maxSize = parseInt(maxSize);
    if (bedrooms) filters.bedrooms = bedrooms;
    if (bathrooms) filters.bathrooms = bathrooms;
    if (location) filters.location = location;

    onApply(filters);
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <MaterialIcons name="close" size={28} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listing Type</Text>
              <View style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, listingType === 'buy' && styles.chipActive]}
                  onPress={() => setListingType('buy')}
                >
                  <Text style={[styles.chipText, listingType === 'buy' && styles.chipTextActive]}>For Sale</Text>
                </Pressable>
                <Pressable
                  style={[styles.chip, listingType === 'rent' && styles.chipActive]}
                  onPress={() => setListingType('rent')}
                >
                  <Text style={[styles.chipText, listingType === 'rent' && styles.chipTextActive]}>For Rent</Text>
                </Pressable>
              </View>
            </View>

            {!currentCategory?.includes('land') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Property Type</Text>
                <View style={styles.chipRow}>
                  {propertyTypeOptions.map((type) => (
                    <Pressable
                      key={type}
                      style={[styles.chip, propertyTypes.includes(type) && styles.chipActive]}
                      onPress={() => togglePropertyType(type)}
                    >
                      <Text style={[styles.chipText, propertyTypes.includes(type) && styles.chipTextActive]}>{type}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeInputWrapper}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={theme.colors.textLight}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    style={styles.rangeInput}
                  />
                </View>
                <View style={styles.rangeSeparator}>
                  <View style={styles.rangeLine} />
                </View>
                <View style={styles.rangeInputWrapper}>
                  <TextInput
                    placeholder="Max"
                    placeholderTextColor={theme.colors.textLight}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    style={styles.rangeInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Area (sqft)</Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeInputWrapper}>
                  <TextInput
                    placeholder="Min"
                    placeholderTextColor={theme.colors.textLight}
                    value={minSize}
                    onChangeText={setMinSize}
                    keyboardType="numeric"
                    style={styles.rangeInput}
                  />
                </View>
                <View style={styles.rangeSeparator}>
                  <View style={styles.rangeLine} />
                </View>
                <View style={styles.rangeInputWrapper}>
                  <TextInput
                    placeholder="Max"
                    placeholderTextColor={theme.colors.textLight}
                    value={maxSize}
                    onChangeText={setMaxSize}
                    keyboardType="numeric"
                    style={styles.rangeInput}
                  />
                </View>
              </View>
            </View>

            {!currentCategory?.includes('land') && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bedrooms</Text>
                  <View style={styles.chipRow}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Pressable
                        key={num}
                        style={[styles.numberChip, bedrooms === num && styles.chipActive]}
                        onPress={() => setBedrooms(bedrooms === num ? undefined : num)}
                      >
                        <Text style={[styles.chipText, bedrooms === num && styles.chipTextActive]}>
                          {num === 5 ? '5+' : num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bathrooms</Text>
                  <View style={styles.chipRow}>
                    {[1, 2, 3, 4].map((num) => (
                      <Pressable
                        key={num}
                        style={[styles.numberChip, bathrooms === num && styles.chipActive]}
                        onPress={() => setBathrooms(bathrooms === num ? undefined : num)}
                      >
                        <Text style={[styles.chipText, bathrooms === num && styles.chipTextActive]}>
                          {num === 4 ? '4+' : num}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationInputWrapper}>
                <MaterialIcons name="place" size={20} color={theme.colors.textLight} style={styles.locationIcon} />
                <TextInput
                  placeholder="Enter location"
                  placeholderTextColor={theme.colors.textLight}
                  value={location}
                  onChangeText={setLocation}
                  style={styles.locationInput}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
            <Pressable 
              style={styles.resetButton} 
              onPress={handleReset}
              android_ripple={{ color: theme.colors.primary + '20' }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable 
              style={styles.applyButton} 
              onPress={handleApply}
              android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  numberChip: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rangeInputWrapper: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  rangeInput: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  rangeSeparator: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeLine: {
    width: 12,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  locationIcon: {
    marginRight: theme.spacing.sm,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  resetText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  applyText: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
