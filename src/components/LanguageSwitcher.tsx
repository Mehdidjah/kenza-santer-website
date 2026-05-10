import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from '@/lib/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('ar') ? 'ar' : 'fr';

  const change = (lng: 'fr' | 'ar') => i18n.changeLanguage(lng);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-[12px] uppercase tracking-wider font-medium">
          <Globe className="w-4 h-4" strokeWidth={1.5} />
          {current === 'ar' ? 'AR' : 'FR'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem onClick={() => change('fr')} className={current === 'fr' ? 'font-semibold text-primary' : ''}>
          Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => change('ar')} className={current === 'ar' ? 'font-semibold text-primary' : ''}>
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}