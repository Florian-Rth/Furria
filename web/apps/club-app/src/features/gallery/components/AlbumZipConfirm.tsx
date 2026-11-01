import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import {
  ZIP_CANCEL_LABEL,
  ZIP_CLOSE_LABEL,
  ZIP_CONFIRM_EXPLANATION,
  ZIP_CONFIRM_EYEBROW,
  ZIP_CONFIRM_LABEL,
  ZIP_CONFIRM_QUESTION,
} from '../album-zip-copy';
import type { AlbumZip } from '../hooks/use-album-zip';

interface AlbumZipConfirmProps {
  zip: AlbumZip;
}

export const AlbumZipConfirm: FC<AlbumZipConfirmProps> = ({ zip }) => {
  const consequence = zip.replaces ?? undefined;

  return (
    <KkConfirmDialog
      open={zip.open}
      onClose={zip.close}
      onConfirm={zip.confirm}
      eyebrow={ZIP_CONFIRM_EYEBROW}
      question={ZIP_CONFIRM_QUESTION}
      explanation={ZIP_CONFIRM_EXPLANATION}
      facts={zip.facts}
      consequence={consequence}
      confirmLabel={ZIP_CONFIRM_LABEL}
      cancelLabel={ZIP_CANCEL_LABEL}
      closeLabel={ZIP_CLOSE_LABEL}
    />
  );
};
