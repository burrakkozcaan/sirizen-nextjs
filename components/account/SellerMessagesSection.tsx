"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  Package,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUserQuestions } from "@/actions/question.actions";
import { resolveMediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  answer: string | null;
  answered_by_vendor: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    title: string;
    slug: string;
    images?: Array<{ id: number; url: string }>;
  };
  vendor?: {
    id: number;
    name: string;
    slug: string;
  };
}

export function SellerMessagesSection() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user-questions"],
    queryFn: async () => {
      const result = await getUserQuestions();
      return result.data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const questions: Question[] = data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-primary font-medium mb-4">
          Henüz satıcıya soru sormadınız.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Ürün sayfalarından satıcıya soru sorabilirsiniz.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">Alışverişe Devam Et</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Satıcı Mesajlarım</h2>
        <Badge variant="secondary">{questions.length} Soru</Badge>
      </div>

      {questions.map((question) => (
        <Card key={question.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Product Image */}
              {question.product?.images?.[0] && (
                <Link
                  href={`/product/${question.product.slug}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={resolveMediaUrl(
                        question.product.images[0].url ||
                          question.product.images[0]
                      )}
                      alt={question.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
              )}

              <div className="flex-1 min-w-0">
                {/* Product Title */}
                {question.product && (
                  <Link
                    href={`/product/${question.product.slug}`}
                    className="hover:text-primary"
                  >
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">
                      {question.product.title}
                    </h3>
                  </Link>
                )}

                {/* Vendor Name */}
                {question.vendor && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Satıcı: {question.vendor.name}
                  </p>
                )}

                {/* Question */}
                <div className="mb-3">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Sizin Sorunuz:</p>
                      <p className="text-sm text-foreground">{question.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(question.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {question.answer ? (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            Satıcı Cevabı:
                          </p>
                          {question.answered_by_vendor && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs"
                            >
                              Onaylandı
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-green-900 dark:text-green-100">
                          {question.answer}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          {formatDate(question.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-900 dark:text-yellow-100">
                        Cevap bekleniyor...
                      </p>
                    </div>
                  </div>
                )}

                {/* View Product Link */}
                {question.product && (
                  <div className="mt-3 pt-3 border-t">
                    <Link
                      href={`/product/${question.product.slug}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Ürünü Görüntüle
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

