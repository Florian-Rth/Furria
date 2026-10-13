import { useEffect, useEffectEvent, useRef } from 'react';
import type { DomainChange } from '@/lib/query/reads';
import { useRefreshAfter } from '@/lib/query/use-refresh-after';
import { developingPollMsOf } from './developing';

interface DevelopingPictureOptions {
  isDeveloping: boolean;
  isStalled?: boolean;
  refresh: () => void;
  changes: readonly DomainChange[];
}

export const useDevelopingPicture = ({
  isDeveloping,
  isStalled = false,
  refresh,
  changes,
}: DevelopingPictureOptions): (() => Promise<void>) => {
  const refreshAfter = useRefreshAfter();
  const wasDeveloping = useRef(isDeveloping);

  const announce = async (): Promise<void> => {
    refresh();
    await refreshAfter(changes);
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
    const timer = window.setInterval(poll, developingPollMsOf(isStalled));
    return () => window.clearInterval(timer);
  }, [isDeveloping, isStalled]);

  return announce;
};
