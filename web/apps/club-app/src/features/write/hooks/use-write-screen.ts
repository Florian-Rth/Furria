import type { KkScreenOrigin } from '@furria/ui';
import { useBlocker, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { registerActiveLeaveGuard } from '../active-guard';
import { blocksLeaving } from '../leave-guard';
import { toOriginHref } from '../origin-href';

const NOOP = (): void => {};

export interface WriteScreenGuard {
  open: boolean;
  discard: () => void;
  keepEditing: () => void;
}

export interface WriteScreenControl {
  guard: WriteScreenGuard;
  leave: () => void;
}

interface WriteScreenInput {
  origin: KkScreenOrigin;
  isDirty: boolean;
}

export const useWriteScreen = ({ origin, isDirty }: WriteScreenInput): WriteScreenControl => {
  const router = useRouter();
  const [nativeBackBlocked, setNativeBackBlocked] = useState(false);

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => isDirty && blocksLeaving(current, next),
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  });

  const requestLeave = (): boolean => {
    if (!isDirty) {
      return false;
    }

    setNativeBackBlocked(true);
    return true;
  };

  useEffect(() => registerActiveLeaveGuard({ requestLeave }), [requestLeave]);

  const guard: WriteScreenGuard =
    blocker.status === 'blocked'
      ? { open: true, discard: blocker.proceed, keepEditing: blocker.reset }
      : nativeBackBlocked
        ? {
            open: true,
            discard: () => {
              setNativeBackBlocked(false);
              router.history.back();
            },
            keepEditing: () => {
              setNativeBackBlocked(false);
            },
          }
        : { open: false, discard: NOOP, keepEditing: NOOP };

  const leave = (): void => {
    void router.navigate({ href: toOriginHref(origin) });
  };

  return { guard, leave };
};
