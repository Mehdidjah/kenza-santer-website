import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram } from '@/lib/icons';
import logo from '@/assets/logo.svg';
import { useCategories } from '@/hooks/useProducts';

const fallbackCategoryKeys = ['Bébé & Maman', 'Compléments Alimentaires', 'Hygiène', 'Matériel Médical', 'Hygiène Bucco-Dentaire', 'Dermo-cosmétique'];

export default function Footer() {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const categoryKeys = categories.length ? categories.map(category => category.name).slice(0, 6) : fallbackCategoryKeys;
  const categoryLabel = (name: string) => {
    const key = `categories.items.${name}`;
    const label = t(key as never);
    return label === key ? name : label;
  };
  return (
    <footer className="bg-foreground text-warm-card">
      <div className="container mx-auto px-6 py-20">
        <div className="flex items-center gap-2 mb-10">
          <img src={logo} alt="Kenz Santé" className="h-7 w-auto brightness-0 invert" />
        </div>
        <p className="text-warm-card/60 text-sm mb-14 max-w-md leading-[1.75]">
          {t('footer.tagline')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h4 className="font-medium mb-5 text-[12px] uppercase tracking-[0.1em] text-warm-card/80">{t('footer.quickLinks')}</h4>
            <div className="flex flex-col gap-3">
              {[[t('nav.home'), '/'], [t('nav.products'), '/products'], [t('nav.about'), '/about'], [t('nav.contact'), '/contact']].map(([l, to]) => (
                <Link key={to} to={to} className="text-warm-card/55 text-sm hover:text-secondary transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-5 text-[12px] uppercase tracking-[0.1em] text-warm-card/80">{t('footer.categories')}</h4>
            <div className="flex flex-col gap-3">
              {categoryKeys.map(c => (
                <Link key={c} to={`/products?category=${encodeURIComponent(c)}`} className="text-warm-card/55 text-sm hover:text-secondary transition-colors">
                  {categoryLabel(c)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-5 text-[12px] uppercase tracking-[0.1em] text-warm-card/80">{t('footer.customerService')}</h4>
            <div className="flex flex-col gap-3 text-warm-card/55 text-sm">
              <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.faq')}</span>
              <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.orderTracking')}</span>
              <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.returns')}</span>
              <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.privacy')}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-5 text-[12px] uppercase tracking-[0.1em] text-warm-card/80">{t('footer.contactUs')}</h4>
            <div className="flex flex-col gap-3 text-warm-card/55 text-sm">
              <p>{t('contact.address')}</p>
              <a href="tel:+213770031837" className="hover:text-secondary transition-colors" dir="ltr">+213 770 03 18 37</a>
              <a href="mailto:kenz.sante@gmail.com" className="hover:text-secondary transition-colors break-all">kenz.sante@gmail.com</a>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.facebook.com/share/1GTpys8ZPn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-warm-card/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors"
                >
                  <Facebook className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.instagram.com/kenz.sante?utm_source=qr&igsh=MTB6c3BkbW5vb2drYw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-warm-card/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-warm-card/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-warm-card/35 text-[13px] gap-2">
          <span>{t('footer.rights')}</span>
          <div className="flex gap-6">
            <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.privacy')}</span>
            <span className="hover:text-secondary cursor-pointer transition-colors">{t('footer.terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
