import type { KkPromoArrival } from '@furria/ui/promo-stage-types';
import { useEffect, useState } from 'react';
import { usePromoMembersQuery } from '../api';
import { arrivalShowOf, freshMembersOf } from '../arrival-show';
import { moreNamesOf } from '../promo-copy';
import type { PromoMember, PromoMembersResponse } from '../schemas';

const NO_MEMBERS: readonly PromoMember[] = [];

interface PromoMembers {
  members: readonly PromoMember[];
  arrival: KkPromoArrival | null;
}

interface Showing {
  arrival: KkPromoArrival;
  ms: number;
}

export const usePromoMembers = (): PromoMembers => {
  const { data } = usePromoMembersQuery();
  const [seenData, setSeenData] = useState<PromoMembersResponse | undefined>(undefined);
  const [seen, setSeen] = useState<ReadonlySet<number> | null>(null);
  const [queue, setQueue] = useState<readonly PromoMember[]>([]);
  const [showing, setShowing] = useState<Showing | null>(null);

  if (data !== seenData) {
    setSeenData(data);
    if (data !== undefined) {
      const ids = data.members.map((member) => member.accountId);

      if (seen === null) {
        setSeen(new Set(ids));
      } else {
        const fresh = freshMembersOf(seen, data.members);

        if (fresh.length > 0) {
          setSeen(new Set([...seen, ...ids]));
          setQueue([...queue, ...fresh]);
        }
      }
    }
  }

  if (showing === null && queue.length > 0) {
    const show = arrivalShowOf(queue);

    setShowing({
      arrival: { key: Date.now() + Math.random(), names: show.names, more: moreNamesOf(show.more) },
      ms: show.ms,
    });
    setQueue([]);
  }

  useEffect(() => {
    if (showing === null) {
      return;
    }
    const timer = window.setTimeout(() => {
      setShowing(null);
    }, showing.ms);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showing]);

  return { members: data?.members ?? NO_MEMBERS, arrival: showing?.arrival ?? null };
};
