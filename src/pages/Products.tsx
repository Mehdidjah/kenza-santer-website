import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, SlidersHorizontal, Grid3X3, List, Package, ChevronRight, ArrowUpDown } from '@/lib/icons';
import { useCategories, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import QuickViewPopup from '@/components/QuickViewPopup';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { NumberTicker } from '@/components/ui/number-ticker';

const fallbackCategoryFilters: readonly string[] = [
  'Bébé & Maman',
  'Compléments Alimentaires',
  'Hygiène',
  'Matériel Médical',
  'Hygiène Bucco-Dentaire',
  'Dermo-cosmétique',
  'Naturel & Bio',
  'Promotions',
];

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'discount';

export default function Products() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [promoOnly, setPromoOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [gridView, setGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const categoryFilters = useMemo(
    () => categories.length ? categories.map(category => category.name) : fallbackCategoryFilters,
    [categories],
  );
  const categoryLabel = (name: string) => {
    const key = `categories.items.${name}`;
    const label = t(key as never);
    return label === key ? name : label;
  };

  useEffect(() => {
    if (initialCategory) setSelectedCategories([initialCategory]);
    if (initialSearch) setSearch(initialSearch);
  }, [initialCategory, initialSearch]);

  const filtered = useMemo(() => {
    const result = products.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !p.ingredients.some(ing => ing.toLowerCase().includes(q))) return false;
      }
      if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
      if (promoOnly && !p.originalPrice) return false;
      return true;
    });
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.reverse(); break;
      case 'discount': result.sort((a, b) => {
        const dA = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
        const dB = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
        return dB - dA;
      }); break;
    }
    return result;
  }, [products, search, selectedCategories, promoOnly, sort]);

  const activeFilters: string[] = [];
  if (selectedCategories.length) activeFilters.push(...selectedCategories);
  if (promoOnly) activeFilters.push(t('products.promo'));

  const clearAll = () => {
    setSearch(''); setSelectedCategories([]); setPromoOnly(false);
  };

  const toggleArr = (arr: string[], val: string) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const pageTitle = selectedCategories.length === 1
    ? categoryLabel(selectedCategories[0])
    : t('products.titleAll');
  const breadcrumbEnd = selectedCategories.length === 1
    ? categoryLabel(selectedCategories[0])
    : t('products.breadcrumb');

  const SidebarFilters = () => (
    <div className="bg-white border border-border rounded-lg p-6 space-y-6">
      {/* Categories list */}
      <div>
        <h4 className="text-[12px] uppercase tracking-[0.1em] font-medium text-muted-foreground mb-3">{t('products.categoriesLabel')}</h4>
        <ul className="flex flex-col -mx-2">
          <li>
            <button
              onClick={() => setSelectedCategories([])}
              className={`w-full flex items-center justify-between px-2 py-2.5 text-left text-sm transition-colors duration-200 border-l-2 ${
                selectedCategories.length === 0
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <span>{t('products.titleAll')}</span>
            </button>
          </li>
          {categoryFilters.map(name => {
            const isSelected = selectedCategories.includes(name);
            return (
              <li key={name}>
                <button
                  onClick={() => setSelectedCategories(toggleArr(selectedCategories, name))}
                  className={`w-full flex items-center justify-between px-2 py-2.5 text-left text-sm transition-colors duration-200 border-l-2 ${
                    isSelected
                      ? 'border-primary text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span>{categoryLabel(name)}</span>
                  {isSelected && <X className="w-3.5 h-3.5 text-tertiary" strokeWidth={1.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="outline" onClick={clearAll} size="sm" className="w-full rounded-md border-tertiary/40 text-tertiary hover:bg-warm-card text-[12px] uppercase tracking-wider h-9">
          <X className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
          {t('products.clear')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground mb-8">
          <Link to="/" className="hover:text-tertiary transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" strokeWidth={1.5} />
          <span className="text-foreground font-medium">{breadcrumbEnd}</span>
        </div>

        {/* Page header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {filtered.length} {filtered.length === 1 ? t('products.countOne') : t('products.countMany')}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(true)} className="md:hidden rounded-md border-tertiary text-tertiary gap-2 h-10 text-[12px] uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} /> {t('products.filter')}
          </Button>
        </div>

        <div className="flex gap-8 lg:gap-10">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-60 lg:w-64 flex-shrink-0 sticky top-24 self-start">
            <SidebarFilters />
          </div>

          {/* Mobile Filter Sheet */}
          {showFilters && (
            <>
              <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setShowFilters(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 md:hidden animate-slide-in-right">
                <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-2xl font-semibold">{t('products.filters')}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="h-8 w-8">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
                <SidebarFilters />
                <Button onClick={() => setShowFilters(false)} className="w-full rounded-md mt-5 h-11 bg-primary text-white text-[13px] uppercase tracking-[0.1em] font-medium">
                  {t(filtered.length === 1 ? 'products.showResult' : 'products.showResults', { count: filtered.length })}
                </Button>
              </div>
            </>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="relative mb-4">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="pl-10 pr-9 h-11 rounded-md bg-white border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-[hsl(35,12%,62%)]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={1.5} />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                {activeFilters.map(f => (
                  <Badge key={f} variant="secondary" className="gap-1.5 rounded-md px-3 py-1 text-[11px] uppercase tracking-wider font-medium bg-warm-card text-tertiary border border-border hover:bg-warm-card transition-colors">
                    {f === t('products.promo') ? f : categoryLabel(f)}
                    <button onClick={() => {
                      setSelectedCategories(selectedCategories.filter(c => c !== f));
                      if (f === t('products.promo')) setPromoOnly(false);
                    }}>
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
                  <SelectTrigger className="w-[170px] h-10 text-[12px] uppercase tracking-wider rounded-md border-border bg-white">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" strokeWidth={1.5} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{t('products.sort.relevance')}</SelectItem>
                    <SelectItem value="price-asc">{t('products.sort.priceAsc')}</SelectItem>
                    <SelectItem value="price-desc">{t('products.sort.priceDesc')}</SelectItem>
                    <SelectItem value="newest">{t('products.sort.newest')}</SelectItem>
                    <SelectItem value="rating">{t('products.sort.rating')}</SelectItem>
                    <SelectItem value="discount">{t('products.sort.discount')}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="hidden md:flex items-center gap-0.5 bg-white border border-border rounded-md p-0.5">
                  <Button variant={gridView ? 'default' : 'ghost'} size="icon" onClick={() => setGridView(true)} className={`h-8 w-8 rounded ${gridView ? 'bg-foreground text-white hover:bg-tertiary' : 'hover:bg-warm-card'}`}>
                    <Grid3X3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                  <Button variant={!gridView ? 'default' : 'ghost'} size="icon" onClick={() => setGridView(false)} className={`h-8 w-8 rounded ${!gridView ? 'bg-foreground text-white hover:bg-tertiary' : 'hover:bg-warm-card'}`}>
                    <List className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-border rounded-lg text-center py-20">
                <Package className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" strokeWidth={1.5} />
                <p className="font-serif text-xl font-semibold mb-1 text-foreground">{t('products.none')}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {search ? `${t('products.noneSearch')} "${search}"` : t('products.noneTry')}
                </p>
                <Button variant="outline" onClick={clearAll} className="rounded-md border-tertiary text-tertiary text-[12px] uppercase tracking-wider">
                  {t('products.reset')}
                </Button>
              </div>
            ) : (
              <div className={gridView ? 'grid grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-4'}>
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewPopup product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
