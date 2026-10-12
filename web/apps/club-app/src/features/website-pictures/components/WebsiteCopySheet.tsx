import { KkFrame, KkSelectRow, KkSheet, KkText } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BoardPosition } from '../website-board';
import {
  aspectWordOf,
  CLOSE_LABEL,
  COPY_EMPTY,
  COPY_NOTE,
  COPY_SHEET_ID,
  COPY_TITLE,
  positionNameOf,
} from '../website-copy';

const THUMB_WIDTH = 56;

interface WebsiteCopySheetProps {
  sources: readonly BoardPosition[];
  onPick: (source: BoardPosition) => void;
}

export const WebsiteCopySheet: FC<WebsiteCopySheetProps> = ({ sources, onPick }) => {
  const rows = sources.map((source) => {
    const name = positionNameOf(source.slotTitle, source.position, source.count);
    const format = aspectWordOf(source.aspect);
    const thumb = source.picture?.picture.picture?.smallUrl ?? undefined;
    const pick = (): void => {
      onPick(source);
    };
    const trailing = (
      <Box sx={{ width: THUMB_WIDTH }}>
        <KkFrame label={name} source={thumb} aspect={source.aspect} />
      </Box>
    );
    return (
      <KkSelectRow
        key={`${source.slot}:${source.position}`}
        title={name}
        meta={format}
        trailing={trailing}
        onClick={pick}
      />
    );
  });
  const empty = sources.length === 0 ? <KkText variant="body2">{COPY_EMPTY}</KkText> : null;

  return (
    <KkSheet id={COPY_SHEET_ID} title={COPY_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <KkText variant="caption">{COPY_NOTE}</KkText>
        <Stack>
          {rows}
          {empty}
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
