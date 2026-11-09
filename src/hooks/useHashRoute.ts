import { useCallback, useEffect, useState } from 'react';

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const raw = hash.replace(/^#/, '') || '/';
  const [rawPath, rawQuery = ''] = raw.split('?');
  let path = rawPath || '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  const query = new URLSearchParams(rawQuery);

  const navigate = useCallback((to: string) => {
    if (window.location.hash === `#${to}`) return;
    window.location.hash = to;
  }, []);

  return { path, query, navigate };
}
