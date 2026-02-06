"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, 
  ThumbsUp, 
  Store, 
  CheckCircle, 
  Search, 
  Send,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { ProductCore } from '@/actions/pdp.actions';

interface Question {
  id: number;
  user_name: string;
  question: string;
  created_at: string;
  helpful_count: number;
  answer?: {
    id: number;
    seller_name: string;
    seller_logo?: string;
    answer: string;
    created_at: string;
    is_official: boolean;
  };
}

// Mock Q&A data
const mockQuestions: Question[] = [
  {
    id: 1,
    user_name: 'Ahmet Y.',
    question: 'Bu ürün su geçirmez mi?',
    created_at: '2025-12-28T10:00:00Z',
    helpful_count: 15,
    answer: {
      id: 1,
      seller_name: 'ModaPlus',
      answer: 'Merhaba, ürünümüz su itici özelliğe sahiptir ancak tamamen su geçirmez değildir. Hafif yağmurda kullanabilirsiniz.',
      created_at: '2025-12-28T14:30:00Z',
      is_official: true,
    },
  },
  {
    id: 2,
    user_name: 'Zeynep K.',
    question: 'Beden ölçüleri tam mı yoksa dar mı kalıyor?',
    created_at: '2025-12-25T08:15:00Z',
    helpful_count: 32,
    answer: {
      id: 2,
      seller_name: 'ModaPlus',
      answer: 'Merhaba, ürün kalıbı normaldir. Beden tablosuna göre seçim yapabilirsiniz. Eğer rahat giyim tercih ediyorsanız bir beden büyük alabilirsiniz.',
      created_at: '2025-12-25T11:00:00Z',
      is_official: true,
    },
  },
  {
    id: 6,
    user_name: 'Ayşe M.',
    question: 'merhaba ben sporda 37 giyiniyorum ama kaşın çorapla falan giyeceğim için 38 mi almalıyım',
    created_at: '2026-01-15T10:00:00Z',
    helpful_count: 12,
    answer: {
      id: 6,
      seller_name: 'MODA DEĞİRMENİ',
      answer: 'Merhaba, teşekkür ederiz. Ürünümüz tam kalıptır, ancak kalın çorap ile giyeceğiniz için 38 numara öneririz. Siyah Cilt renginde 38 numara mevcuttur. 🙏🌸 Keyifli alışverişler dileriz.',
      created_at: '2026-01-15T10:01:00Z',
      is_official: true,
    },
  },
  {
    id: 7,
    user_name: 'Fatma K.',
    question: 'merhaba baldırı sarar mı yoksa salaş bir kalıbı mı var',
    created_at: '2026-01-14T10:00:00Z',
    helpful_count: 8,
    answer: {
      id: 7,
      seller_name: 'MODA DEĞİRMENİ',
      answer: 'Merhaba, ürünümüz streç yapıdadır ve baldırı sararak oturur, salaş bir kalıbı bulunmamaktadır. 🙏🌸 Keyifli alışverişler dileriz.',
      created_at: '2026-01-14T10:01:00Z',
      is_official: true,
    },
  },
  {
    id: 8,
    user_name: 'Zeynep Y.',
    question: 'topuk kaç cm',
    created_at: '2025-12-17T10:00:00Z',
    helpful_count: 15,
    answer: {
      id: 8,
      seller_name: 'MODA DEĞİRMENİ',
      answer: 'Merhaba, ürünümüzün topuk yüksekliği 7 cm\'dir. 🙏🌸 Keyifli alışverişler dileriz.',
      created_at: '2025-12-17T10:01:00Z',
      is_official: true,
    },
  },
];

interface ProductQuestionsClientProps {
  core: ProductCore;
  slug: string;
}

