"use client";

import { useState } from 'react';
import { Star, Camera, X, Send, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StarRatingInput } from '@/components/review/StarRatingInput';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function WriteReviewModal({ open, onOpenChange, product }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error('En fazla 5 fotoğraf yükleyebilirsiniz');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} geçerli bir resim dosyası değil`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Lütfen bir puan verin');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Yorum en az 10 karakter olmalıdır');
      return;
    }

    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Değerlendirmeniz gönderildi!');
  };

  const handleClose = () => {
    if (submitted) {
      setRating(0);
      setTitle('');
      setComment('');
      setPhotos([]);
      setPhotoPreviews([]);
      setSubmitted(false);
    }
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Teşekkürler!</h2>
            <p className="text-muted-foreground mb-6">
              Değerlendirmeniz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.
            </p>
            <Button onClick={handleClose}>Tamam</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Değerlendirme Yaz
          </DialogTitle>
          <DialogDescription>
            Ürün hakkındaki deneyimlerinizi paylaşın ve diğer müşterilere yardımcı olun.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Product Preview */}
          <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
            <img
              src={product.images[0]?.url}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{typeof product.brand === 'string' ? product.brand : product.brand?.name || ''}</p>
              <p className="font-medium line-clamp-2">{product.name}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">Bu ürünü nasıl değerlendirirsiniz?</p>
            <div className="flex justify-center">
              <StarRatingInput
                value={rating}
                onChange={setRating}
                size="lg"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Başlık (opsiyonel)</Label>
            <Input
              id="review-title"
              placeholder="Değerlendirmenize bir başlık ekleyin"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              Yorumunuz <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>En az 10 karakter</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          <Separator />

          {/* Photo Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fotoğraf Ekle (opsiyonel)</Label>
              <span className="text-xs text-muted-foreground">{photos.length}/5</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <Button 
            className="w-full gap-2" 
            onClick={handleSubmit}
            disabled={rating === 0 || comment.length < 10 || submitting}
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Değerlendirmeyi Gönder
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
