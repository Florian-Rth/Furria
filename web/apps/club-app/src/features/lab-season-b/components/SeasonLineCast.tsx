import { KkButton } from '@furria/ui/KkButton';
import { KkCastGrid } from '@furria/ui/KkCastGrid';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { useSeasonLineCast } from '../hooks/use-season-line-cast';
import {
  CAST_ADD,
  CAST_ADD_DONE,
  CAST_CLOSE,
  CAST_EMPTY,
  CAST_LABEL,
  CAST_NO_CHANGES,
  CAST_TITLE,
} from '../season-b-copy';
import { useSeasonBoardContext } from '../season-board-context';
import type { ColumnLine } from '../season-columns';
import { SeasonCastChanges } from './SeasonCastChanges';

interface SeasonLineCastProps {
  eventId: number;
  line: ColumnLine;
}

const keepSearching = (): void => undefined;

export const SeasonLineCast: FC<SeasonLineCastProps> = ({ eventId, line }) => {
  const board = useSeasonBoardContext();
  const cast = useSeasonLineCast(line, board.catalogueActOf(line.act.actId), eventId);
  const unchanged = cast.outNames.length === 0 && cast.inNames.length === 0;
  const changes = unchanged ? (
    <KkMeta>{CAST_NO_CHANGES}</KkMeta>
  ) : (
    <SeasonCastChanges outNames={cast.outNames} inNames={cast.inNames} />
  );
  const grid =
    cast.tiles.length === 0 ? (
      <KkMeta>{CAST_EMPTY}</KkMeta>
    ) : (
      <KkCastGrid
        label={CAST_LABEL}
        tiles={cast.tiles}
        addLabel={CAST_ADD}
        onToggle={cast.toggle}
        onAdd={cast.openAdding}
      />
    );
  const adding = cast.isAdding ? (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <PersonPicker selected={null} onSelect={cast.addPerson} onClear={keepSearching} />
      <KkButton size="small" variant="text" onClick={cast.closeAdding}>
        {CAST_ADD_DONE}
      </KkButton>
    </Stack>
  ) : null;

  return (
    <Box component="li" sx={{ minWidth: 0, p: 1 }}>
      <KkPanel variant="block" tone="raised">
        <Stack sx={{ gap: 1.25, minWidth: 0 }} aria-busy={cast.busy}>
          <KkEyebrow tone="muted">{CAST_TITLE}</KkEyebrow>
          {changes}
          {grid}
          {adding}
          <KkButton size="small" variant="text" onClick={board.closeLine}>
            {CAST_CLOSE}
          </KkButton>
        </Stack>
      </KkPanel>
    </Box>
  );
};
