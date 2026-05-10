import { useQuery } from '@tanstack/react-query';
import type { Product, Category } from '@/types/product';
import { api, mapCategory, mapProduct } from '@/lib/api';

const CATALOG_REFETCH_INTERVAL = 10_000;

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const data = await api.getProducts();
      return data.map(mapProduct);
    },
    refetchInterval: CATALOG_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async (): Promise<Product | null> => {
      const data = await api.getProduct(id!);
      return mapProduct(data);
    },
    refetchInterval: CATALOG_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const data = await api.getCategories();
      return data.map(mapCategory);
    },
    refetchInterval: CATALOG_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
  });
}