export function ProductQuestionsClient({ core, slug }: ProductQuestionsClientProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [askDialogOpen, setAskDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setQuestions(mockQuestions);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question: Question = {
      id: Date.now(),
      user_name: 'Siz',
      question: newQuestion,
      created_at: new Date().toISOString(),
      helpful_count: 0,
    };
    
    setQuestions(prev => [question, ...prev]);
    setNewQuestion('');
    setAskDialogOpen(false);
  };

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer?.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const answeredCount = questions.filter(q => q.answer).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const category = core.category[core.category.length - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Ana Sayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/category/${category.slug}`}>
                      {category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbLink href={`/product/${slug}`}>
                  {core.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Sorular ve Cevaplar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link 
          href={`/product/${slug}`}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Ürüne Dön
        </Link>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Product & Seller Info */}
          <div className="lg:col-span-3">
            <div className="sticky top-4 space-y-4">
              {/* Product Image & Info */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  <Image
                    src={resolveMediaUrl(core.images[0]?.url || 'https://placehold.co/600x600')}
                    alt={core.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2">{core.title}</h3>
                </div>
              </div>

              {/* Seller Card */}
              {core.vendor_id && (
                <div className="bg-card rounded-xl border overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Satıcı</span>
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-700 text-xs"
                          >
                            <Star className="h-3 w-3 fill-current mr-0.5" />
                            4.8
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4">
                    <Button asChild variant="secondary" className="w-full">
                      <Link href={`/store/${core.vendor_id}`}>
                        Mağazaya Git
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Questions */}
          <div className="lg:col-span-9">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Tüm Ürün Soru ve Cevapları ({questions.length})</h1>
              <p className="text-muted-foreground">{core.title}</p>
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="p-4 md:p-6 border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Soru & Cevap</h2>
                      <p className="text-sm text-muted-foreground">
                        {questions.length} soru, {answeredCount} cevaplandı
                      </p>
                    </div>
                  </div>

                  <Dialog open={askDialogOpen} onOpenChange={setAskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Soru Sor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Satıcıya Soru Sor</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Sorunuz <span className="font-medium text-foreground">satıcıya</span> iletilecektir
                          </span>
                        </div>
                        <Textarea
                          placeholder="Ürün hakkında merak ettiğiniz soruyu yazın..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setAskDialogOpen(false)}>
                            İptal
                          </Button>
                          <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Gönder
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Satıcı Sorularında Ara"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>

                {/* Sort Option */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Önerilen Sıralama</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90" />
                  </div>
                </div>

                {/* Filter by Topic */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Konuya Göre Filtrele</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full"
                    >
                      tümü ({questions.length}) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Stok Durumu (144) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Topuk Boyu (99) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Kalıp (28) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Beden (26) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Taban Özellikleri (18) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Boyut (17) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Uzunluk (13) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Suya Dayanıklılık (11) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Kargo ve Teslimat (8) <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div>
                {filteredQuestions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Henüz soru sorulmamış</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Bu ürün hakkında ilk soruyu sen sor!
                    </p>
                    <Button onClick={() => setAskDialogOpen(true)} size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Soru Sor
                    </Button>
                  </div>
                ) : (
                  filteredQuestions.map((q, index) => {
                    const minutesDiff = q.answer ? Math.floor((new Date(q.answer.created_at).getTime() - new Date(q.created_at).getTime()) / 60000) : 0;
                    return (
                      <div 
                        key={q.id} 
                        className={cn(
                          'p-4 md:p-5',
                          index !== filteredQuestions.length - 1 && 'border-b'
                        )}
                      >
                        {/* Question */}
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 font-semibold text-sm">S</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{q.user_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(q.created_at).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-foreground">{q.question}</p>
                          </div>
                        </div>

                        {/* Answer */}
                        {q.answer && (
                          <div className="flex gap-3 mt-4 ml-11">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <span className="text-primary-foreground font-semibold text-sm">C</span>
                            </div>
                            <div className="flex-1 min-w-0 bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-medium text-primary">{q.answer.seller_name} satıcısının cevabı</span>
                                <span className="text-xs text-muted-foreground">
                                  {minutesDiff} dakika içinde cevaplandı.
                                </span>
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                                {q.answer.answer}
                              </p>
                            </div>
                          </div>
                        )}

                        {!q.answer && (
                          <div className="ml-11 mt-3">
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                              Cevap Bekleniyor
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

