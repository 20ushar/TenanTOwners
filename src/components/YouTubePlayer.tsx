import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';

interface YouTubePlayerProps {
  url: string;
  title: string;
  active?: boolean;
  className?: string;
}

export function YouTubePlayer({ url, title, active = true, className = '' }: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(url);
  const thumbnailUrl = getYouTubeThumbnailUrl(url);

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  if (!embedUrl || !thumbnailUrl) return null;

  return (
    <div className={`relative h-full w-full bg-black ${className}`}>
      {active && playing ? (
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative h-full w-full overflow-hidden"
          aria-label={`Play YouTube tour: ${title}`}
        >
          <img
            src={thumbnailUrl}
            alt={`YouTube video tour for ${title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-current" />
          </span>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white">
            Play Video Tour
          </span>
        </button>
      )}
    </div>
  );
}
