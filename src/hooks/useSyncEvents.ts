import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getAdminEventsUrl, publicEventsUrl } from '@/lib/api';

function invalidateCatalog(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ['products'] });
  qc.invalidateQueries({ queryKey: ['product'] });
  qc.invalidateQueries({ queryKey: ['categories'] });
}

function canUseEventSource() {
  return typeof window !== 'undefined' && 'EventSource' in window;
}

export function usePublicCatalogSync(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !canUseEventSource()) return;

    const source = new EventSource(publicEventsUrl, { withCredentials: true });
    const refreshCatalog = () => invalidateCatalog(qc);

    source.addEventListener('catalog.changed', refreshCatalog);

    return () => source.close();
  }, [enabled, qc]);
}

export function useAdminSync(enabled = true) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !canUseEventSource()) return;

    const source = new EventSource(getAdminEventsUrl(), { withCredentials: true });
    const refreshCatalog = () => {
      invalidateCatalog(qc);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    };
    const refreshOrders = () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-order'] });
    };

    source.addEventListener('catalog.changed', refreshCatalog);
    source.addEventListener('order.changed', refreshOrders);

    return () => source.close();
  }, [enabled, qc]);
}
