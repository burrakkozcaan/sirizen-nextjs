"use client";

import { useState } from 'react';
import { Camera, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ReviewPhoto {
  id: number;
  url: string;
  reviewId: number;
  userName: string;
}

interface UserReviewPhotosProps {
  photos: ReviewPhoto[];
  totalCount?: number;
  className?: string;
}

// Mock review photos for demo
const mockReviewPhotos: ReviewPhoto[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200', reviewId: 1, userName: 'Ayşe K.' },
  { id: 2, url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200', reviewId: 2, userName: 'Fatma S.' },
  { id: 3, url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=200', reviewId: 3, userName: 'Zeynep A.' },
  { id: 4, url: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=200', reviewId: 4, userName: 'Elif T.' },
  { id: 5, url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200', reviewId: 5, userName: 'Merve D.' },
  { id: 6, url: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=200', reviewId: 6, userName: 'Selin Y.' },
];

export function UserReviewPhotos({ photos = mockReviewPhotos, totalCount = 156, className }: UserReviewPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ReviewPhoto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayPhotos = photos.slice(0, 6);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
    setSelectedPhoto(photos[currentIndex > 0 ? currentIndex - 1 : photos.length - 1]);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
    setSelectedPhoto(photos[currentIndex < photos.length - 1 ? currentIndex + 1 : 0]);
  };

  return (
    <div className={cn('bg-card rounded-xl border p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Kullanıcı Fotoğrafları</h2>
          <span className="text-sm text-muted-foreground">({totalCount})</span>
        </div>
        <Button variant="ghost" className="text-primary gap-1">
          Tümünü Gör
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {displayPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => {
              setSelectedPhoto(photo);
              setCurrentIndex(index);
            }}
            className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden hover:opacity-80 transition-opacity relative group"
          >
            <img
              src={photo.url}
              alt={`Review by ${photo.userName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
        
        {totalCount > 6 && (
          <button className="flex-shrink-0 w-24 h-24 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <span className="text-sm font-medium text-muted-foreground">
              +{totalCount - 6}
            </span>
          </button>
        )}
      </div>

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0" aria-describedby={selectedPhoto ? "photo-viewer-description" : undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>Fotoğraf Görüntüleyici</DialogTitle>
            <DialogDescription id="photo-viewer-description">
              {selectedPhoto ? `${selectedPhoto.userName} tarafından paylaşılan fotoğraf` : ''}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
          
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.url.replace('w=200', 'w=800')}
                alt={`Review by ${selectedPhoto.userName}`}
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm">{selectedPhoto.userName}</p>
              </div>
              
              {/* Navigation */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
