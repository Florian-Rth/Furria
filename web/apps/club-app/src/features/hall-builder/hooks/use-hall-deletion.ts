import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { useDeleteHallMutation } from '@/features/hall-plan/api';
import { toOriginHref } from '@/features/write/origin-href';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';

export interface HallDeletion {
  isOpen: boolean;
  isDeleting: boolean;
  rejection: string | null;
  open: () => void;
  close: () => void;
  confirm: () => void;
}

export const useHallDeletion = (hallId: number, origin: KkScreenOrigin): HallDeletion => {
  const remove = useDeleteHallMutation();
  const goBackTo = useGoBackTo();
  const [isOpen, setOpen] = useState(false);

  return {
    isOpen,
    isDeleting: remove.isPending,
    rejection: toWriteErrorMessage(remove.error),
    open: () => {
      remove.reset();
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    confirm: () => {
      remove.mutate(hallId, {
        onSuccess: () => {
          setOpen(false);
          void goBackTo({ href: toOriginHref(origin) });
        },
      });
    },
  };
};
