import { KkSelectRow, KkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MOVE_SHEET_ID, MOVE_SHEET_TITLE, SHEET_CLOSE_LABEL } from '../album-labels';
import { useAlbumMoveTargets } from '../hooks/use-album-move-targets';

interface AlbumMoveSheetProps {
  albumId: number;
  onMove: (albumId: number, title: string) => void;
}

export const AlbumMoveSheet: FC<AlbumMoveSheetProps> = ({ albumId, onMove }) => {
  const targets = useAlbumMoveTargets(albumId);
  const rows = targets.map((target) => {
    const move = (): void => onMove(target.albumId, target.title);
    return (
      <KkSelectRow key={target.albumId} title={target.title} meta={target.meta} onClick={move} />
    );
  });

  return (
    <KkSheet id={MOVE_SHEET_ID} title={MOVE_SHEET_TITLE} closeLabel={SHEET_CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack>{rows}</Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
