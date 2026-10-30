import { KkFilterChips } from '@furria/ui/KkFilterChips';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCState } from '../hooks/use-season-c';
import { FILTER_LABEL, SESSION_LABEL } from '../season-c-copy';

interface SeasonCToolsProps {
  season: SeasonCState;
}

export const SeasonCTools: FC<SeasonCToolsProps> = ({ season }) => (
  <Stack direction="row" sx={{ gap: 1, minWidth: 0, alignItems: 'center' }}>
    <KkFilterChips
      label={SESSION_LABEL}
      options={season.sessionOptions}
      value={season.session}
      onChange={season.setSession}
      sx={{ flexShrink: 0 }}
    />
    <KkFilterChips
      label={FILTER_LABEL}
      options={season.filterOptions}
      value={season.filter}
      onChange={season.setFilter}
      sx={{ minWidth: 0, flex: 1 }}
    />
  </Stack>
);
