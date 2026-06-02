import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight } from '@/lib/icons';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-[84px] bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider text-muted-foreground mb-8">
          <Link to="/" className="hover:text-tertiary transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" strokeWidth={1.5} />
          <span className="text-foreground font-medium">{t('about.breadcrumb')}</span>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-14">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t('about.title')}
          </h1>
          <div className="w-10 h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-muted-foreground text-[15px]">{t('about.subtitle')}</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white border border-border rounded-xl p-8 md:p-12 mb-12">
          <p className="text-foreground text-[17px] leading-[1.9] mb-6">{t('about.p1')}</p>
          <p className="text-foreground text-[17px] leading-[1.9]">{t('about.p2')}</p>
        </div>
      </div>
    </div>
  );
}
