import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import type { SeasonPick } from '../hooks/use-season-a';
import { toPaneMeta } from '../season-a-copy';
import { SeasonDetails } from './SeasonDetails';

interface SeasonSheetBodyProps {
  pick: SeasonPick;
  onToggle: (act: SeasonAct, evening: SeasonEvening) => void;
}

export const SeasonSheetBody: FC<SeasonSheetBodyProps> = ({ pick, onToggle }) => {
  const meta = toPaneMeta(pick.evening.title, pick.evening.startsAt);

  return (
    <Stack sx={{ gap: 1.5, px: 2, pb: 3, minWidth: 0, overflowY: 'auto' }}>
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <KkHeading level={3} component="h2">
          {pick.act.name}
        </KkHeading>
        <KkMeta>{meta}</KkMeta>
      </Stack>
      <SeasonDetails pick={pick} onToggle={onToggle} />
    </Stack>
  );
};
