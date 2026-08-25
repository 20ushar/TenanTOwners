const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com')
    ) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v') || '';
      } else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) {
          videoId = parts[1] || '';
        }
      }
    }

    return YOUTUBE_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function isYouTubeUrl(value?: string): boolean {
  return getYouTubeVideoId(value) !== null;
}

export function getYouTubeThumbnailUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(value: string): string | null {
  const videoId = getYouTubeVideoId(value);
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : null;
}

export function isSupportedPropertyVideoUrl(value?: string): boolean {
  if (!value) return true;
  if (isYouTubeUrl(value)) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && (
      url.hostname.toLowerCase() === 'res.cloudinary.com' ||
      /\.(mp4|webm)(?:$|\?)/i.test(url.pathname + url.search)
    );
  } catch {
    return false;
  }
}
