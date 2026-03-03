import { useContext } from 'react';
import { ReviewContext } from '@/contexts/ReviewContext';

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within ReviewProvider');
  }
  return context;
}
