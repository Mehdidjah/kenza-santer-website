import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Search } from '@/lib/icons';
import { toast } from '@/hooks/use-toast';
import ProductEditor, { type EditingProduct } from './ProductEditor';
import { api, type ApiProductRow } from '@/lib/api';
import { DEFAULT_PRODUCT_IMAGE, resolveProductImage } from '@/lib/images';

export default function ProductsPanel() {
  const qc = useQueryClient();
  const { data: rows = [], refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: api.adminProducts,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(r => r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  useEffect(() => { setPage(1); }, [search]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => {
    setEditing({ name: '', brand: '', category: '', description: '', full_description: '', price: 0, original_price: null, badge: null, in_stock: true, rating: 4.5, review_count: 0, images: [], imageKeys: [], ingredients: [], how_to_use: [], precautions: [] });
    setOpen(true);
  };
  const openEdit = (r: ApiProductRow) => {
    const imageKeys = r.imageKeys ?? [];
    setEditing({
      id: r.id, name: r.name, brand: r.brand, category: r.category,
      description: r.description, full_description: r.full_description,
      price: Number(r.price), original_price: r.original_price != null ? Number(r.original_price) : null,
      badge: r.badge, in_stock: r.in_stock, rating: Number(r.rating), review_count: r.review_count,
      images: imageKeys.length ? r.images ?? [] : [],
      imageKeys,
      ingredients: r.ingredients ?? [], how_to_use: r.how_to_use ?? [], precautions: r.precautions ?? [],
    });
    setOpen(true);
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.deleteProduct(id);
      toast({ title: 'Supprimé' });
      refetch();
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    } catch (error) {
      toast({ title: 'Erreur', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
    }
  };

  const onSaved = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['product'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit…" className="pl-9" />
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nouveau produit</Button>
      </div>
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead className="text-right">Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <img
                    src={resolveProductImage(r.imageKeys?.length ? r.images?.[0] : DEFAULT_PRODUCT_IMAGE)}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                    onError={(event) => { event.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">{r.name}</TableCell>
                <TableCell className="text-sm">{r.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.brand}</TableCell>
                <TableCell className="text-right">{Number(r.price).toLocaleString()} DZD</TableCell>
                <TableCell><span className={`text-xs px-2 py-0.5 rounded ${r.in_stock ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{r.in_stock ? 'Oui' : 'Non'}</span></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (<TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Aucun produit</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
            <span className="px-2">Page {page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}
      <ProductEditor open={open} onClose={() => setOpen(false)} initial={editing} onSaved={onSaved} />
    </div>
  );
}
