import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { X, UploadCloud } from '@/lib/icons';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/images';

export interface EditingProduct {
  id?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  full_description: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  in_stock: boolean;
  rating: number;
  review_count: number;
  images: string[];
  imageKeys: string[];
  ingredients: string[];
  how_to_use: string[];
  precautions: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: EditingProduct | null;
  onSaved: () => void;
}

const empty: EditingProduct = {
  name: '', brand: '', category: '', description: '', full_description: '',
  price: 0, original_price: null, badge: null, in_stock: true, rating: 4.5, review_count: 0,
  images: [], imageKeys: [], ingredients: [], how_to_use: [], precautions: [],
};

function MultilineList({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value.join('\n')}
        onChange={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
        placeholder={placeholder ?? 'Une ligne par élément'}
        rows={4}
      />
      <p className="text-xs text-muted-foreground">Une ligne par élément</p>
    </div>
  );
}

export default function ProductEditor({ open, onClose, initial, onSaved }: Props) {
  const { data: categories = [] } = useCategories();
  const [p, setP] = useState<EditingProduct>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setP(initial ?? empty); }, [initial, open]);

  const upload = async (files: FileList | null) => {
    if (!files) return;
    if (p.imageKeys.length + files.length > 4) {
      toast({ title: 'Maximum 4 images', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const urls: string[] = [];
    const keys: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const upload = await api.createProductImageUpload(file.name, file.type || 'application/octet-stream');
        const response = await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!response.ok) throw new Error(`Upload échoué (${response.status})`);
        urls.push(upload.previewUrl);
        keys.push(upload.objectKey);
      } catch (error) {
        toast({ title: 'Upload échoué', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
      }
    }
    const existingImages = p.imageKeys.length ? p.images : [];
    setP({ ...p, images: [...existingImages, ...urls].slice(0, 4), imageKeys: [...p.imageKeys, ...keys].slice(0, 4) });
    setUploading(false);
  };

  const removeImage = (i: number) => setP({ ...p, images: p.images.filter((_, idx) => idx !== i), imageKeys: p.imageKeys.filter((_, idx) => idx !== i) });

  const save = async () => {
    if (!p.name || !p.category) { toast({ title: 'Nom et catégorie requis', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = {
      name: p.name, brand: p.brand, category: p.category,
      description: p.description, full_description: p.full_description,
      price: p.price, original_price: p.original_price, badge: p.badge || null,
      in_stock: p.in_stock, rating: p.rating, review_count: p.review_count,
      images: p.imageKeys, ingredients: p.ingredients, how_to_use: p.how_to_use, precautions: p.precautions,
    };
    try {
      await (p.id ? api.updateProduct(p.id, payload) : api.createProduct(payload));
      toast({ title: 'Produit enregistré' });
      onSaved();
      onClose();
    } catch (error) {
      toast({ title: 'Erreur', description: error instanceof Error ? error.message : 'Erreur inconnue', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const realImages = p.imageKeys.length ? p.images : [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{p.id ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2"><Label>Nom *</Label><Input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Marque</Label><Input value={p.brand} onChange={e => setP({ ...p, brand: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={p.category} onValueChange={v => setP({ ...p, category: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Prix (DZD) *</Label><Input type="number" value={p.price} onChange={e => setP({ ...p, price: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Prix barré</Label><Input type="number" value={p.original_price ?? ''} onChange={e => setP({ ...p, original_price: e.target.value ? Number(e.target.value) : null })} /></div>
            <div className="space-y-2"><Label>Badge</Label><Input value={p.badge ?? ''} placeholder="ex: -20%, Best Seller" onChange={e => setP({ ...p, badge: e.target.value })} /></div>
            <div className="space-y-2 flex items-center gap-3 pt-7"><Switch checked={p.in_stock} onCheckedChange={v => setP({ ...p, in_stock: v })} /><Label>En stock</Label></div>
          </div>

          <div className="space-y-2">
            <Label>Description courte</Label>
            <Textarea rows={2} value={p.description} onChange={e => setP({ ...p, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description complète</Label>
            <Textarea rows={4} value={p.full_description} onChange={e => setP({ ...p, full_description: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Images ({realImages.length}/4)</Label>
            <div className="grid grid-cols-4 gap-3">
              {realImages.length === 0 && (
                <div className="relative aspect-square rounded-md overflow-hidden border border-dashed border-border bg-muted">
                  <img src={DEFAULT_PRODUCT_IMAGE} alt="" className="w-full h-full object-cover opacity-80" />
                  <span className="absolute inset-x-1 bottom-1 rounded bg-background/85 px-1 py-0.5 text-center text-[10px] text-muted-foreground">
                    Image par défaut
                  </span>
                </div>
              )}
              {realImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {realImages.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-warm-card text-xs">
                  <UploadCloud className="w-6 h-6 mb-1" />
                  {uploading ? 'Envoi…' : 'Ajouter'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => upload(e.target.files)} />
                </label>
              )}
            </div>
          </div>

          <MultilineList label="Composition (ingrédients)" value={p.ingredients} onChange={v => setP({ ...p, ingredients: v })} />
          <MultilineList label="Comment utiliser" value={p.how_to_use} onChange={v => setP({ ...p, how_to_use: v })} />
          <MultilineList label="Précautions" value={p.precautions} onChange={v => setP({ ...p, precautions: v })} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
