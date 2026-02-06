"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';

interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  order?: number;
}

interface ProductMedia {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  discountPercentage?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onImageClick?: (index: number) => void;
  videoUrl?: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  productName,
  discountPercentage,
  isFavorite,
  onToggleFavorite,
  onImageClick,
  videoUrl,
  className,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Create media array with video as last item if exists
  const mediaItems: ProductMedia[] = [
    ...images.map(img => ({ 
      id: img.id, 
      type: 'image' as const, 
      url: img.url, 
      alt: img.alt 
    })),
    ...(videoUrl ? [{
      id: -1,
      type: 'video' as const,
      url: videoUrl,
      thumbnail: images[0]?.url,
    }] : [])
  ];

  const currentMedia = mediaItems[selectedIndex];
  const isCurrentVideo = currentMedia?.type === 'video';

  useEffect(() => {
    if (isCurrentVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isCurrentVideo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isZoomed || isCurrentVideo) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setSelectedIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn('flex gap-3', className)}>
      {/* Vertical Thumbnails */}
      <div className="hidden md:flex flex-col gap-2 w-16">
        {mediaItems.map((media, index) => (
          <button
            key={media.id}
            onClick={() => {
              setSelectedIndex(index);
              setIsPlaying(false);
            }}
            className={cn(
              'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative',
              selectedIndex === index
                ? 'border-primary ring-1 ring-primary'
                : 'border-transparent hover:border-muted-foreground/30'
            )}
          >
            {media.type === 'video' ? (
              <>
                <Image
                  src={resolveMediaUrl(media.thumbnail || '/placeholder.svg')}
                  alt="Video thumbnail"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
              </>
            ) : (
              <Image
                src={resolveMediaUrl(media.url)}
                alt={media.alt || `${productName} ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Image/Video */}
      <div className="flex-1 relative group">
        <div
          ref={imageContainerRef}
          className={cn(
            'relative aspect-square bg-white rounded-xl overflow-hidden',
            !isCurrentVideo && 'cursor-zoom-in',
            !isCurrentVideo && isZoomed && 'cursor-zoom-out'
          )}
          onMouseEnter={() => !isCurrentVideo && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {isCurrentVideo ? (
            <div className="relative w-full h-full" onClick={handleVideoClick}>
              <video
                ref={videoRef}
                src={currentMedia.url}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
              />
              
              {/* Video Controls Overlay */}
              <div className={cn(
                'absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity',
                isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
              )}>
                <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-foreground" />
                  ) : (
                    <Play className="h-8 w-8 text-foreground ml-1" />
                  )}
                </div>
              </div>

              {/* Mute Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <Image
              src={resolveMediaUrl(currentMedia?.url || '/placeholder.svg')}
              alt={currentMedia?.alt || productName}
              fill
              className={cn(
                'object-cover transition-transform duration-200',
                isZoomed && 'scale-150'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              onClick={() => onImageClick?.(selectedIndex)}
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-0 z-10 flex flex-col gap-2 pointer-events-none">
            <div className="bg-[#16be48] text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-r-md">
              <span className='w-4 h-4 bg-white/20 rounded-full flex items-center justify-center'>⚡</span>
              HIZLI TESLİMAT
            </div>
            <div className="bg-[#e6e6e6] text-black text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-r-md border border-gray-300">
              KUPONLU ÜRÜN
            </div>
            <div className="bg-white rounded-full shadow-md w-16 h-16 flex flex-col items-center justify-center text-center border-2 border-orange-500 absolute top-12 left-2 rotate-[-15deg]">
              <span className="text-[10px] font-bold text-orange-500 leading-tight">EN ÇOK</span>
              <span className="text-xs font-black text-orange-500 leading-tight">SATAN</span>
            </div>
          </div>

          {/* Discount Badge */}
          {discountPercentage && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm px-3 py-1 z-20">
              %{discountPercentage} İNDİRİM
            </Badge>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition pointer-events-auto" onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}>
              <Heart className={cn('w-5 h-5 text-gray-500', isFavorite && 'fill-red-500 text-red-500')} />
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Media Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
            {isCurrentVideo && <Play className="h-3 w-3" />}
            {selectedIndex + 1} / {mediaItems.length}
          </div>
        </div>

        {/* Mobile Thumbnails */}
        <div className="flex md:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide pb-2">
          {mediaItems.map((media, index) => (
            <button
              key={media.id}
              onClick={() => {
                setSelectedIndex(index);
                setIsPlaying(false);
              }}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent'
              )}
            >
              {media.type === 'video' ? (
                <>
                  <Image
                    src={resolveMediaUrl(media.thumbnail || '/placeholder.svg')}
                    alt="Video"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </>
              ) : (
                <Image
                  src={resolveMediaUrl(media.url)}
                  alt={media.alt || `${productName} ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

