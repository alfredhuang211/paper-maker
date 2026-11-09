import { useCallback, useEffect, useState } from 'react';
import { normalizeSeed, randomSeed } from '../core/random';

function readSeedFromHash(): string | null {
  const raw = window.location.hash.replace(/^#/, '');
  const query = raw.split('?')[1];
  if (!query) return null;
  return new URLSearchParams(query).get('seed');
}

function writeSeedToHash(seed: string): void {
  const path = window.location.hash.split('?')[0] || '#/';
  const next = `${path}?seed=${encodeURIComponent(seed)}`;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
}

export function useSeed() {
  const [seed, setSeedState] = useState<string>(() => normalizeSeed(readSeedFromHash() ?? randomSeed()));

  useEffect(() => {
    // Make sure a freshly opened tool page exposes the initial seed in the URL.
    writeSeedToHash(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSeed = useCallback((value: string) => {
    const next = normalizeSeed(value);
    setSeedState(next);
    writeSeedToHash(next);
  }, []);

  const regenerate = useCallback(() => {
    setSeed(randomSeed());
  }, [setSeed]);

  return { seed, setSeed, regenerate };
}

export function useClipboard(resetDelay = 1600) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), resetDelay);
    return () => window.clearTimeout(timer);
  }, [copied, resetDelay]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  return { copied, copy };
}

export function copyCurrentLink() {
  const url = window.location.href;
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(url);
  }
  return Promise.reject(new Error('Clipboard unavailable'));
}
