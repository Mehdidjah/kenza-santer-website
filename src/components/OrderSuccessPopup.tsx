import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSuccessPopup() {
  const { t } = useTranslation();
  const { isSuccessOpen, closeSuccess, orderName, orderPhone } = useCartStore();

  useEffect(() => {
    if (isSuccessOpen) {
      const timer = setTimeout(closeSuccess, 6000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessOpen, closeSuccess]);

  if (!isSuccessOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-lift animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <svg className="w-10 h-10" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" fill="none" stroke="hsl(153,41%,30%)" strokeWidth="3" strokeDasharray="150" strokeDashoffset="150" style={{ animation: 'draw-check 0.6s ease-out 0.2s forwards' }} />
                <path fill="none" stroke="hsl(153,41%,30%)" strokeWidth="3" strokeLinecap="round" d="M14 27l7 7 16-16" strokeDasharray="40" strokeDashoffset="40" style={{ animation: 'draw-check 0.4s ease-out 0.6s forwards' }} />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">{t('order.success.title')}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {t('order.success.message', { name: orderName, phone: orderPhone })}
            </p>
            <Button onClick={closeSuccess} className="w-full rounded-full">
              {t('order.success.cta')}
            </Button>
            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress-shrink" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
