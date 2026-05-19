'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Image from 'next/image';

/** Local SVG + remote backup when external images fail to load */
export const IMAGE_FALLBACK_SRC = '/images/image-fallback.svg';
const REMOTE_IMAGE_FALLBACK_SRC =
  'https://images.unsplash.com/photo-1612817288484-6f916f1975b6?auto=format&fit=crop&w=1600&q=80';

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
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [errorStep, setErrorStep] = useState(0);

    useEffect(() => {
        setImageSrc(src);
        setIsLoading(true);
        setErrorStep(0);
    }, [src]);

    const isExternalUrl = useMemo(() => typeof imageSrc === 'string' && imageSrc.startsWith('http'), [imageSrc]);
    const resolvedUnoptimized = unoptimized || isExternalUrl;

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
    }, [imageSrc, alt, imageClassName, quality, placeholder, blurDataURL, resolvedUnoptimized, priority, loading, handleError, handleLoad, onClick]);

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
        <Image
            {...imageProps}
            width={width || 400}
            height={height || 300}
            sizes={sizes}
            {...props}
        />
    );
});

AppImage.displayName = 'AppImage';

export default AppImage;