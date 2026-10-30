import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCRow } from '../hooks/use-season-c';
import { CHECKS_SHOWN } from '../season-c-layout';
import { SeasonCCheck } from './SeasonCCheck';

interface SeasonCActCellProps {
  row: SeasonCRow;
}

export const SeasonCActCell: FC<SeasonCActCellProps> = ({ row }) => {
  const checks = row.checks.map((check) => <SeasonCCheck key={check.check} check={check} />);

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <KkLaneProgress
        done={row.done}
        total={row.total}
        text={row.readinessText}
        label={row.readinessLabel}
        expanded={row.selected}
        onPress={row.select}
      />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <KkText variant="body2" clamp={1}>
          {row.name}
        </KkText>
        <KkMeta lines={1}>{row.meta}</KkMeta>
      </Stack>
      <Stack direction="row" sx={{ display: CHECKS_SHOWN, flexShrink: 0 }}>
        {checks}
      </Stack>
    </Stack>
  );
};
