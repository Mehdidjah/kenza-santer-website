import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ApiOrder, type OrderStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, Trash2 } from '@/lib/icons';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ORDER_TIME_ZONE = 'Africa/Algiers';
const orderDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeZone: ORDER_TIME_ZONE,
});
const orderTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: ORDER_TIME_ZONE,
});

function formatOrderDate(value: string) {
  return orderDateFormatter.format(new Date(value));
}

function formatOrderTime(value: string) {
  return orderTimeFormatter.format(new Date(value));
}

export default function OrdersPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: orders = [], isLoading: loading, error: ordersError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: api.adminOrders,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const { data: selected, isLoading: detailLoading, error: detailError } = useQuery({
    queryKey: ['admin-order', selectedId],
    enabled: Boolean(selectedId),
    queryFn: () => api.adminOrder(selectedId!),
    refetchInterval: selectedId ? 10_000 : false,
    refetchIntervalInBackground: true,
  });
  const items = selected?.items ?? [];

  useEffect(() => {
    if (ordersError) toast.error(ordersError instanceof Error ? ordersError.message : 'Erreur de chargement');
  }, [ordersError]);

  useEffect(() => {
    if (detailError) toast.error(detailError instanceof Error ? detailError.message : 'Erreur de chargement');
  }, [detailError]);

  const openDetail = (o: ApiOrder) => setSelectedId(o.id);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success('Statut mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de mise à jour');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette commande ?')) return;
    try {
      await api.deleteOrder(id);
      toast.success('Commande supprimée');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de suppression');
    }
  };

  const filtered = useMemo(() => orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return [
      o.first_name,
      o.last_name,
      o.phone,
      o.email,
      o.wilaya,
      formatOrderDate(o.created_at),
      formatOrderTime(o.created_at),
    ].some(v => v?.toLowerCase().includes(s));
  }), [orders, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  useEffect(() => { setPage(1); }, [search, filter]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Rechercher (nom, tél, email, wilaya)…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">{filtered.length} commande(s)</div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Chargement…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucune commande</TableCell></TableRow>
            ) : paged.map(o => (
              <TableRow key={o.id}>
                <TableCell className="whitespace-nowrap text-sm font-medium">{formatOrderDate(o.created_at)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">{formatOrderTime(o.created_at)}</TableCell>
                <TableCell className="font-medium">{o.first_name} {o.last_name}</TableCell>
                <TableCell>{o.phone}</TableCell>
                <TableCell>{o.wilaya}</TableCell>
                <TableCell className="font-medium">{Number(o.total).toLocaleString()} DZD</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                    <SelectTrigger className="w-[150px] h-8">
                      <Badge className={STATUS_COLOR[o.status] + ' border-0'}>{STATUS_LABEL[o.status]}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openDetail(o)}><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(o.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Détails de la commande</DialogTitle></DialogHeader>
          {detailLoading && !selected ? (
            <div className="text-center text-muted-foreground py-8">Chargement…</div>
          ) : selected && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-muted-foreground">Nom</div><div className="font-medium">{selected.first_name} {selected.last_name}</div></div>
                <div><div className="text-muted-foreground">Date de commande</div><div className="font-medium">{formatOrderDate(selected.created_at)}</div></div>
                <div><div className="text-muted-foreground">Heure de commande</div><div className="font-medium">{formatOrderTime(selected.created_at)}</div></div>
                <div><div className="text-muted-foreground">Téléphone</div><div className="font-medium">{selected.phone}</div></div>
                <div><div className="text-muted-foreground">Email</div><div className="font-medium break-all">{selected.email}</div></div>
                <div><div className="text-muted-foreground">Wilaya</div><div className="font-medium">{selected.wilaya}</div></div>
                <div><div className="text-muted-foreground">Commune</div><div className="font-medium">{selected.commune}</div></div>
              </div>
              {selected.notes && (
                <div><div className="text-muted-foreground">Notes</div><div className="font-medium whitespace-pre-wrap">{selected.notes}</div></div>
              )}
              <div>
                <div className="text-muted-foreground mb-2">Statut</div>
                <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v as OrderStatus)}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-muted-foreground mb-2">Produits</div>
                <div className="border rounded-lg divide-y">
                  {items.map(it => (
                    <div key={it.id} className="p-3 flex justify-between gap-3">
                      <div>
                        <div className="font-medium">{it.product_name}</div>
                        <div className="text-xs text-muted-foreground">{Number(it.unit_price).toLocaleString()} DZD × {it.quantity}</div>
                      </div>
                      <div className="font-medium whitespace-nowrap">{(Number(it.unit_price) * it.quantity).toLocaleString()} DZD</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-3 text-base">
                  <span>Total</span><span>{Number(selected.total).toLocaleString()} DZD</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
