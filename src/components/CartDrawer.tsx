import { X, Plus, Minus, ShoppingCart } from '@/lib/icons';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const { t } = useTranslation();
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal, openOrderForm } = useCartStore();

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in" onClick={closeDrawer} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-lift flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">{t('cart.title')}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeDrawer} className="h-9 w-9">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="font-medium">{t('cart.empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3 sm:gap-4 p-3 rounded-xl bg-muted/50">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                    <p className="text-sm font-bold text-primary mt-1">{(item.product.price * item.quantity).toLocaleString()} DZD</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-7 w-7 border-primary/30 text-primary">
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-7 w-7 border-primary/30 text-primary">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.product.id)} className="self-start h-7 w-7 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-border space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{t('cart.subtotal')}</span>
              <span className="text-lg font-bold text-primary">{subtotal().toLocaleString()} DZD</span>
            </div>
            <Button onClick={openOrderForm} className="w-full rounded-full">
              {t('cart.checkout')}
            </Button>
            <Button variant="outline" onClick={closeDrawer} className="w-full rounded-full border-primary text-primary hover:bg-secondary">
              {t('cart.continue')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
