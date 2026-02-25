import { Star } from 'lucide-react'

export default function StarRating({ rating, onRatingChange, readonly = false, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const sizeClass = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-transparent text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  )
}