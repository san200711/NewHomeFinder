import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { Review } from '@/types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onHelpfulPress?: () => void;
  onUnhelpfulPress?: () => void;
}

export function ReviewCard({ review, currentUserId, onHelpfulPress, onUnhelpfulPress }: ReviewCardProps) {
  const hasVotedHelpful = currentUserId ? review.helpfulVotes.includes(currentUserId) : false;
  const hasVotedUnhelpful = currentUserId ? review.unhelpfulVotes.includes(currentUserId) : false;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={24} color={theme.colors.white} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{review.userName}</Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.rating}>
        <StarRating rating={review.rating} size={18} />
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {review.images && review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {review.images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.reviewImage}
              contentFit="cover"
              transition={200}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Text style={styles.helpfulLabel}>Was this review helpful?</Text>
        <View style={styles.voteButtons}>
          <Pressable
            onPress={onHelpfulPress}
            style={[styles.voteButton, hasVotedHelpful && styles.voteButtonActive]}
          >
            <MaterialIcons
              name="thumb-up"
              size={16}
              color={hasVotedHelpful ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.voteText, hasVotedHelpful && styles.voteTextActive]}>
              {review.helpfulCount}
            </Text>
          </Pressable>

          <Pressable
            onPress={onUnhelpfulPress}
            style={[styles.voteButton, hasVotedUnhelpful && styles.voteButtonActive]}
          >
            <MaterialIcons
              name="thumb-down"
              size={16}
              color={hasVotedUnhelpful ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text style={[styles.voteText, hasVotedUnhelpful && styles.voteTextActive]}>
              {review.unhelpfulCount}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rating: {
    marginBottom: theme.spacing.sm,
  },
  comment: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  imagesContainer: {
    marginBottom: theme.spacing.md,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpfulLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  voteButtonActive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
  },
  voteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  voteTextActive: {
    color: theme.colors.primary,
  },
});
