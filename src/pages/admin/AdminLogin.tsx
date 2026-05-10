import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const nav = useNavigate();
  const { session, isAdmin, loading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) nav('/admin', { replace: true });
  }, [loading, session, isAdmin, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.login(email, password);
      nav('/admin', { replace: true });
    } catch (error) {
      toast({ title: 'Connexion échouée', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-card p-6">
      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-border p-8 w-full max-w-md space-y-5 shadow-lift">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Espace Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous pour gérer le catalogue</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pwd">Mot de passe</Label>
          <Input id="pwd" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  );
}
