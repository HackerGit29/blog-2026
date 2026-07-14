export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getVimeoId(url: string): string | null {
  const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function isVideoUrl(url: string): boolean {
  return !!getYouTubeId(url) || !!getVimeoId(url);
}

export function getEmbedUrl(url: string): string {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?rel=0&vq=hd1080&cc_load_policy=1&modestbranding=1`;

  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;

  return url;
}

export function getVideoThumbnail(url: string, fallback: string = ''): string {
  const ytId = getYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  
  // Vimeo requires API call for thumbnail, so we return fallback for now
  // Ideally, use a default placeholder or fetch from Vimeo API.
  return fallback;
}
