import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  editable = false,
  onRatingChange,
  color = theme.colors.warning,
}: StarRatingProps) {
  const handlePress = (star: number) => {
    if (editable && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, index) => {
        const star = index + 1;
        const filled = star <= Math.floor(rating);
        const halfFilled = star === Math.ceil(rating) && rating % 1 !== 0;

        if (editable) {
          return (
            <Pressable key={star} onPress={() => handlePress(star)} style={styles.starButton}>
              <MaterialIcons name={filled ? 'star' : 'star-border'} size={size} color={color} />
            </Pressable>
          );
        }

        return (
          <View key={star}>
            {halfFilled ? (
              <MaterialIcons name="star-half" size={size} color={color} />
            ) : (
              <MaterialIcons name={filled ? 'star' : 'star-border'} size={size} color={color} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
});
