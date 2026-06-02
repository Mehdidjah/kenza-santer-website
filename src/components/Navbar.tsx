import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Menu, X } from '@/lib/icons';
import { useCartStore } from '@/store/cartStore';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import logo from '@/assets/Logo-com (1).svg';

export default function Navbar() {
  const { t } = useTranslation();
  const navLinks = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.products'), to: '/products' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore(s => s.totalItems());
  const openDrawer = useCartStore(s => s.openDrawer);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useProducts();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setSearchQuery(''); }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [products, searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b border-border ${scrolled ? 'shadow-nav backdrop-blur' : ''}`}>
      <div className="container mx-auto flex items-center justify-between h-[84px] px-6">
        <Link to="/" className="flex items-center gap-1.5">
          <img src={logo} alt="Kenz Santé" className="h-[56px] w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] uppercase tracking-[0.08em] font-medium transition-colors relative pb-1.5 ${active ? 'text-foreground border-b border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <div ref={searchRef} className="relative">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} aria-label={t('nav.search')}>
              <Search className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            </Button>
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lift border border-border overflow-hidden w-[300px] animate-scale-in">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t('nav.searchPlaceholder')}
                  className="border-0 border-b border-border rounded-none focus-visible:ring-0 h-11"
                />
                {searchResults.length > 0 && (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map(p => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-warm-card transition-colors"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      >
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover bg-warm-card" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate font-serif">{p.name}</p>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</p>
                        </div>
                        <span className="text-sm font-bold text-primary whitespace-nowrap">{p.price.toLocaleString()} DZD</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted-foreground">{t('nav.noResults')} "{searchQuery}"</p>
                )}
              </div>
            )}
          </div>

          <LanguageSwitcher />

          <Button variant="ghost" size="icon" onClick={openDrawer} className="relative" aria-label={t('nav.cart')}>
            <ShoppingCart className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {totalItems}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')}>
            {mobileOpen ? <X className="w-5 h-5 text-foreground" strokeWidth={1.5} /> : <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5} />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-3 px-4 rounded-md text-[13px] uppercase tracking-[0.08em] font-medium transition-colors ${location.pathname === link.to ? 'bg-warm-card text-foreground' : 'text-muted-foreground hover:bg-warm-card'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
