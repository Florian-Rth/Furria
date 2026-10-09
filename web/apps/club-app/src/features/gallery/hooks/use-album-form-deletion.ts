import { useKkNotice } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { GALLERY_PATH } from '@/features/session';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAlbumDeletion } from '../api';

const BINNED_MESSAGE = 'Album liegt im Papierkorb — 30 Tage lang wiederherstellbar.';

export interface AlbumFormDeletion {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useAlbumFormDeletion = (albumId: number): AlbumFormDeletion => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const deletion = useAlbumDeletion();
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();

  return {
    isOpen,
    open: () => {
      setRejection(null);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    rejection,
    isSaving: deletion.isPending,
    submit: () => {
      setRejection(null);
      deletion.mutate(albumId, {
        onSuccess: () => {
          setIsOpen(false);
          raiseNotice({ tone: 'success', message: BINNED_MESSAGE });
          void navigate({ to: GALLERY_PATH, replace: true, ignoreBlocker: true });
        },
        onError: (error) => setRejection(toWriteErrorMessage(error)),
      });
    },
  };
};
