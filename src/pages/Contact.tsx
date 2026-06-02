import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight, Facebook, Instagram } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const PHONE = '+213770031837';
const PHONE_DISPLAY = '+213 770 03 18 37';
const EMAIL = 'kenz.sante@gmail.com';
const FACEBOOK_URL = 'https://www.facebook.com/share/1GTpys8ZPn/';
const INSTAGRAM_URL = 'https://www.instagram.com/kenz.sante?utm_source=qr&igsh=MTB6c3BkbW5vb2drYw==';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleEmail = () => {
    const subject = encodeURIComponent(form.subject || 'Contact Kenz Santé');
    const body = encodeURIComponent(
      `${form.name}\n${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleCall = () => {
    window.location.href = `tel:${PHONE}`;
  };

  return (
    <div className="min-h-screen bg-background pt-[84px] pb-20">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
          <Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{t('contact.breadcrumb')}</span>
        </nav>

        <div className="max-w-3xl mx-auto text-center mb-14">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            {t('contact.title')}
          </h1>
          <div className="w-10 h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-muted-foreground text-[15px] leading-[1.75]">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Info */}
          <div className="lg:col-span-2 bg-warm-card rounded-xl p-8 border border-border">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-7">
              {t('contact.infoTitle')}
            </h2>

            <div className="space-y-6">
              <a href={`tel:${PHONE}`} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {t('contact.phoneLabel')}
                  </p>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors" dir="ltr">
                    {PHONE_DISPLAY}
                  </p>
                </div>
              </a>

              <a href={`mailto:${EMAIL}`} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {t('contact.emailLabel')}
                  </p>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors break-all">
                    {EMAIL}
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {t('contact.addressLabel')}
                  </p>
                  <p className="text-foreground font-medium">
                    {t('contact.address')}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary transition-colors"
                >
                  <Facebook className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-11 h-11 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary transition-colors"
                >
                  <Instagram className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-xl p-8 border border-border">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-7">
              {t('contact.formTitle')}
            </h2>

            <form
              className="space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleEmail(); }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contact.name')}</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('contact.namePlaceholder')}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('contact.emailPlaceholder')}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t('contact.subject')}</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t('contact.subjectPlaceholder')}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t('contact.message')}</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('contact.messagePlaceholder')}
                  rows={6}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-white h-12 text-[13px] uppercase tracking-[0.1em] font-medium"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  {t('contact.emailBtn')}
                </Button>
                <Button
                  type="button"
                  onClick={handleCall}
                  variant="outline"
                  className="flex-1 rounded-md border-[1.5px] border-tertiary text-tertiary hover:bg-warm-card hover:text-tertiary h-12 text-[13px] uppercase tracking-[0.1em] font-medium bg-transparent"
                >
                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                  {t('contact.callBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
