import { Star } from '@/lib/icons';

interface Props {
  rating: number;
  size?: 'sm' | 'md';
  showCount?: number;
}

export default function StarRating({ rating, size = 'sm', showCount }: Props) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${starSize} ${i <= Math.floor(rating) ? 'fill-secondary text-secondary' : i <= rating ? 'fill-secondary/50 text-secondary' : 'text-border fill-border'}`}
          strokeWidth={1.5}
        />
      ))}
      {showCount !== undefined && <span className="text-xs text-muted-foreground ml-1">({showCount})</span>}
    </div>
  );
}
