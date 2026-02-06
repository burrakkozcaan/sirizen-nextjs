"use client";

import { useState } from "react";
import { Calendar, User, Clock, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  "Tümü",
  "E-Ticaret",
  "Moda",
  "Teknoloji",
  "Yaşam",
  "Girişimcilik",
];

const blogPosts = [
  {
    id: 1,
    title: "2024 Moda Trendleri: Bu Sezon Neler Giyeceğiz?",
    excerpt:
      "Yeni sezonun en popüler moda trendlerini ve stillerini keşfedin. Gardırobunuzu yenilemek için ipuçları.",
    category: "Moda",
    author: "Ayşe Yılmaz",
    date: "15 Ocak 2024",
    readTime: "5 dk",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
  },
  {
    id: 2,
    title: "E-Ticarette Sürdürülebilirlik: Çevre Dostu Alışveriş",
    excerpt:
      "Sürdürülebilir e-ticaret uygulamaları ve çevre dostu alışveriş alışkanlıkları hakkında bilmeniz gerekenler.",
    category: "E-Ticaret",
    author: "Mehmet Kaya",
    date: "12 Ocak 2024",
    readTime: "7 dk",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
  },
  {
    id: 3,
    title: "Akıllı Ev Teknolojileri: Geleceğin Evleri",
    excerpt:
      "Evlerimizi dönüştüren akıllı teknolojiler ve IoT cihazları hakkında kapsamlı bir rehber.",
    category: "Teknoloji",
    author: "Can Demir",
    date: "10 Ocak 2024",
    readTime: "6 dk",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400",
  },
  {
    id: 4,
    title: "Ev Dekorasyonunda Minimalizm",
    excerpt:
      "Az çoktur felsefesiyle evinizi düzenleyin. Minimalist dekorasyon önerileri ve ilham veren fikirler.",
    category: "Yaşam",
    author: "Zeynep Arslan",
    date: "8 Ocak 2024",
    readTime: "4 dk",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400",
  },
  {
    id: 5,
    title: "Girişimcilik Yolculuğu: Başarı Hikayeleri",
    excerpt:
      "Türkiye'nin başarılı girişimcilerinden ilham verici hikayeler ve öğrenilecek dersler.",
    category: "Girişimcilik",
    author: "Ali Öztürk",
    date: "5 Ocak 2024",
    readTime: "8 dk",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  {
    id: 6,
    title: "Online Alışverişte Güvenlik İpuçları",
    excerpt:
      "İnternetten güvenli alışveriş yapmanın yolları ve dikkat etmeniz gereken noktalar.",
    category: "E-Ticaret",
    author: "Selin Yıldız",
    date: "3 Ocak 2024",
    readTime: "5 dk",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "Tümü" || post.category === activeCategory;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            E-ticaret, moda, teknoloji ve yaşam hakkında en güncel içerikler.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search & Categories */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Blog yazısı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit">
                  {post.category}
                </Badge>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aramanızla eşleşen yazı bulunamadı.
            </p>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="gap-2">
            Daha Fazla Yükle
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
