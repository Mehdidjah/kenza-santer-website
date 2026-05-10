import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Minus } from '@/lib/icons';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/data/products';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DEFAULT_PRODUCT_IMAGE, resolveProductImage } from '@/lib/images';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewPopup({ product, onClose }: Props) {
  const { t } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in border-0 shadow-lift relative">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-3 right-3 z-10 h-8 w-8">
            <X className="w-5 h-5" />
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <img
              src={resolveProductImage(product.image)}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
              onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
            />
            <div className="p-5 md:p-6 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{product.brand}</p>
              <h3 className="text-lg md:text-xl font-bold mb-2">{product.name}</h3>
              <StarRating rating={product.rating} showCount={product.reviewCount} />
              <div className="flex items-center gap-2 mt-3 mb-3">
                <span className="text-xl md:text-2xl font-bold">{product.price.toLocaleString()} DZD</span>
                {product.originalPrice && <span className="text-sm text-muted-foreground line-through">{product.originalPrice.toLocaleString()}</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
              <div className="flex items-center gap-3 mb-4">
                <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 border-primary/30 text-primary">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium w-8 text-center">{qty}</span>
                <Button variant="outline" size="icon" onClick={() => setQty(qty + 1)} className="h-9 w-9 border-primary/30 text-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => { addItem(product, qty); onClose(); setQty(1); }}
                disabled={!product.inStock}
                className="w-full rounded-full"
              >
                {t('products.addToCart')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
