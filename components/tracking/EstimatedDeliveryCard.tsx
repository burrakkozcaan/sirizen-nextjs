import { useState, useEffect } from 'react';
import { Clock, Calendar, Truck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimatedDeliveryCardProps {
  estimatedDate: string;
  status: string;
  className?: string;
}

export function EstimatedDeliveryCard({ estimatedDate, status, className }: EstimatedDeliveryCardProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isDelivered, setIsDelivered] = useState(false);

  useEffect(() => {
    setIsDelivered(status === 'delivered');
    
    if (status === 'delivered') return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const delivery = new Date(estimatedDate);
      const diff = delivery.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [estimatedDate, status]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (isDelivered) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <MapPin className="h-7 w-7" />
          </div>
          <div>
            <p className="text-green-100 text-sm">Teslim Durumu</p>
            <p className="text-2xl font-bold">Teslim Edildi! ✓</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-primary to-orange-600 text-white rounded-xl p-6",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm">Tahmini Teslimat</p>
            <p className="font-semibold">{formatDate(estimatedDate)}</p>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="bg-black/20 rounded-lg p-4">
        <p className="text-sm text-center mb-3 text-primary-foreground/80">
          Teslimata kalan süre
        </p>
        <div className="flex justify-center gap-3">
          <TimeBlock value={timeLeft.hours} label="Saat" />
          <span className="text-2xl font-bold self-start mt-1">:</span>
          <TimeBlock value={timeLeft.minutes} label="Dakika" />
          <span className="text-2xl font-bold self-start mt-1">:</span>
          <TimeBlock value={timeLeft.seconds} label="Saniye" />
        </div>
      </div>

      {/* Delivery Window */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-foreground/80">
        <Clock className="h-4 w-4" />
        <span>Teslimat saati: 09:00 - 18:00</span>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px]">
        <span className="text-2xl font-bold font-mono">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <p className="text-[10px] mt-1 text-primary-foreground/70">{label}</p>
    </div>
  );
}
