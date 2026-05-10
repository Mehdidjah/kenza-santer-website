import { Injectable, type MessageEvent } from '@nestjs/common';
import { merge, Observable, of, Subject } from 'rxjs';

export type SyncEventType =
  | 'connected'
  | 'catalog.changed'
  | 'product.changed'
  | 'category.changed'
  | 'order.changed';

@Injectable()
export class EventsService {
  private readonly publicEvents = new Subject<MessageEvent>();
  private readonly adminEvents = new Subject<MessageEvent>();

  publicStream(): Observable<MessageEvent> {
    return merge(of({ type: 'connected', data: { ok: true } }), this.publicEvents.asObservable());
  }

  adminStream(): Observable<MessageEvent> {
    return merge(of({ type: 'connected', data: { ok: true } }), this.adminEvents.asObservable());
  }

  emitCatalog(type: Exclude<SyncEventType, 'connected' | 'order.changed'>, data: Record<string, unknown> = {}) {
    this.publicEvents.next({ type, data });
    this.publicEvents.next({ type: 'catalog.changed', data });
    this.adminEvents.next({ type, data });
    this.adminEvents.next({ type: 'catalog.changed', data });
  }

  emitOrder(data: Record<string, unknown> = {}) {
    this.adminEvents.next({ type: 'order.changed', data });
  }
}
