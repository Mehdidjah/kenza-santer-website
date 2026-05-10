import { useEffect, useMemo, useState } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus } from '@/lib/icons';
import { toast } from '@/hooks/use-toast';
import type { Category } from '@/types/product';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesPanel() {
  const { data: categories = [], refetch } = useCategories();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; name: string; sort_order: number } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  useEffect(() => { setPage(1); }, [search]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => { setEditing({ name: '', sort_order: categories.length + 1 }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing({ id: c.id, name: c.name, sort_order: c.sortOrder }); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    const payload = { name: editing.name.trim(), slug: slugify(editing.name), sort_order: editing.sort_order };
    if (!payload.name) { toast({ title: 'Nom requis', variant: 'destructive' }); return; }
    try {
      await (editing.id ? api.updateCategory(editing.id, payload) : api.createCategory(payload));
      toast({ title: 'Enregistré' });
      setOpen(false);
      refetch();
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (error) {
      toast({ title: 'Erreur', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.deleteCategory(id);
      refetch();
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (error) {
      toast({ title: 'Erreur', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une catégorie…" className="max-w-sm" />
        <div className="ml-auto" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nouvelle catégorie</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? 'Modifier' : 'Nouvelle'} catégorie</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nom</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Ordre</Label><Input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              </div>
            )}
            <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="bg-white border border-border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Slug</TableHead><TableHead className="w-20">Ordre</TableHead><TableHead className="w-32 text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {paged.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.slug}</TableCell>
                <TableCell>{c.sortOrder}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
}
