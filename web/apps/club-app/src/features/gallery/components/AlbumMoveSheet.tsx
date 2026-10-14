import { KkMeta, KkRetryAlert, KkSelectRow, KkSheet, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MOVE_SHEET_ID, MOVE_SHEET_TITLE, SHEET_CLOSE_LABEL } from '../album-labels';
import { GALLERY_RETRY_LABEL } from '../gallery-copy';
import { useAlbumMoveTargets } from '../hooks/use-album-move-targets';

const NO_TARGETS = 'Es gibt noch kein anderes Album.';
const LOADING_ROWS = 4;

interface AlbumMoveSheetProps {
  albumId: number;
  onMove: (albumId: number, title: string) => void;
}

export const AlbumMoveSheet: FC<AlbumMoveSheetProps> = ({ albumId, onMove }) => {
  const moveTargets = useAlbumMoveTargets(albumId);
  const rows = moveTargets.targets.map((target) => {
    const move = (): void => onMove(target.albumId, target.title);
    return (
      <KkSelectRow key={target.albumId} title={target.title} meta={target.meta} onClick={move} />
    );
  });
  const loading =
    moveTargets.status === 'loading' ? <KkSkeletonRow count={LOADING_ROWS} shape="select" /> : null;
  const failure =
    moveTargets.status === 'failed' ? (
      <KkRetryAlert
        message={moveTargets.failure}
        retrying={moveTargets.retrying}
        onRetry={moveTargets.retry}
        retryLabel={GALLERY_RETRY_LABEL}
      />
    ) : null;
  const empty = moveTargets.status === 'empty' ? <KkMeta>{NO_TARGETS}</KkMeta> : null;

  return (
    <KkSheet id={MOVE_SHEET_ID} title={MOVE_SHEET_TITLE} closeLabel={SHEET_CLOSE_LABEL}>
      <KkSheet.Body>
        {loading}
        {failure}
        {empty}
        <Stack>{rows}</Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
