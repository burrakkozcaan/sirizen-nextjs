"use client";

import { useEffect } from 'react';
import { Bell, Package, TrendingDown, Zap, Box } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNotifications, requestNotificationPermission } from '@/contexts/NotificationsContext';
import { toast } from 'sonner';

interface NotificationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationSettingsModal({ open, onOpenChange }: NotificationSettingsModalProps) {
  const { preferences, updatePreferences, permissionStatus, setPermissionStatus } = useNotifications();

  useEffect(() => {
    // Check current permission status on mount
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [setPermissionStatus]);

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        updatePreferences({ browserNotifications: true });
        toast.success('Tarayıcı bildirimleri etkinleştirildi');
      } else if (permission === 'denied') {
        toast.error('Bildirim izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
        updatePreferences({ browserNotifications: false });
      }
    } else {
      updatePreferences({ browserNotifications: false });
      toast.success('Tarayıcı bildirimleri kapatıldı');
    }
  };

  const notificationSettings = [
    {
      id: 'orderUpdates',
      label: 'Sipariş Güncellemeleri',
      description: 'Siparişlerinizin durumu hakkında bildirimler alın',
      icon: Package,
      value: preferences.orderUpdates,
    },
    {
      id: 'priceDrops',
      label: 'Fiyat Düşüşleri',
      description: 'Favori ürünlerinizin fiyatı düştüğünde haberdar olun',
      icon: TrendingDown,
      value: preferences.priceDrops,
    },
    {
      id: 'flashSales',
      label: 'Flaş İndirimler',
      description: 'Sınırlı süreli kampanyalardan anında haberdar olun',
      icon: Zap,
      value: preferences.flashSales,
    },
    {
      id: 'stockAlerts',
      label: 'Stok Bildirimleri',
      description: 'Tükenen ürünler stoğa girdiğinde bildirim alın',
      icon: Box,
      value: preferences.stockAlerts,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </DialogTitle>
          <DialogDescription>
            Hangi bildirimler almak istediğinizi seçin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="browserNotifications" className="font-medium">
                  Tarayıcı Bildirimleri
                </Label>
                <p className="text-sm text-muted-foreground">
                  {permissionStatus === 'denied' 
                    ? 'İzin reddedildi - tarayıcı ayarlarından etkinleştirin'
                    : 'Masaüstü bildirimlerini etkinleştir'}
                </p>
              </div>
            </div>
            <Switch
              id="browserNotifications"
              checked={preferences.browserNotifications && permissionStatus === 'granted'}
              onCheckedChange={handleBrowserNotificationToggle}
              disabled={permissionStatus === 'denied'}
            />
          </div>

          {/* Category Notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Bildirim Kategorileri</h4>
            {notificationSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <setting.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                      {setting.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.value}
                  onCheckedChange={(checked) =>
                    updatePreferences({ [setting.id]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Tamam</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
