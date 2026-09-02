import { useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

const HIGHLIGHT_DURATION_MS = 2400;

const resolveScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export const useAnchorHighlight = (): string | null => {
  const anchorId = useLocation({ select: (location) => location.hash });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (anchorId === '') {
      setHighlightedId(null);
      return;
    }
    const target = document.getElementById(anchorId);
    if (target === null) {
      setHighlightedId(null);
      return;
    }
    target.scrollIntoView({ behavior: resolveScrollBehavior(), block: 'center' });
    setHighlightedId(anchorId);
    const timer = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [anchorId]);

  return highlightedId;
};
