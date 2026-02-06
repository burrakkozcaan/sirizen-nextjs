"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  ThumbsUp, 
  Store, 
  CheckCircle, 
  Search, 
  Send,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { askQuestion } from '@/actions/question.actions';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

interface ProductQAProps {
  productId: number;
  vendorName?: string;
  productSlug?: string;
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
    id: 3,
    user_name: 'Mehmet S.',
    question: 'Kumaş kalitesi nasıl? Kaç yıkamada deforme olur?',
    created_at: '2025-12-20T16:45:00Z',
    helpful_count: 8,
    answer: {
      id: 3,
      seller_name: 'ModaPlus',
      answer: 'Merhaba, ürünümüz premium kalite pamuklu kumaştan üretilmiştir. 30 derecede yıkama ve düşük ısıda ütüleme önerilir. Doğru bakım koşullarında uzun ömürlü kullanım sağlar.',
      created_at: '2025-12-21T09:00:00Z',
      is_official: true,
    },
  },
  {
    id: 4,
    user_name: 'Elif D.',
    question: 'Ürün resimdeki gibi mi? Renk farkı var mı?',
    created_at: '2025-12-18T12:00:00Z',
    helpful_count: 24,
    answer: {
      id: 4,
      seller_name: 'ModaPlus',
      answer: 'Merhaba, ürün fotoğrafları stüdyo ortamında çekilmiştir. Ekran ayarlarına göre küçük renk farklılıkları olabilir ancak genel görünüm fotoğraftaki gibidir.',
      created_at: '2025-12-18T15:30:00Z',
      is_official: true,
    },
  },
  {
    id: 5,
    user_name: 'Can B.',
    question: 'Kargo ne kadar sürede gelir?',
    created_at: '2025-12-15T09:30:00Z',
    helpful_count: 5,
  },
];

type FilterType = 'all' | 'answered' | 'unanswered';

interface QuestionGroup {
  name: string;
  count: number;
  filter: string;
}

const questionGroups: QuestionGroup[] = [
  { name: 'Stok Durumu', count: 144, filter: 'stok' },
  { name: 'Topuk Boyu', count: 99, filter: 'topuk' },
  { name: 'Kalıp', count: 28, filter: 'kalip' },
  { name: 'Beden', count: 26, filter: 'beden' },
  { name: 'Taban Özellikleri', count: 18, filter: 'taban' },
  { name: 'Boyut', count: 17, filter: 'boyut' },
  { name: 'Uzunluk', count: 13, filter: 'uzunluk' },
  { name: 'Suya Dayanıklılık', count: 11, filter: 'su' },
  { name: 'Kargo ve Teslimat', count: 8, filter: 'kargo' },
];

export function ProductQA({ productId, vendorName, productSlug }: ProductQAProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [askDialogOpen, setAskDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setQuestions(mockQuestions);
      setLoading(false);
    };
    fetchQuestions();
  }, [productId]);

  const handleMarkHelpful = (questionId: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, helpful_count: q.helpful_count + 1 } : q
      )
    );
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    if (!isAuthenticated) {
      toast.error("Soru sormak için giriş yapmanız gerekiyor");
      router.push(`/login?redirect=/product/${productSlug}#qa`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await askQuestion(productId, newQuestion);
      if (result.success) {
        toast.success("Soru başarıyla gönderildi");
        setNewQuestion('');
        setAskDialogOpen(false);
        // Refresh questions list
        router.refresh();
      } else {
        toast.error(result.error || "Soru gönderilirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      toast.error("Soru gönderilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions
    .filter(q => {
      if (filter === 'answered') return q.answer;
      if (filter === 'unanswered') return !q.answer;
      return true;
    })
    .filter(q => {
      if (selectedGroup) {
        const groupKeywords: Record<string, string[]> = {
          stok: ['stok', 'mevcut', 'var mı', 'bulunuyor'],
          topuk: ['topuk', 'yükseklik'],
          kalip: ['kalıp', 'dar', 'geniş', 'bol'],
          beden: ['beden', 'numara', 'ölçü'],
          taban: ['taban', 'alt', 'dış'],
          boyut: ['boyut', 'büyük', 'küçük'],
          uzunluk: ['uzunluk', 'uzun', 'kısa'],
          su: ['su', 'su geçirmez', 'waterproof', 'yağmur'],
          kargo: ['kargo', 'teslimat', 'gönderim', 'süre'],
        };
        const keywords = groupKeywords[selectedGroup] || [];
        const questionText = q.question.toLowerCase();
        return keywords.some(keyword => questionText.includes(keyword));
      }
      return true;
    })
    .filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer?.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const displayedQuestions = filteredQuestions.slice(0, 5);
  const answeredCount = questions.filter(q => q.answer).length;
  const unansweredCount = questions.filter(q => !q.answer).length;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
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
                    Sorunuz <span className="font-medium text-foreground">{vendorName || 'satıcıya'}</span> iletilecektir
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
                  <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim() || isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter by Topic */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Konuya Göre Filtrele</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedGroup === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedGroup(null);
                setFilter('all');
              }}
              className="rounded-full"
            >
              Tümü ({questions.length}) <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            {questionGroups.map((group) => (
              <Button
                key={group.filter}
                variant={selectedGroup === group.filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedGroup(group.filter);
                  setFilter('all');
                }}
                className="rounded-full"
              >
                {group.name} ({group.count}) <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sorularda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {/* Questions List */}
      <div>
        {displayedQuestions.length === 0 ? (
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
          displayedQuestions.map((q, index) => {
            const isExpanded = expandedQuestions.has(q.id);
            return (
              <div 
                key={q.id} 
                className={cn(
                  'p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors',
                  index !== displayedQuestions.length - 1 && 'border-b'
                )}
                onClick={() => {
                  const newExpanded = new Set(expandedQuestions);
                  if (isExpanded) {
                    newExpanded.delete(q.id);
                  } else {
                    newExpanded.add(q.id);
                  }
                  setExpandedQuestions(newExpanded);
                }}
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
                {isExpanded && q.answer && (
                  <div className="flex gap-3 mt-4 ml-11" onClick={(e) => e.stopPropagation()}>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground font-semibold text-sm">C</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/10 text-primary text-xs hover:bg-primary/20">
                          <Store className="h-3 w-3 mr-1" />
                          Satıcı
                        </Badge>
                        <span className="text-sm font-medium">{q.answer.seller_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.answer.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {q.answer.answer}
                      </p>
                    </div>
                  </div>
                )}

                {isExpanded && !q.answer && (
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

      {/* Show More */}
      {filteredQuestions.length > 5 && productSlug && (
        <div className="p-4 border-t bg-muted/30">
          <Link 
            href={`/product/${productSlug}/sorular`}
            className="w-full"
          >
            <Button 
              variant="ghost" 
              className="w-full text-primary hover:text-primary"
            >
              Tüm Soruları Gör ({filteredQuestions.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
