import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className="group flex flex-col items-center gap-2"
        >
          <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Image
              src={category.image || 'https://placehold.co/400x400?text=Category'}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16.67vw, 11vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}
