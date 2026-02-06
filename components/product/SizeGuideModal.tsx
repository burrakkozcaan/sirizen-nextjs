"use client";

import { X, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SizeGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: 'clothing' | 'shoes' | 'accessories';
}

const clothingSizes = {
  women: [
    { size: 'XS', eu: '32-34', us: '0-2', uk: '4-6', bust: '78-82', waist: '60-64', hips: '86-90' },
    { size: 'S', eu: '36-38', us: '4-6', uk: '8-10', bust: '82-86', waist: '64-68', hips: '90-94' },
    { size: 'M', eu: '38-40', us: '8-10', uk: '10-12', bust: '86-90', waist: '68-72', hips: '94-98' },
    { size: 'L', eu: '40-42', us: '10-12', uk: '12-14', bust: '90-94', waist: '72-76', hips: '98-102' },
    { size: 'XL', eu: '42-44', us: '12-14', uk: '14-16', bust: '94-98', waist: '76-80', hips: '102-106' },
    { size: 'XXL', eu: '44-46', us: '14-16', uk: '16-18', bust: '98-102', waist: '80-84', hips: '106-110' },
  ],
  men: [
    { size: 'XS', eu: '44', us: '34', uk: '34', chest: '86-89', waist: '71-74', hips: '86-89' },
    { size: 'S', eu: '46-48', us: '36-38', uk: '36-38', chest: '89-97', waist: '74-82', hips: '89-97' },
    { size: 'M', eu: '48-50', us: '38-40', uk: '38-40', chest: '97-105', waist: '82-90', hips: '97-105' },
    { size: 'L', eu: '50-52', us: '40-42', uk: '40-42', chest: '105-113', waist: '90-98', hips: '105-113' },
    { size: 'XL', eu: '52-54', us: '42-44', uk: '42-44', chest: '113-121', waist: '98-106', hips: '113-121' },
    { size: 'XXL', eu: '54-56', us: '44-46', uk: '44-46', chest: '121-129', waist: '106-114', hips: '121-129' },
  ],
};

const shoeSizes = [
  { eu: '36', us_women: '5.5', us_men: '-', uk: '3.5', cm: '22.5' },
  { eu: '37', us_women: '6', us_men: '-', uk: '4', cm: '23' },
  { eu: '38', us_women: '7', us_men: '5.5', uk: '5', cm: '24' },
  { eu: '39', us_women: '8', us_men: '6.5', uk: '6', cm: '24.5' },
  { eu: '40', us_women: '9', us_men: '7', uk: '6.5', cm: '25' },
  { eu: '41', us_women: '9.5', us_men: '8', uk: '7', cm: '26' },
  { eu: '42', us_women: '10', us_men: '8.5', uk: '8', cm: '26.5' },
  { eu: '43', us_women: '11', us_men: '9.5', uk: '9', cm: '27.5' },
  { eu: '44', us_women: '12', us_men: '10', uk: '9.5', cm: '28' },
  { eu: '45', us_women: '-', us_men: '11', uk: '10.5', cm: '29' },
];

export function SizeGuideModal({
  open,
  onOpenChange,
  category = 'clothing',
}: SizeGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5 text-primary" />
            Beden Tablosu
          </DialogTitle>
          <DialogDescription>
            Doğru beden seçimi için ölçü tablosunu kontrol edin
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4 md:p-6 pt-4">
            <Tabs defaultValue="women" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="women">Kadın</TabsTrigger>
                <TabsTrigger value="men">Erkek</TabsTrigger>
                <TabsTrigger value="shoes">Ayakkabı</TabsTrigger>
              </TabsList>

              <TabsContent value="women" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ölçüler santimetre (cm) cinsindendir. Doğru beden seçimi için vücut ölçülerinizi alın.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left font-medium">Beden</th>
                        <th className="border p-2 text-left font-medium">EU</th>
                        <th className="border p-2 text-left font-medium">US</th>
                        <th className="border p-2 text-left font-medium">UK</th>
                        <th className="border p-2 text-left font-medium">Göğüs</th>
                        <th className="border p-2 text-left font-medium">Bel</th>
                        <th className="border p-2 text-left font-medium">Kalça</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clothingSizes.women.map((row, idx) => (
                        <tr key={row.size} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="border p-2 font-semibold">{row.size}</td>
                          <td className="border p-2">{row.eu}</td>
                          <td className="border p-2">{row.us}</td>
                          <td className="border p-2">{row.uk}</td>
                          <td className="border p-2">{row.bust}</td>
                          <td className="border p-2">{row.waist}</td>
                          <td className="border p-2">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* How to measure */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Nasıl Ölçü Alınır?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Göğüs:</span>
                      Göğsün en geniş noktasından yatay olarak ölçün.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Bel:</span>
                      Belin en dar noktasından (göbek deliği hizasından biraz yukarı) ölçün.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Kalça:</span>
                      Kalçanın en geniş noktasından yatay olarak ölçün.
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="men" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ölçüler santimetre (cm) cinsindendir. Doğru beden seçimi için vücut ölçülerinizi alın.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left font-medium">Beden</th>
                        <th className="border p-2 text-left font-medium">EU</th>
                        <th className="border p-2 text-left font-medium">US</th>
                        <th className="border p-2 text-left font-medium">UK</th>
                        <th className="border p-2 text-left font-medium">Göğüs</th>
                        <th className="border p-2 text-left font-medium">Bel</th>
                        <th className="border p-2 text-left font-medium">Kalça</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clothingSizes.men.map((row, idx) => (
                        <tr key={row.size} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="border p-2 font-semibold">{row.size}</td>
                          <td className="border p-2">{row.eu}</td>
                          <td className="border p-2">{row.us}</td>
                          <td className="border p-2">{row.uk}</td>
                          <td className="border p-2">{row.chest}</td>
                          <td className="border p-2">{row.waist}</td>
                          <td className="border p-2">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Nasıl Ölçü Alınır?</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Göğüs:</span>
                      Göğsün en geniş noktasından, koltuk altından geçecek şekilde ölçün.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Bel:</span>
                      Göbek deliği hizasından beli ölçün.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-medium text-foreground shrink-0">Kalça:</span>
                      Kalçanın en geniş noktasından yatay olarak ölçün.
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="shoes" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ayak uzunluğunuzu ölçerek doğru numarayı bulabilirsiniz.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left font-medium">EU</th>
                        <th className="border p-2 text-left font-medium">US Kadın</th>
                        <th className="border p-2 text-left font-medium">US Erkek</th>
                        <th className="border p-2 text-left font-medium">UK</th>
                        <th className="border p-2 text-left font-medium">Ayak (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shoeSizes.map((row, idx) => (
                        <tr key={row.eu} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="border p-2 font-semibold">{row.eu}</td>
                          <td className="border p-2">{row.us_women}</td>
                          <td className="border p-2">{row.us_men}</td>
                          <td className="border p-2">{row.uk}</td>
                          <td className="border p-2">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-3">Ayak Uzunluğunuzu Nasıl Ölçersiniz?</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Bir kağıdı düz zemine koyun ve ayağınızı üzerine basın.</li>
                    <li>Topuğunuzu ve en uzun parmağınızı işaretleyin.</li>
                    <li>İki işaret arasındaki mesafeyi ölçün.</li>
                    <li>Her iki ayağınızı da ölçün ve büyük olanı kullanın.</li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>

            {/* Tip */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-primary">İpucu:</span>{' '}
                Bedenler arasında kaldıysanız, rahat bir kalıp tercih ediyorsanız büyük bedeni seçin. 
                Dar kesim için küçük bedeni tercih edebilirsiniz.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
