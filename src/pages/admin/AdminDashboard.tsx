import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from '@/lib/icons';
import CategoriesPanel from '@/components/admin/CategoriesPanel';
import ProductsPanel from '@/components/admin/ProductsPanel';
import OrdersPanel from '@/components/admin/OrdersPanel';
import SystemPanel from '@/components/admin/SystemPanel';
import { useAdminSync } from '@/hooks/useSyncEvents';

export default function AdminDashboard() {
  const nav = useNavigate();
  const { session, isAdmin, loading } = useAdminAuth();
  useAdminSync(Boolean(session && isAdmin));

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) nav('/admin/login', { replace: true });
  }, [loading, session, isAdmin, nav]);

  if (loading || !session || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }

  const logout = async () => { await api.logout(); nav('/admin/login', { replace: true }); };

  return (
    <div className="min-h-screen bg-warm-card">
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-serif text-xl font-semibold">Admin · Kenz Santé</h1>
          <Button variant="ghost" onClick={logout}><LogOut className="w-4 h-4 mr-1" /> Déconnexion</Button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6"><OrdersPanel /></TabsContent>
          <TabsContent value="products" className="mt-6"><ProductsPanel /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoriesPanel /></TabsContent>
          <TabsContent value="system" className="mt-6"><SystemPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
