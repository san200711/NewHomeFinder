import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Input } from './Input';
import { Button } from './Button';
import { PropertyFilter, PropertyCategory } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PropertyFilter) => void;
  currentCategory?: PropertyCategory;
  initialFilters?: PropertyFilter;
}

export function FilterModal({ visible, onClose, onApply, currentCategory, initialFilters }: FilterModalProps) {
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <View style={styles.rangeInput}>
                  <Input
                    placeholder="Min"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={styles.rangeInput}>
                  <Input
                    placeholder="Max"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Area (sqft)</Text>
              <View style={styles.rangeRow}>
                <View style={styles.rangeInput}>
                  <Input
                    placeholder="Min"
                    value={minSize}
                    onChangeText={setMinSize}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
                <View style={styles.rangeInput}>
                  <Input
                    placeholder="Max"
                    value={maxSize}
                    onChangeText={setMaxSize}
                    keyboardType="numeric"
                    style={styles.input}
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
              <Input
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
                leftIcon="place"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Button title="Apply Filters" onPress={handleApply} variant="gradient" style={styles.applyButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  numberChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rangeInput: {
    flex: 1,
  },
  input: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  resetButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  applyButton: {
    flex: 1,
  },
});
