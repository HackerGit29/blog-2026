export function optimizedAvatar(url: string, width = 200): string {
  if (!url) return ''
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url
  return `${url}?width=${width}&quality=80&resize=cover`
}
