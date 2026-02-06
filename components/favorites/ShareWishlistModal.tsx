import { useState, useEffect } from 'react';
import { 
  Share2, 
  Link2, 
  Check, 
  X,
  MessageCircle,
  Facebook,
  Twitter,
  Mail,
  Copy,
  QrCode,
  Send,
  Instagram,
  Heart,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ShareWishlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Product[];
}

export function ShareWishlistModal({ open, onOpenChange, items }: ShareWishlistModalProps) {
  const [copied, setCopied] = useState(false);
  const [listName, setListName] = useState('Favorilerim');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('link');

  // Generate shareable link using base64 encoded product IDs
  const generateShareableLink = () => {
    const productIds = items.map(p => p.id).join(',');
    const encoded = btoa(productIds);
    return `${window.location.origin}/paylasilan-liste/${encoded}`;
  };

  const shareUrl = generateShareableLink();
  const shareTitle = `${listName} - ${items.length} ürün`;
  const shareText = `${listName} listemde ${items.length} harika ürün buldum! Göz atmak ister misin?`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Link kopyalanamadı');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Paylaşıldı!');
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  // Generate QR Code URL using a free QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Pinterest',
      icon: Heart,
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'E-posta',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    },
  ];

  // Calculate total values
  const totalPrice = items.reduce((sum, p) => sum + p.price, 0);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Favori Listeni Paylaş
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* List Name Input */}
          <div className="space-y-2">
            <Label htmlFor="listName">Liste Adı</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Listenize bir isim verin"
              maxLength={50}
            />
          </div>

          {/* Products Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{listName}</p>
              <span className="text-xs text-muted-foreground">
                {items.length} ürün • {formatPrice(totalPrice)}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {items.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted ring-2 ring-background shadow-sm"
                >
                  <img
                    src={product.images[0]?.url || 'https://placehold.co/56x56'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {items.length > 6 && (
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-muted flex items-center justify-center ring-2 ring-background">
                  <span className="text-sm font-medium text-muted-foreground">
                    +{items.length - 6}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Share Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="link" className="gap-1">
                <Link2 className="h-4 w-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-1">
                <Share2 className="h-4 w-4" />
                Sosyal
              </TabsTrigger>
              <TabsTrigger value="qr" className="gap-1">
                <QrCode className="h-4 w-4" />
                QR Kod
              </TabsTrigger>
            </TabsList>

            {/* Link Tab */}
            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="text-sm bg-muted font-mono text-xs"
                />
                <Button
                  variant={copied ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Native Share (Mobile) */}
              {'share' in navigator && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Diğer Uygulamalarla Paylaş
                </Button>
              )}
            </TabsContent>

            {/* Social Tab */}
            <TabsContent value="social" className="mt-4">
              <div className="grid grid-cols-3 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      social.color,
                      'text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105 hover:shadow-lg'
                    )}
                  >
                    <social.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </TabsContent>

            {/* QR Code Tab */}
            <TabsContent value="qr" className="mt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Bu QR kodu telefonunuzla tarayarak listeyi paylaşabilirsiniz
                </p>
                <a 
                  href={qrCodeUrl} 
                  download={`${listName.replace(/\s+/g, '-')}-qr.png`}
                  className="inline-flex"
                >
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    QR Kodu İndir
                  </Button>
                </a>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center border-t pt-4">
            Bu linki alan herkes favori listenizi görüntüleyebilir ve ürünleri sepetine ekleyebilir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
