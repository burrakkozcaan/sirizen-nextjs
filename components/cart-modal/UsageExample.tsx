'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartModalEngine } from './CartModalEngine';

/**
 * Cart Modal Kullanım Örneği
 * 
 * Bu örnek, bir ürün kartında "Sepete Ekle" butonunun
 * Cart Modal Engine ile nasıl entegre edileceğini gösterir.
 */

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  image: string;
}

interface CartModalExampleProps {
  product: Product;
}

export function CartModalExample({ product }: CartModalExampleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = async (
    variant: { attributes: Record<string, string>; price: number; stock: number } | null,
    quantity: number
  ) => {
    // Burada sepete ekleme API çağrısı yapılır
    console.log('Sepete ekleniyor:', {
      productId: product.id,
      variant,
      quantity,
    });

    // Örnek API çağrısı:
    // await fetch('/api/cart/add', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     product_id: product.id,
    //     variant_attributes: variant?.attributes,
    //     quantity,
    //   }),
    // });

    // Başarılı toast göster
    alert('Ürün sepete eklendi!');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Ürün Kartı */}
      <div className="flex gap-4">
        <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-100" />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{product.title}</h3>
          <p className="mt-1 text-lg font-bold text-orange-600">
            {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }).format(product.price)}
          </p>
        </div>
      </div>

      {/* Sepete Ekle Butonu */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
      >
        <ShoppingCart className="h-5 w-5" />
        Sepete Ekle
      </button>

      {/* Cart Modal Engine */}
      <CartModalEngine
        slug={product.slug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// Örnek kullanım:
// <CartModalExample product={{ 
//   id: 1, 
//   title: "Erkek Deri Ceket", 
//   slug: "erkek-deri-ceket",
//   price: 1499 
// }} />
