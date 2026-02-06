import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, 
  CheckCircle, 
  Truck, 
  Navigation,
  Home,
  PackageCheck,
  Clock,
  Zap
} from 'lucide-react';

interface TimelineStep {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  time?: string;
}

interface AnimatedTimelineProps {
  currentStatus: string;
  className?: string;
}

const steps: TimelineStep[] = [
  { 
    key: 'pending', 
    label: 'Sipariş Alındı', 
    description: 'Siparişiniz başarıyla oluşturuldu',
    icon: Package,
    time: '10:00'
  },
  { 
    key: 'confirmed', 
    label: 'Onaylandı', 
    description: 'Ödeme onaylandı, hazırlanıyor',
    icon: CheckCircle,
    time: '10:15'
  },
  { 
    key: 'processing', 
    label: 'Hazırlanıyor', 
    description: 'Ürünleriniz paketleniyor',
    icon: PackageCheck,
    time: '14:30'
  },
  { 
    key: 'shipped', 
    label: 'Kargoya Verildi', 
    description: 'Kargo firmasına teslim edildi',
    icon: Truck,
    time: '16:45'
  },
  { 
    key: 'in_transit', 
    label: 'Yolda', 
    description: 'Dağıtım merkezine ulaştı',
    icon: Navigation,
    time: '22:30'
  },
  { 
    key: 'delivered', 
    label: 'Teslim Edildi', 
    description: 'Siparişiniz teslim edildi',
    icon: Home,
    time: '14:32'
  },
];

export function AnimatedTimeline({ currentStatus, className }: AnimatedTimelineProps) {
  const [animatedStep, setAnimatedStep] = useState(-1);
  
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  
  useEffect(() => {
    // Animate steps one by one
    steps.forEach((_, index) => {
      if (index <= currentIndex) {
        setTimeout(() => {
          setAnimatedStep(index);
        }, index * 200);
      }
    });
  }, [currentIndex]);

  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isAnimated = index <= animatedStep;
        const Icon = step.icon;
        
        return (
          <div key={step.key} className="relative flex gap-4">
            {/* Timeline Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[18px] top-10 w-0.5 h-[calc(100%-16px)]">
                <div className={cn(
                  "w-full h-full transition-all duration-500 ease-out",
                  isCompleted && isAnimated ? "bg-primary" : "bg-muted"
                )} 
                style={{
                  transform: isAnimated ? 'scaleY(1)' : 'scaleY(0)',
                  transformOrigin: 'top'
                }}
                />
              </div>
            )}
            
            {/* Icon */}
            <div className={cn(
              "relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
              isCurrent && isAnimated
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" 
                : isCompleted && isAnimated
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground",
              !isAnimated && "opacity-50 scale-90"
            )}>
              {isCurrent && isAnimated && (
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
              )}
              <Icon className="h-4 w-4 relative z-10" />
            </div>
            
            {/* Content */}
            <div className={cn(
              "flex-1 pb-8 transition-all duration-300",
              !isAnimated && "opacity-50"
            )}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn(
                    "font-medium transition-colors",
                    isCurrent && "text-primary"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
                {isCompleted && step.time && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </div>
                )}
              </div>
              
              {/* Live indicator for current step */}
              {isCurrent && currentStatus !== 'delivered' && (
                <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                  <Zap className="h-3 w-3" />
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Canlı Takip
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
