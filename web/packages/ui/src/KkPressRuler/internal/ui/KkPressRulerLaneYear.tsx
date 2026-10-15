import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkPressRulerLane } from '../../press-ruler-data';
import { GUTTER_START } from '../logic/ruler-metrics';

interface KkPressRulerLaneYearProps {
  lane: KkPressRulerLane;
  label: string;
  onSelect: () => void;
}

export const KkPressRulerLaneYear: FC<KkPressRulerLaneYearProps> = ({ lane, label, onSelect }) => {
  const yearVariant = lane.present ? 'h4' : 'caption';
  const yearColor = lane.present ? 'primary.main' : 'text.secondary';
  const yearWeight = lane.present ? undefined : 800;
  const numberLine = lane.present ? (
    <Typography variant="caption" sx={{ lineHeight: 1, color: 'text.disabled' }}>
      {lane.numberLabel}
    </Typography>
  ) : null;

  return (
    <ButtonBase
      aria-label={label}
      onClick={onSelect}
      data-kk-press-ruler-year
      sx={(theme) => ({
        width: theme.spacing(GUTTER_START),
        flexShrink: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        borderRadius: `${kkTokens.radius.base / 2}px`,
        ...focusRing(theme),
      })}
    >
      <Stack sx={{ alignItems: 'flex-start', gap: 0.25 }}>
        <Typography
          variant={yearVariant}
          sx={{
            lineHeight: 1,
            fontWeight: yearWeight,
            color: yearColor,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {lane.yearLabel}
        </Typography>
        {numberLine}
      </Stack>
    </ButtonBase>
  );
};
