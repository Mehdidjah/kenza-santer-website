import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Baby, Pill, ShowerHead, Stethoscope, SmilePlus, Leaf, Flame, Star, Truck, ShieldCheck, Quote, Package, Users, Phone, Hospital } from '@/lib/icons';
import { useState } from 'react';
import { useCategories, useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import QuickViewPopup from '@/components/QuickViewPopup';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import type { Product } from '@/types/product';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/images';

const categoryItems = [
  { key: 'Bébé & Maman', icon: Baby },
  { key: 'Compléments Alimentaires', icon: Pill },
  { key: 'Hygiène', icon: ShowerHead },
  { key: 'Matériel Médical', icon: Stethoscope },
  { key: 'Hygiène Bucco-Dentaire', icon: SmilePlus },
  { key: 'Dermo-cosmétique', icon: Hospital },
  { key: 'Naturel & Bio', icon: Leaf },
  { key: 'Promotions', icon: Flame, special: true },
] as const;

const categoryIconMap: Record<string, typeof Package> = {
  'Bébé & Maman': Baby,
  'Compléments Alimentaires': Pill,
  Hygiène: ShowerHead,
  'Matériel Médical': Stethoscope,
  'Hygiène Bucco-Dentaire': SmilePlus,
  'Dermo-cosmétique': Hospital,
  'Naturel & Bio': Leaf,
  Promotions: Flame,
};

const botanicalSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><g fill='none' stroke='%23B8C820' stroke-width='1.2' stroke-linecap='round'><path d='M40 180 Q 60 120 80 80 Q 100 40 60 30'/><path d='M60 100 Q 80 90 100 100'/><path d='M55 130 Q 75 120 95 130'/><path d='M180 60 Q 160 100 140 140 Q 120 180 160 200'/><path d='M170 100 Q 150 110 130 100'/><path d='M165 140 Q 145 150 125 140'/></g></svg>`;

export default function Index() {
  const { t } = useTranslation();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const displayedCategories = categories.length
    ? categories.map(category => ({
        key: category.name,
        icon: categoryIconMap[category.name] ?? Package,
        special: category.name === 'Promotions',
      }))
    : categoryItems;
  const categoryLabel = (name: string) => {
    const key = `categories.items.${name}`;
    const label = t(key as never);
    return label === key ? name : label;
  };
  const renderCategoryCard = (cat: (typeof displayedCategories)[number], duplicate = false) => {
    const isSpecial = 'special' in cat && cat.special;
    return (
      <Link
        key={`${duplicate ? 'duplicate-' : ''}${cat.key}`}
        to={`/products?category=${encodeURIComponent(cat.key)}`}
        tabIndex={duplicate ? -1 : undefined}
        className={`group relative aspect-square w-[132px] sm:w-[146px] lg:w-[140px] xl:w-[148px] shrink-0 bg-white rounded-xl border p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:bg-[hsl(var(--warm-card))] ${isSpecial ? 'border-secondary/40 hover:border-secondary' : 'border-border hover:border-primary/40'}`}
      >
        {isSpecial && (
          <span className="absolute top-2 right-2 text-[9px] font-medium uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
            {t('categories.offers')}
          </span>
        )}
        <cat.icon className={`w-9 h-9 ${isSpecial ? 'text-secondary' : 'text-primary'}`} strokeWidth={1.5} />
        <h3 className="text-[11px] uppercase tracking-[0.06em] font-medium text-center text-foreground leading-tight break-words max-w-full">
          {categoryLabel(cat.key)}
        </h3>
      </Link>
    );
  };
  const promoProducts = products.filter(p => p.category === 'Promotions').slice(0, 8);
  const testimonials = t('testimonials.items', { returnObjects: true }) as Array<{ name: string; wilaya: string; text: string }>;
  const ratings = [5, 5, 4];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-[84px] bg-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: `url("${botanicalSvg}")`, backgroundSize: '240px 240px' }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[90vh] py-20">
            <div className="animate-fade-in">
              <a
                href="tel:+213770031837"
                className="group inline-flex items-center gap-3 mb-7 pl-2 pr-5 py-2 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary hover:border-primary transition-all duration-300 hover:shadow-lift"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white group-hover:bg-white group-hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" strokeWidth={2} />
                </span>
                <span className="font-serif text-xl md:text-2xl font-semibold tracking-wide text-primary group-hover:text-white transition-colors">
                  {t('hero.eyebrow')}
                </span>
              </a>

              <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground leading-[1.1] mb-7">
                {t('hero.title1')}<br />
                <span className="font-semibold text-black">{t('hero.title2')}</span>
              </h1>

              <p className="text-[18px] text-muted-foreground mb-10 max-w-[520px] leading-[1.75]">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4 mb-14">
                <Link to="/products">
                  <Button className="rounded-md bg-primary hover:bg-primary/90 text-white px-9 py-3.5 h-auto text-[13px] uppercase tracking-[0.1em] font-medium">
                    {t('hero.ctaProducts')}
                  </Button>
                </Link>
                <a href="#promotions">
                  <Button variant="outline" className="rounded-md border-[1.5px] border-tertiary text-tertiary hover:bg-warm-card hover:text-tertiary px-9 py-3.5 h-auto text-[13px] uppercase tracking-[0.1em] font-medium bg-transparent">
                    {t('hero.ctaPromos')}
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-10">
                {[
                  { icon: Package, value: 500, suffix: '+', label: t('hero.statsProducts') },
                  { icon: Truck, value: 58, suffix: '', label: t('hero.statsWilayas') },
                  { icon: Users, value: 10000, suffix: '+', label: t('hero.statsClients') },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <stat.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    <div>
                      <p className="font-serif font-semibold text-foreground text-base leading-none">
                        <NumberTicker value={stat.value} className="text-foreground" />{stat.suffix}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block relative animate-fade-in [animation-delay:200ms]">
              <div className="relative overflow-hidden rounded-lg bg-warm-card">
                <img src={DEFAULT_PRODUCT_IMAGE} alt="Produits pharmaceutiques premium" className="w-full" width={1024} height={864} />
              </div>

              <div className="absolute -bottom-3 -left-3 bg-white rounded-md px-5 py-3.5 flex items-center gap-3 border border-border animate-fade-in [animation-delay:600ms]">
                <Truck className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium leading-none text-foreground">{t('hero.freeShipping')}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">{t('hero.everywhere')}</p>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-white rounded-md px-5 py-3.5 flex items-center gap-3 border border-border animate-fade-in [animation-delay:800ms]">
                <Star className="w-5 h-5 fill-secondary text-secondary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-bold leading-none text-foreground">4.8/5</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1.5">{t('hero.customerReviews')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 md:py-24 bg-warm-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-semibold mb-3 text-foreground">{t('categories.title')}</h2>
            <div className="w-10 h-[2px] bg-primary mx-auto" />
          </div>
          <div className="category-carousel overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max gap-4 will-change-transform animate-category-marquee [--category-carousel-gap:1rem]">
              <div className="flex shrink-0 gap-4">
                {displayedCategories.map(cat => renderCategoryCard(cat))}
              </div>
              <div className="flex shrink-0 gap-4" aria-hidden="true">
                {displayedCategories.map(cat => renderCategoryCard(cat, true))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions */}
      <section id="promotions" className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{t('promos.title')}</h2>
                <span className="bg-destructive text-destructive-foreground text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded">{t('promos.badge')}</span>
              </div>
              <p className="text-muted-foreground text-[15px]">{t('promos.subtitle')}</p>
            </div>
            <Link to="/products?category=Promotions" className="text-tertiary text-[13px] uppercase tracking-[0.08em] font-medium hover:underline underline-offset-4">
              {t('promos.seeAll')}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {promoProducts.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-24 bg-warm-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-semibold mb-3 text-foreground">{t('why.title')}</h2>
            <div className="w-10 h-[2px] bg-primary mx-auto mb-5" />
            <p className="text-muted-foreground max-w-lg mx-auto text-[15px]">{t('why.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Package, title: t('why.pharma.title'), desc: t('why.pharma.desc'), stat: 500, suffix: '+', statLabel: t('why.pharma.stat') },
              { icon: Users, title: t('why.natural.title'), desc: t('why.natural.desc'), stat: 24, suffix: '/24', statLabel: t('why.natural.stat') },
              { icon: ShieldCheck, title: t('why.delivery.title'), desc: t('why.delivery.desc'), stat: 58, suffix: '', statLabel: t('why.delivery.stat') },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-10 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lift">
                <item.icon className="w-12 h-12 text-primary mb-7" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.7] mb-7">{item.desc}</p>
                <div className="mt-auto pt-6 border-t border-border w-full">
                  <span className="font-serif text-5xl font-semibold text-primary">
                    <NumberTicker value={item.stat} className="text-primary" />{item.suffix}
                  </span>
                  <p className="text-[12px] uppercase tracking-wider text-muted-foreground mt-2">{item.statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-semibold mb-3 text-foreground">{t('testimonials.title')}</h2>
            <div className="w-10 h-[2px] bg-primary mx-auto mb-5" />
            <p className="text-muted-foreground max-w-lg mx-auto text-[15px]">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-8 transition-all duration-200 hover:shadow-lift">
                <Quote className="w-8 h-8 text-secondary/30 mb-4" strokeWidth={1.5} />
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= ratings[i] ? 'fill-secondary text-secondary' : 'text-border fill-border'}`} strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-[15px] text-foreground leading-[1.75] mb-7">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center font-serif font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{t.name}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{t.wilaya}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuickViewPopup product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
