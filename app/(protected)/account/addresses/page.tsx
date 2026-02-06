"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Address } from "@/types";

interface AddressFormData {
  title: string;
  type: "home" | "work" | "other";
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address_line: string;
  postal_code?: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AddressFormData>({
    title: "",
    type: "home",
    full_name: "",
    phone: "",
    city: "",
    district: "",
    neighborhood: "",
    address_line: "",
    postal_code: "",
  });

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<{ data: Address[] }>("/addresses");
      setAddresses(data.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Adresler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "home",
      full_name: "",
      phone: "",
      city: "",
      district: "",
      neighborhood: "",
      address_line: "",
      postal_code: "",
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        type: address.title.toLowerCase().includes("iş") ? "work" : "home",
        full_name: address.full_name,
        phone: address.phone,
        city: address.city,
        district: address.district,
        neighborhood: address.neighborhood,
        address_line: address.address_line,
        postal_code: address.postal_code,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveAddress = async () => {
    if (
      !formData.title ||
      !formData.full_name ||
      !formData.phone ||
      !formData.city ||
      !formData.district ||
      !formData.neighborhood ||
      !formData.address_line
    ) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingAddress) {
        // Update existing address
        await api.put(`/addresses/${editingAddress.id}`, {
          title: formData.title,
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          address_line: formData.address_line,
          postal_code: formData.postal_code,
        });
        toast.success("Adres başarıyla güncellendi");
      } else {
        // Create new address
        await api.post("/addresses", {
          title: formData.title,
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          address_line: formData.address_line,
          postal_code: formData.postal_code,
          is_default: addresses.length === 0,
        });
        toast.success("Adres başarıyla eklendi");
      }

      handleCloseDialog();
      loadAddresses();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message ||
          apiError.errors?.city?.[0] ||
          "Adres kaydedilirken bir hata oluştu"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Adres silindi");
      loadAddresses();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Adres silinirken bir hata oluştu");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/addresses/${id}/set-default`);
      toast.success("Varsayılan adres güncellendi");
      loadAddresses();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(
        apiError.message || "Varsayılan adres güncellenirken bir hata oluştu"
      );
    }
  };

  const getTypeIcon = (type: string) => {
    if (
      type.toLowerCase().includes("iş") ||
      type.toLowerCase().includes("work")
    ) {
      return Briefcase;
    }
    return Home;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Adreslerim</h1>
            <p className="text-muted-foreground">
              {addresses.length} kayıtlı adres
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Adres
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adres Başlığı</Label>
                    <Input
                      placeholder="Örn: Ev, İş"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adres Tipi</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value: string) =>
                        setFormData({
                          ...formData,
                          type: value as "home" | "work" | "other",
                        })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home">Ev</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work" id="work" />
                        <Label htmlFor="work">İş</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ad Soyad</Label>
                    <Input
                      placeholder="Teslimat alacak kişi"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      placeholder="+90 5XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>İl</Label>
                    <Input
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>İlçe</Label>
                    <Input
                      placeholder="Kadıköy"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mahalle</Label>
                    <Input
                      placeholder="Caferağa"
                      value={formData.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          neighborhood: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Açık Adres</Label>
                  <Textarea
                    placeholder="Cadde, sokak, bina no, daire no..."
                    value={formData.address_line}
                    onChange={(e) =>
                      setFormData({ ...formData, address_line: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Posta Kodu (İsteğe Bağlı)</Label>
                  <Input
                    placeholder="34000"
                    value={formData.postal_code || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    İptal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      "Kaydet"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => {
            const TypeIcon = getTypeIcon(address.title);
            return (
              <Card
                key={address.id}
                className={address.is_default ? "ring-2 ring-primary" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{address.title}</h3>
                        {address.is_default && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Varsayılan
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{address.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.phone}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.neighborhood}, {address.address_line}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.district} / {address.city}
                      </p>
                      {address.postal_code && (
                        <p className="text-sm text-muted-foreground">
                          Posta Kodu: {address.postal_code}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(address)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Varsayılan Yap
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {addresses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Kayıtlı adresiniz yok
            </h2>
            <p className="text-muted-foreground mb-6">
              Teslimat için yeni bir adres ekleyin
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Adres Ekle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
