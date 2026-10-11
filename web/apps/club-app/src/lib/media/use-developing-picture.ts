import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useRef } from 'react';
import { DEVELOPING_POLL_MS } from './developing';

interface DevelopingPictureOptions {
  isDeveloping: boolean;
  refresh: () => void;
  shownIn: readonly QueryKey[];
}

export const useDevelopingPicture = ({
  isDeveloping,
  refresh,
  shownIn,
}: DevelopingPictureOptions): (() => Promise<void>) => {
  const queryClient = useQueryClient();
  const wasDeveloping = useRef(isDeveloping);

  const announce = async (): Promise<void> => {
    refresh();
    await Promise.all(shownIn.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };

  const poll = useEffectEvent((): void => {
    refresh();
  });
  const developed = useEffectEvent((): void => {
    void announce();
  });
  useEffect(() => {
    const hasDeveloped = wasDeveloping.current && !isDeveloping;
    wasDeveloping.current = isDeveloping;
    if (hasDeveloped) {
      developed();
    }
    if (!isDeveloping) {
      return undefined;
    }
    const timer = window.setInterval(poll, DEVELOPING_POLL_MS);
    return () => window.clearInterval(timer);
  }, [isDeveloping]);

  return announce;
};
