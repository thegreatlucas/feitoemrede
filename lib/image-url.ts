export function businessImageUrl(path?: string | null) {
  if (!path || !/^[0-9a-f-]{36}\/(logo|facade)-[0-9a-f-]{36}\.webp$/.test(path))
    return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/business-images/${path}`
    : null;
}
