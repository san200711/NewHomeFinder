import { useContext } from 'react';
import { PropertyContext } from '@/contexts/PropertyContext';

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within PropertyProvider');
  }
  return context;
}
