export function normalizeNextPath(nextPath?: string | null, fallback = '/todos') {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return fallback;
  }

  return nextPath;
}

export function buildLoginPath(nextPath?: string | null) {
  const normalizedNextPath = normalizeNextPath(nextPath);
  const params = new URLSearchParams({ next: normalizedNextPath });

  return `/auth/login?${params.toString()}`;
}
