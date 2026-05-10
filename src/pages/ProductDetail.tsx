import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, Star } from '@/lib/icons';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/ProductCard';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DEFAULT_PRODUCT_IMAGE, resolveProductImage } from '@/lib/images';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);
  const openOrderForm = useCartStore(s => s.openOrderForm);
  const toggleWishlist = useCartStore(s => s.toggleWishlist);
  const wishlist = useCartStore(s => s.wishlist);

  if (isLoading) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-muted-foreground">…</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('productDetail.notFound')}</h1>
          <Button variant="link" asChild><Link to="/products">{t('productDetail.back')}</Link></Button>
        </div>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const sameCategory = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  const fallbackProducts = allProducts.filter(p => p.category !== product.category && p.id !== product.id);
  const related = [...sameCategory, ...fallbackProducts]
    .filter((p, index, products) => products.findIndex(item => item.id === p.id) === index)
    .slice(0, 4);

  const handleBuyNow = () => {
    const updateQuantity = useCartStore.getState().updateQuantity;
    const items = useCartStore.getState().items;
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      updateQuantity(product.id, qty);
    } else {
      addItem(product, qty);
    }
    // Close drawer (addItem opens it) and go straight to order form
    useCartStore.getState().closeDrawer();
    openOrderForm();
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 sm:mb-8 overflow-x-auto">
          <Link to="/" className="hover:text-primary whitespace-nowrap">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary whitespace-nowrap">{t('nav.products')}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 mb-12 sm:mb-16">
          {/* Images */}
          <div className="lg:col-span-3 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden bg-muted mb-3 sm:mb-4">
              {product.badge && (
                <Badge variant={product.badge.startsWith('-') ? 'destructive' : 'default'} className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 text-xs sm:text-sm">
                  {product.badge}
                </Badge>
              )}
              <img
                src={resolveProductImage(product.images[selectedImage])}
                alt={product.name}
                className="w-full aspect-square sm:aspect-[4/3] object-cover"
                onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
              />
            </div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`rounded-xl overflow-hidden border-2 transition-colors flex-shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}>
                  <img
                    src={resolveProductImage(img)}
                    alt=""
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                    onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 animate-fade-in [animation-delay:100ms]">
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{product.brand}</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size="md" showCount={product.reviewCount} />
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold">{product.price.toLocaleString()} DZD</span>
              {product.originalPrice && <span className="text-base sm:text-lg text-muted-foreground line-through">{product.originalPrice.toLocaleString()} DZD</span>}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-5 sm:mb-6">
              <span className="text-sm font-medium">{t('productDetail.quantity')}</span>
              <div className="flex items-center border border-primary/30 rounded-xl">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 rounded-l-xl text-primary">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 sm:w-12 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)} className="h-10 w-10 rounded-r-xl text-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <Button onClick={() => addItem(product, qty)} disabled={!product.inStock} className="w-full rounded-full text-sm sm:text-base">
                {t('productDetail.addToCart')}
              </Button>
              <Button variant="secondary" onClick={handleBuyNow} disabled={!product.inStock} className="w-full rounded-full text-sm sm:text-base">
                {t('productDetail.buyNow')}
              </Button>
              <Button variant="outline" onClick={() => toggleWishlist(product.id)} className="w-full rounded-full border-primary text-primary hover:bg-secondary text-sm sm:text-base gap-2">
                <Heart className={`w-4 h-4 ${isWished ? 'fill-primary' : ''}`} />
                {isWished ? t('productDetail.inWishlist') : t('productDetail.addWishlist')}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: Truck, label: t('productDetail.freeShipping') },
                { icon: ShieldCheck, label: t('productDetail.securePayment') },
                { icon: RotateCcw, label: t('productDetail.easyReturn') },
              ].map(({ icon: Icon, label }) => (
                <Card key={label} className="border-0 bg-muted">
                  <CardContent className="flex flex-col items-center gap-1 p-2.5 sm:p-3 text-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12 sm:mb-16">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
            {[
              { value: 'description', label: t('productDetail.tabs.description') },
              { value: 'composition', label: t('productDetail.tabs.composition') },
              { value: 'usage', label: t('productDetail.tabs.usage') },
              { value: 'precautions', label: t('productDetail.tabs.precautions') },
              { value: 'reviews', label: t('productDetail.tabs.reviews') },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="max-w-3xl pt-6">
            <TabsContent value="description">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.fullDescription}</p>
            </TabsContent>
            <TabsContent value="composition">
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map(ing => (
                  <Badge key={ing} variant="secondary" className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2">
                    {ing}
                  </Badge>
                ))}
                {product.ingredients.length === 0 && <p className="text-muted-foreground">{t('productDetail.noInfo')}</p>}
              </div>
            </TabsContent>
            <TabsContent value="usage">
              <ol className="space-y-3">
                {product.howToUse.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-sm sm:text-base text-muted-foreground pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>
            <TabsContent value="precautions">
              <ul className="space-y-2">
                {product.precautions.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-muted-foreground">
                    <span className="text-destructive mt-0.5 flex-shrink-0">!</span> {p}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold">{product.rating}</div>
                  <StarRating rating={product.rating} />
                  <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} avis</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-muted-foreground text-sm">{t('productDetail.reviewsSoon')}</p>
            </TabsContent>
          </div>
        </Tabs>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">{t('productDetail.related')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
