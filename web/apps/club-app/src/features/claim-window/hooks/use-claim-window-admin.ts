import type { KkScreenActionBar } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { isForbiddenError } from '@/lib/query-error';
import {
  useClaimWindowOverviewQuery,
  useCloseClaimWindowMutation,
  useOpenClaimWindowMutation,
} from '../api';
import {
  CLAIM_WINDOW_PATH,
  WINDOW_CLOSE_LABEL,
  WINDOW_MOVE_LABEL,
  WINDOW_OPEN_LABEL,
} from '../claim-window-copy';
import type { WindowEndFields } from '../claim-window-format';
import { closesAtOf, windowEndFieldsOf } from '../claim-window-format';
import type { ClaimWindowOverview } from '../schemas';

export type ClaimWindowAdminRead =
  | { kind: 'loading' }
  | { kind: 'denied' }
  | { kind: 'failed' }
  | { kind: 'shown'; overview: ClaimWindowOverview };

export interface ClaimWindowAdminControl {
  read: ClaimWindowAdminRead;
  end: WindowEndFields;
  setEndDay: (day: string | null) => void;
  setEndTime: (time: string) => void;
  action: KkScreenActionBar | undefined;
  address: string;
  isRetrying: boolean;
  retry: () => void;
}

const readOf = (
  overview: ClaimWindowOverview | undefined,
  error: Error | null,
): ClaimWindowAdminRead => {
  if (overview !== undefined) {
    return { kind: 'shown', overview };
  }
  if (isForbiddenError(error)) {
    return { kind: 'denied' };
  }

  return error === null ? { kind: 'loading' } : { kind: 'failed' };
};

export const useClaimWindowAdmin = (): ClaimWindowAdminControl => {
  const query = useClaimWindowOverviewQuery();
  const openWindow = useOpenClaimWindowMutation();
  const closeWindow = useCloseClaimWindowMutation();
  const closesAt = query.data?.window?.closesAt ?? null;
  const [end, setEnd] = useState<WindowEndFields>(() => windowEndFieldsOf(closesAt, new Date()));
  const [shownClosesAt, setShownClosesAt] = useState<string | null>(closesAt);

  if (closesAt !== shownClosesAt) {
    setShownClosesAt(closesAt);
    setEnd(windowEndFieldsOf(closesAt, new Date()));
  }

  const isOpen = closesAt !== null;
  const read = readOf(query.data, query.error);
  const open: KkScreenActionBar['primary'] = {
    label: isOpen ? WINDOW_MOVE_LABEL : WINDOW_OPEN_LABEL,
    icon: 'door',
    loading: openWindow.isPending,
    onSelect: () => {
      openWindow.mutate(closesAtOf(end));
    },
  };
  const close: KkScreenActionBar['primary'] = {
    label: WINDOW_CLOSE_LABEL,
    icon: 'lock',
    tone: 'danger',
    loading: closeWindow.isPending,
    onSelect: () => {
      closeWindow.mutate(undefined);
    },
  };

  return {
    read,
    end,
    setEndDay: (day) => {
      if (day !== null) {
        setEnd({ ...end, day });
      }
    },
    setEndTime: (time) => {
      setEnd({ ...end, time });
    },
    action:
      read.kind === 'shown' ? { primary: open, secondary: isOpen ? close : undefined } : undefined,
    address: `${globalThis.location.origin}${CLAIM_WINDOW_PATH}`,
    isRetrying: query.isFetching,
    retry: () => {
      void query.refetch();
    },
  };
};
