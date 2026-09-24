import { KK_LANDING_ATTRIBUTE, kkTokens } from '@furria/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { scrollElementIntoView } from '@/lib/scroll-to';

const appRouteApi = getRouteApi('/_app');
const HOLD_MS = kkTokens.motion.rowHighlightSeconds * 1000;
const FIND_TIMEOUT_MS = 4000;

export interface LandingState {
  highlightedKey: string | null;
}

export const useLanding = (): LandingState => {
  const { changed } = appRouteApi.useSearch();
  const navigate = useNavigate();
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  useEffect(() => {
    if (changed === undefined) {
      return;
    }

    const clearChanged = (): void => {
      void navigate({
        to: '.',
        search: (previous) => ({ ...previous, changed: undefined }),
        replace: true,
        resetScroll: false,
      });
    };

    const land = (node: Element): void => {
      scrollElementIntoView(node, 'center');
      setHighlightedKey(changed);
      clearChanged();
    };

    const findNode = (): Element | null =>
      document.querySelector(`[${KK_LANDING_ATTRIBUTE}="${changed}"]`);

    const existing = findNode();
    if (existing !== null) {
      land(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const node = findNode();
      if (node !== null) {
        observer.disconnect();
        land(node);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = window.setTimeout(() => {
      observer.disconnect();
      clearChanged();
    }, FIND_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [changed, navigate]);

  useEffect(() => {
    if (highlightedKey === null) {
      return;
    }

    const holdTimer = window.setTimeout(() => {
      setHighlightedKey(null);
    }, HOLD_MS);

    return () => {
      window.clearTimeout(holdTimer);
    };
  }, [highlightedKey]);

  return { highlightedKey };
};
