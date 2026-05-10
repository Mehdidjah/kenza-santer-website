export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  image: string;
  images: string[];
  ingredients: string[];
  howToUse: string[];
  precautions: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}
