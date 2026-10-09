import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { countsLine } from '../gallery-view';
import { useAlbumFormDeletion } from '../hooks/use-album-form-deletion';
import type { AlbumDetails } from '../schemas';

const DELETE_LABEL = 'Album löschen';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const EXPLANATION =
  'Das Album wandert mit allen Fotos und Videos in den Papierkorb und ist sofort von der Website verschwunden.';
const CONSEQUENCE =
  'Nach 30 Tagen ist es endgültig gelöscht — bis dahin lässt es sich wiederherstellen.';

interface AlbumFormDeletionLineProps {
  album: AlbumDetails;
}

export const AlbumFormDeletionLine: FC<AlbumFormDeletionLineProps> = ({ album }) => {
  const deletion = useAlbumFormDeletion(album.albumId);
  const question = `„${album.title}" löschen?`;
  const facts = [{ label: 'Inhalt', value: countsLine(album) }];
  const error = deletion.rejection ?? undefined;

  return (
    <>
      <KkWriteScreen.Danger label={DELETE_LABEL} onSelect={deletion.open} />
      <KkConfirmDialog
        open={deletion.isOpen}
        onClose={deletion.close}
        onConfirm={deletion.submit}
        tone="danger"
        eyebrow={DELETE_LABEL}
        question={question}
        explanation={EXPLANATION}
        facts={facts}
        consequence={CONSEQUENCE}
        error={error}
        confirmLabel={DELETE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={deletion.isSaving}
      />
    </>
  );
};
