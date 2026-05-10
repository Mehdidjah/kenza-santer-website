export const DEFAULT_PRODUCT_IMAGE = '/picture/WhatsApp%20Image%202026-05-01%20at%2016.20.54.jpeg';

export function resolveProductImage(src?: string | null) {
  return src && src !== '/placeholder.svg' ? src : DEFAULT_PRODUCT_IMAGE;
}
