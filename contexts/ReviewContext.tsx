import { createContext, useState, useEffect, ReactNode } from 'react';
import { Review, PropertyStats } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReviewContextType {
  reviews: Review[];
  isLoading: boolean;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount' | 'helpfulVotes' | 'unhelpfulVotes'>) => Promise<void>;
  updateReview: (id: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getPropertyReviews: (propertyId: string) => Review[];
  getPropertyStats: (propertyId: string) => PropertyStats;
  voteHelpful: (reviewId: string, userId: string) => Promise<void>;
  voteUnhelpful: (reviewId: string, userId: string) => Promise<void>;
  hasUserReviewed: (propertyId: string, userId: string) => boolean;
}

export const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const STORAGE_KEY = '@newhomefinder_reviews';

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setReviews(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReviews = async (updatedReviews: Review[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error saving reviews:', error);
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount' | 'helpfulVotes' | 'unhelpfulVotes'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulVotes: [],
      unhelpfulVotes: [],
    };

    const updatedReviews = [...reviews, newReview];
    await saveReviews(updatedReviews);
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    const updatedReviews = reviews.map((review) =>
      review.id === id ? { ...review, ...updates, updatedAt: new Date().toISOString() } : review
    );
    await saveReviews(updatedReviews);
  };

  const deleteReview = async (id: string) => {
    const updatedReviews = reviews.filter((review) => review.id !== id);
    await saveReviews(updatedReviews);
  };

  const getPropertyReviews = (propertyId: string) => {
    return reviews
      .filter((review) => review.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPropertyStats = (propertyId: string): PropertyStats => {
    const propertyReviews = getPropertyReviews(propertyId);
    const totalReviews = propertyReviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    propertyReviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: totalRating / totalReviews,
      totalReviews,
      ratingDistribution,
    };
  };

  const voteHelpful = async (reviewId: string, userId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    let helpfulVotes = [...review.helpfulVotes];
    let unhelpfulVotes = [...review.unhelpfulVotes];

    // Remove from unhelpful if previously voted unhelpful
    unhelpfulVotes = unhelpfulVotes.filter((id) => id !== userId);

    // Toggle helpful vote
    if (helpfulVotes.includes(userId)) {
      helpfulVotes = helpfulVotes.filter((id) => id !== userId);
    } else {
      helpfulVotes.push(userId);
    }

    await updateReview(reviewId, {
      helpfulVotes,
      unhelpfulVotes,
      helpfulCount: helpfulVotes.length,
      unhelpfulCount: unhelpfulVotes.length,
    });
  };

  const voteUnhelpful = async (reviewId: string, userId: string) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    let helpfulVotes = [...review.helpfulVotes];
    let unhelpfulVotes = [...review.unhelpfulVotes];

    // Remove from helpful if previously voted helpful
    helpfulVotes = helpfulVotes.filter((id) => id !== userId);

    // Toggle unhelpful vote
    if (unhelpfulVotes.includes(userId)) {
      unhelpfulVotes = unhelpfulVotes.filter((id) => id !== userId);
    } else {
      unhelpfulVotes.push(userId);
    }

    await updateReview(reviewId, {
      helpfulVotes,
      unhelpfulVotes,
      helpfulCount: helpfulVotes.length,
      unhelpfulCount: unhelpfulVotes.length,
    });
  };

  const hasUserReviewed = (propertyId: string, userId: string): boolean => {
    return reviews.some((review) => review.propertyId === propertyId && review.userId === userId);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isLoading,
        addReview,
        updateReview,
        deleteReview,
        getPropertyReviews,
        getPropertyStats,
        voteHelpful,
        voteUnhelpful,
        hasUserReviewed,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}
