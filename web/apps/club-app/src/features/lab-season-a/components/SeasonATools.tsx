import { KkFilterChips } from '@furria/ui/KkFilterChips';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonA } from '../hooks/use-season-a';
import { ORDER_CHOICE_LABEL, ORDER_OPTIONS, SESSION_CHOICE_LABEL } from '../season-a-copy';

interface SeasonAToolsProps {
  season: SeasonA;
}

export const SeasonATools: FC<SeasonAToolsProps> = ({ season }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
    <KkFilterChips
      label={SESSION_CHOICE_LABEL}
      options={season.sessionOptions}
      value={season.sessionValue}
      onChange={season.chooseSession}
      sx={{ flexShrink: 0 }}
    />
    <KkFilterChips
      label={ORDER_CHOICE_LABEL}
      options={ORDER_OPTIONS}
      value={season.order}
      onChange={season.chooseOrder}
    />
  </Stack>
);
