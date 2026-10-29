import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkDropZone } from '@furria/ui/KkDropZone';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toArtworkFieldLine, toArtworkPickLabel } from '../club-record-labels';
import { useArtworkDrop } from '../hooks/use-artwork-drop';

const FIELD_LABEL = 'SVG-Datei';
const REMOVE_LABEL = 'Zeichnung entfernen';
const DRAG_HINT = 'Oder Datei hierher ziehen.';
const SVG_ACCEPT = '.svg,image/svg+xml';
const POINTER_ONLY = { display: 'none', '@media (pointer: fine)': { display: 'block' } } as const;

interface ClubStageArtworkFieldProps {
  hasArtwork: boolean;
  rejection: string | null;
  onPick: (file: File | null) => void;
  onClear: () => void;
}

export const ClubStageArtworkField: FC<ClubStageArtworkFieldProps> = ({
  hasArtwork,
  rejection,
  onPick,
  onClear,
}) => {
  const drop = useArtworkDrop(onPick);
  const line = toArtworkFieldLine(drop.dragging, hasArtwork);
  const pickLabel = toArtworkPickLabel(hasArtwork);

  const removal = hasArtwork ? (
    <KkButton size="small" variant="text" tone="danger" onClick={onClear}>
      {REMOVE_LABEL}
    </KkButton>
  ) : null;

  const failure = rejection === null ? null : <KkAlert severity="error">{rejection}</KkAlert>;

  return (
    <Stack
      onDragEnter={drop.onDragEnter}
      onDragOver={drop.onDragOver}
      onDragLeave={drop.onDragLeave}
      onDrop={drop.onDrop}
      sx={{ gap: 1, minWidth: 0 }}
    >
      <KkEyebrow tone="muted">{FIELD_LABEL}</KkEyebrow>
      <KkDropZone active={drop.dragging}>
        <KkMeta>{line}</KkMeta>
        <KkMeta sx={POINTER_ONLY}>{DRAG_HINT}</KkMeta>
        <Stack direction="row" sx={{ columnGap: 1, rowGap: 1, flexWrap: 'wrap' }}>
          <KkButton size="small" variant="outlined" onClick={drop.openPicker}>
            {pickLabel}
          </KkButton>
          {removal}
        </Stack>
        <Box
          component="input"
          type="file"
          accept={SVG_ACCEPT}
          ref={drop.fileInput}
          onChange={drop.onPicked}
          hidden
        />
      </KkDropZone>
      {failure}
    </Stack>
  );
};
