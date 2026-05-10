import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <Badge className={ok ? 'bg-primary/10 text-primary border-0' : 'bg-destructive/10 text-destructive border-0'}>
      {ok ? 'OK' : 'Erreur'}
    </Badge>
  );
}

function Field({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <StatusBadge ok={ok} />
    </div>
  );
}

export default function SystemPanel() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-system-status'],
    queryFn: api.adminSystemStatus,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement du statut système…</div>;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Statut système</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>Réessayer</Button>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Impossible de charger le statut système.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Statut système</h2>
          <p className="text-sm text-muted-foreground">Vérifie la connexion backend, Postgres et Railway Bucket.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Vérification…' : 'Vérifier'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>PostgreSQL</CardTitle>
            <StatusBadge ok={data.database.connected} />
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Connexion DATABASE_URL" ok={data.database.connected} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Railway Bucket</CardTitle>
            <StatusBadge ok={data.bucket.configured && data.bucket.uploadPresign} />
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Bucket" ok={data.bucket.bucket === 'set'} />
            <Field label="Endpoint" ok={data.bucket.endpoint === 'set'} />
            <Field label="Region" ok={data.bucket.region === 'set'} />
            <Field label="Access key" ok={data.bucket.accessKeyId === 'set'} />
            <Field label="Secret key" ok={data.bucket.secretAccessKey === 'set'} />
            <Field label="Presigned upload" ok={data.bucket.uploadPresign} />
            {data.bucket.error && <p className="text-sm text-destructive">{data.bucket.error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
