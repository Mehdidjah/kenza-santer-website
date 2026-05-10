import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Package } from '@/lib/icons';
import { useCartStore } from '@/store/cartStore';
import { wilayas } from '@/data/wilayas';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface FormData {
  firstName: string; lastName: string; phone: string; email: string; wilaya: string; commune: string; notes: string;
}
interface FormErrors { [key: string]: string; }

export default function OrderFormPopup() {
  const { t } = useTranslation();
  const { isOrderFormOpen, closeOrderForm, openSuccess, items, subtotal, clearCart } = useCartStore();
  const [form, setForm] = useState<FormData>({ firstName: '', lastName: '', phone: '', email: '', wilaya: '', commune: '', notes: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = t('order.errors.firstName');
    if (!form.lastName.trim()) e.lastName = t('order.errors.lastName');
    if (!form.phone.trim()) e.phone = t('order.errors.phone');
    else if (!/^\d{9,}$/.test(form.phone.replace(/\s/g, ''))) e.phone = t('order.errors.phoneInvalid');
    if (!form.email.trim()) e.email = t('order.errors.email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('order.errors.emailInvalid');
    if (!form.wilaya) e.wilaya = t('order.errors.wilaya');
    if (!form.commune.trim()) e.commune = t('order.errors.commune');
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched(new Set(Object.keys(form)));
    if (Object.keys(errs).length !== 0) return;
    if (items.length === 0) {
      toast.error(t('cart.empty'));
      return;
    }
    setSubmitting(true);
    try {
      await api.createOrder({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        wilaya: form.wilaya,
        commune: form.commune,
        notes: form.notes || null,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      });
      openSuccess(form.firstName, form.phone);
      clearCart();
      setForm({ firstName: '', lastName: '', phone: '', email: '', wilaya: '', commune: '', notes: '' });
      setTouched(new Set());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
    setTouched(t => new Set(t).add(name));
  };

  const hasError = (name: string) => touched.has(name) && errors[name];

  if (!isOrderFormOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-50 animate-fade-in" onClick={closeOrderForm} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-[540px] max-h-[95vh] overflow-y-auto animate-scale-in border-0 shadow-lift">
          <div className="bg-primary text-primary-foreground p-4 sm:p-5 rounded-t-xl flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('order.title')}
            </h2>
            <Button variant="ghost" size="icon" onClick={closeOrderForm} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <CardContent className="p-4 sm:p-5">
            {items.length > 0 && (
              <div className="bg-secondary rounded-xl p-3 sm:p-4 mb-5">
                {items.map(i => (
                  <div key={i.product.id} className="flex justify-between text-sm mb-1">
                    <span className="truncate mr-2">{i.product.name} × {i.quantity}</span>
                    <span className="font-medium whitespace-nowrap">{(i.product.price * i.quantity).toLocaleString()} DZD</span>
                  </div>
                ))}
                <div className="border-t border-primary/20 mt-2 pt-2 flex justify-between font-bold text-primary">
                  <span>{t('order.total')}</span>
                  <span>{subtotal().toLocaleString()} DZD</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">{t('order.firstName')}</Label>
                  <Input id="firstName" placeholder={t('order.firstName')} value={form.firstName} onChange={e => update('firstName', e.target.value)} className={hasError('firstName') ? 'border-destructive' : ''} />
                  {hasError('firstName') && <p className="text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">{t('order.lastName')}</Label>
                  <Input id="lastName" placeholder={t('order.lastName')} value={form.lastName} onChange={e => update('lastName', e.target.value)} className={hasError('lastName') ? 'border-destructive' : ''} />
                  {hasError('lastName') && <p className="text-xs text-destructive">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t('order.phone')}</Label>
                <Input id="phone" placeholder={t('order.phonePlaceholder')} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={hasError('phone') ? 'border-destructive' : ''} />
                {hasError('phone') && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('order.email')}</Label>
                <Input id="email" placeholder={t('order.emailPlaceholder')} type="email" value={form.email} onChange={e => update('email', e.target.value)} className={hasError('email') ? 'border-destructive' : ''} />
                {hasError('email') && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>{t('order.wilaya')}</Label>
                <Select value={form.wilaya} onValueChange={v => update('wilaya', v)}>
                  <SelectTrigger className={hasError('wilaya') ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('order.wilayaPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
                {hasError('wilaya') && <p className="text-xs text-destructive">{errors.wilaya}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commune">{t('order.commune')}</Label>
                <Input id="commune" placeholder={t('order.commune')} value={form.commune} onChange={e => update('commune', e.target.value)} className={hasError('commune') ? 'border-destructive' : ''} />
                {hasError('commune') && <p className="text-xs text-destructive">{errors.commune}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">{t('order.notes')}</Label>
                <Textarea id="notes" placeholder={t('order.notesPlaceholder')} value={form.notes} onChange={e => update('notes', e.target.value)} className="min-h-[70px]" />
              </div>
              <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-full text-sm sm:text-base font-bold">
                {submitting ? '...' : t('order.submit')}
              </Button>
              <Button type="button" variant="ghost" onClick={closeOrderForm} className="text-sm text-muted-foreground">
                {t('order.cancel')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
