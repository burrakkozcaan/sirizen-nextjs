"use client";

import { useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Building2,
  Users,
  Rocket,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const benefits = [
  {
    icon: Heart,
    title: "Sağlık Sigortası",
    description: "Özel sağlık sigortası ve check-up imkanları",
  },
  {
    icon: Rocket,
    title: "Kariyer Gelişimi",
    description: "Eğitim programları ve mentorluk desteği",
  },
  {
    icon: Users,
    title: "Esnek Çalışma",
    description: "Hibrit çalışma modeli ve esnek saatler",
  },
  {
    icon: Building2,
    title: "Modern Ofisler",
    description: "Yaratıcı çalışma alanları ve sosyal tesisler",
  },
];

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Teknoloji",
    location: "İstanbul",
    type: "Tam Zamanlı",
    level: "Kıdemli",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Ürün",
    location: "İstanbul",
    type: "Tam Zamanlı",
    level: "Orta Düzey",
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Tasarım",
    location: "İstanbul",
    type: "Tam Zamanlı",
    level: "Kıdemli",
  },
  {
    id: 4,
    title: "Data Scientist",
    department: "Veri",
    location: "İstanbul",
    type: "Tam Zamanlı",
    level: "Kıdemli",
  },
  {
    id: 5,
    title: "Mobile Developer (iOS)",
    department: "Teknoloji",
    location: "İstanbul",
    type: "Tam Zamanlı",
    level: "Orta Düzey",
  },
  {
    id: 6,
    title: "DevOps Engineer",
    department: "Teknoloji",
    location: "Remote",
    type: "Tam Zamanlı",
    level: "Kıdemli",
  },
];

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDepartment =
      department === "all" || job.department === department;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-white pb-10 lg:pb-8">
      <div className="container mx-auto px-4 py-2">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Card */}
          <div className="relative order-2 mr-4 flex w-full flex-col items-center rounded-3xl border border-gray-200 px-6 md:order-1 md:overflow-y-auto md:border md:bg-white md:px-8 md:shadow-xs dark:border-[#313131] dark:bg-[#171719]">
            <div className="flex h-full w-full flex-col">
              {/* Header */}
              <div className="flex w-full flex-col gap-y-4 py-8 md:flex-row md:items-center md:justify-between md:py-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                    Kariyer
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Türkiye&apos;nin en büyük e-ticaret ekibine katılın ve
                    geleceği birlikte şekillendirelim.
                  </p>
                </div>
                <div>
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {jobs.length} Açık Pozisyon
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="flex flex-col gap-y-4 py-6">
                {/* Benefits */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Neden Sirizen?
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {benefits.map((benefit) => (
                      <div
                        key={benefit.title}
                        className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] text-center"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <benefit.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Search */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Açık Pozisyonlar</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pozisyon ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Departman" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Departmanlar</SelectItem>
                        <SelectItem value="Teknoloji">Teknoloji</SelectItem>
                        <SelectItem value="Ürün">Ürün</SelectItem>
                        <SelectItem value="Tasarım">Tasarım</SelectItem>
                        <SelectItem value="Veri">Veri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-gray-200 p-4 dark:border-[#2a2a2a] hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {job.level}
                          </Badge>
                          <Button variant="outline" className="gap-2 text-sm">
                            Başvur
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">
                      Aramanızla eşleşen pozisyon bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
