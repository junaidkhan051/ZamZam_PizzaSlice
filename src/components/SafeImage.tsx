import React, { useState } from 'react';
import { FALLBACK_IMAGES } from '../data/menuData';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackCategory?: 'pizza' | 'burger' | 'shawarma' | 'fries' | 'pasta' | 'chicken' | 'drink' | 'dessert' | 'slices';
  aspectRatio?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackCategory = 'pizza',
  className = '',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || FALLBACK_IMAGES[fallbackCategory as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.pizza);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true);
      const categoryFallback = FALLBACK_IMAGES[fallbackCategory as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.pizza;
      setImgSrc(categoryFallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Food item'}
      onError={handleError}
      loading="lazy"
      className={className}
      {...props}
    />
  );
};
