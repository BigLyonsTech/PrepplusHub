import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILE_EXTENSIONS = /\.(mp4|webm|ogg)(\?.*)?$/i

// Accepts either a direct video file URL or an embed URL (YouTube/Vimeo
// "embed" form, e.g. https://www.youtube.com/embed/VIDEO_ID). Leave `src`
// empty to show a placeholder card instead of a broken player.
export default function VideoEmbed({ src, title, className }) {
  return (
    <div className={cn('relative aspect-video rounded-2xl overflow-hidden bg-ink', className)}>
      {src ? (
        FILE_EXTENSIONS.test(src) ? (
          <video src={src} controls className="w-full h-full object-cover" />
        ) : (
          <iframe
            src={src}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-onDark/50">
          <span className="size-12 rounded-full bg-onDark/10 flex items-center justify-center">
            <Play size={20} className="ml-0.5" />
          </span>
          <span className="text-sm">{title || 'Video coming soon'}</span>
        </div>
      )}
    </div>
  )
}
