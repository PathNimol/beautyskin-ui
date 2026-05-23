'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Image from 'next/image';
import { beautyHero } from '@/lib/media/beautyImages';

export const IMAGE_FALLBACK_SRC = '/images/image-fallback.svg';
const REMOTE_IMAGE_FALLBACK_SRC = beautyHero.imageFallback;

/** Returns true only for URLs next/image can handle without crashing */
function isValidImageSrc(src: unknown): boolean {
  if (!src || typeof src !== 'string') return false;
  if (src.trim() === '') return false;
  // Must be absolute URL or root-relative path
  if (src.startsWith('http://') || src.startsWith('https://')) return true;
  if (src.startsWith('/')) return true;
  // blob: URLs from createObjectURL are valid for unoptimized display
  if (src.startsWith('blob:')) return true;
  // Anything else (e.g. "string", relative paths, base64 without prefix) is invalid
  return false;
}

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
  onClick?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  [key: string]: any;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = IMAGE_FALLBACK_SRC,
  loading = 'lazy',
  unoptimized = false,
  ...props
}: AppImageProps) {
  // Sanitize src on entry — never pass an invalid string to next/image
  const safeSrc = isValidImageSrc(src) ? src : fallbackSrc;

  const [imageSrc, setImageSrc] = useState(safeSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStep, setErrorStep] = useState(0);

  useEffect(() => {
    const next = isValidImageSrc(src) ? src : fallbackSrc;
    setImageSrc(next);
    setIsLoading(true);
    setErrorStep(0);
  }, [src, fallbackSrc]);

  const isExternalOrBlob = useMemo(
    () =>
      typeof imageSrc === 'string' && (imageSrc.startsWith('http') || imageSrc.startsWith('blob:')),
    [imageSrc]
  );
  const resolvedUnoptimized = unoptimized || isExternalOrBlob;

  const handleError = useCallback(() => {
    if (errorStep === 0 && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setErrorStep(1);
      return;
    }
    if (
      errorStep <= 1 &&
      imageSrc !== REMOTE_IMAGE_FALLBACK_SRC &&
      fallbackSrc !== REMOTE_IMAGE_FALLBACK_SRC
    ) {
      setImageSrc(REMOTE_IMAGE_FALLBACK_SRC);
      setErrorStep(2);
      return;
    }
    setIsLoading(false);
  }, [errorStep, imageSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const imageClassName = useMemo(() => {
    const classes = [className];
    if (isLoading) classes.push('bg-gray-200');
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
    return classes.filter(Boolean).join(' ');
  }, [className, isLoading, onClick]);

  const imageProps = useMemo(() => {
    const baseProps: any = {
      src: imageSrc,
      alt,
      className: imageClassName,
      quality,
      placeholder,
      unoptimized: resolvedUnoptimized,
      onError: handleError,
      onLoad: handleLoad,
      onClick,
    };
    if (priority) {
      baseProps.priority = true;
    } else {
      baseProps.loading = loading;
    }
    if (blurDataURL && placeholder === 'blur') {
      baseProps.blurDataURL = blurDataURL;
    }
    return baseProps;
  }, [
    imageSrc,
    alt,
    imageClassName,
    quality,
    placeholder,
    blurDataURL,
    resolvedUnoptimized,
    priority,
    loading,
    handleError,
    handleLoad,
    onClick,
  ]);

  if (fill) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${isLoading ? 'bg-muted' : ''}`}>
        <Image
          {...imageProps}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={`${imageClassName} object-cover`.trim()}
          {...props}
        />
      </div>
    );
  }

  return (
    <Image {...imageProps} width={width || 400} height={height || 300} sizes={sizes} {...props} />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
