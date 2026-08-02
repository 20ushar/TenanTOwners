import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../lib/utils';

interface Media {
  type: 'image' | 'video';
  url: string;
}

interface ImageSliderProps {
  media: Media[];
  className?: string;
}

export function ImageSlider({ media, className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = useRef(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    if (isHovered || currentIndex > 0) {
      setHasInteracted(true);
    }
  }, [isHovered, currentIndex]);

  useEffect(() => {
    if (!isHovered || isTouchDevice.current || media.length <= 1) {
      if (!isHovered && !isTouchDevice.current) {
        setCurrentIndex(0);
      }
      return;
    }
    
    const currentMedia = media[currentIndex];
    if (currentMedia?.type === 'video') return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [currentIndex, isHovered, media.length]);

  if (!media || media.length === 0) {
    return <div className={`bg-slate-200 dark:bg-slate-700 ${className}`} />;
  }

  const handlePrevious = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <div 
      className={`relative group overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={media.length > 1 ? onTouchStart : undefined}
      onTouchMove={media.length > 1 ? onTouchMove : undefined}
      onTouchEnd={media.length > 1 ? onTouchEndEvent : undefined}
      style={{ touchAction: 'pan-y' }}
    >
      {media.map((item, index) => {
        const isActive = currentIndex === index;
        const shouldRender = index === 0 || hasInteracted || isActive;

        if (!shouldRender) return null;

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            {item.type === 'video' ? (
              <div className="w-full h-full bg-black flex items-center justify-center relative video-container">
                {isActive && (
                  <video
                    src={item.url}
                    autoPlay
                    controls
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <img
                src={optimizeCloudinaryUrl(item.url, 1024)}
                alt={`Slide ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                className={`w-full h-full object-cover transition-transform duration-500 ${isHovered && !isTouchDevice.current ? 'scale-105' : 'scale-100'}`}
              />
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 hover:bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:block"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/70 hover:bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden md:block"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
            {media.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white dark:bg-slate-800' : 'bg-white dark:bg-slate-800/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
