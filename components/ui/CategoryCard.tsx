import { Pressable, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { PropertyCategory } from '@/types';

interface CategoryCardProps {
  category: PropertyCategory;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  count: number;
  onPress: () => void;
}

export function CategoryCard({ category, title, icon, count, onPress }: CategoryCardProps) {
  const categoryColors = {
    'home-rent': '#3B82F6',
    'home-buy': '#10B981',
    'home-sell': '#F59E0B',
    'land-buy': '#8B5CF6',
    'land-sell': '#EF4444',
  };

  const bgColor = categoryColors[category];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${bgColor}20` }]}>
        <MaterialIcons name={icon} size={32} color={bgColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{count} Properties</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  count: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
