import { Heart, ShoppingCart, Eye } from '@/lib/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/data/products';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { DEFAULT_PRODUCT_IMAGE, resolveProductImage } from '@/lib/images';

interface Props {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: Props) {
  const { t } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const toggleWishlist = useCartStore(s => s.toggleWishlist);
  const wishlist = useCartStore(s => s.wishlist);
  const isWished = wishlist.includes(product.id);

  return (
    <div className="group relative bg-white rounded-lg border border-border/70 overflow-hidden transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lift">
      {product.badge && (
        <span className={`absolute top-3 left-3 z-10 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${product.badge.startsWith('-') ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          {product.badge}
        </span>
      )}

      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-colors hover:bg-white"
        aria-label={t('productDetail.addWishlist')}
      >
        <Heart className={`w-4 h-4 ${isWished ? 'fill-secondary text-secondary' : 'text-foreground'}`} strokeWidth={1.5} />
      </button>

      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-warm-card">
        <img
          src={resolveProductImage(product.image)}
          alt={product.name}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
        />
        {onQuickView && (
          <button
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-foreground/75 backdrop-blur text-white text-[11px] uppercase tracking-wider font-medium px-4 py-2 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('products.quickView')}
          </button>
        )}
      </Link>

      <div className="p-5">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5">{product.brand}</p>
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-serif text-[15px] font-medium text-foreground mb-2 leading-[1.4] line-clamp-2 hover:text-tertiary transition-colors">{product.name}</h3>
        </Link>
        <StarRating rating={product.rating} size="sm" />
        <div className="flex items-end justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold text-primary">{product.price.toLocaleString()} DZD</span>
            {product.originalPrice && (
              <span className="text-[13px] text-muted-foreground line-through">{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Button
            size="icon"
            onClick={() => addItem(product)}
            disabled={!product.inStock}
            className="h-10 w-10 rounded-full bg-foreground text-white hover:bg-tertiary"
            aria-label={t('products.addToCart')}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
        {!product.inStock && <p className="text-xs text-destructive mt-2 font-medium">{t('products.outOfStock')}</p>}
      </div>
    </div>
  );
}
