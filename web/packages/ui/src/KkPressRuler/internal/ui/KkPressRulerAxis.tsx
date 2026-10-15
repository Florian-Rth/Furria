import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkPressRulerAxisLabel } from '../../press-ruler-data';
import { placedAxisLabelsOf } from '../logic/ruler-axis';
import { AXIS_HEIGHT, GUTTER_END, GUTTER_START } from '../logic/ruler-metrics';
import { KkPressRulerAxisMark } from './KkPressRulerAxisMark';

interface KkPressRulerAxisProps {
  labels: readonly KkPressRulerAxisLabel[];
  width: number | null;
  measure: (node: HTMLDivElement | null) => void;
}

export const KkPressRulerAxis: FC<KkPressRulerAxisProps> = ({ labels, width, measure }) => {
  const marks =
    width === null
      ? null
      : placedAxisLabelsOf(labels, width).map((label, order) => (
          <KkPressRulerAxisMark key={label.text} label={label} order={order} />
        ));

  return (
    <Stack direction="row" aria-hidden sx={{ minWidth: 0 }}>
      <Box sx={(theme) => ({ width: theme.spacing(GUTTER_START), flexShrink: 0 })} />
      <Box
        ref={measure}
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          minWidth: 0,
          height: theme.spacing(AXIS_HEIGHT),
        })}
      >
        {marks}
      </Box>
      <Box sx={(theme) => ({ width: theme.spacing(GUTTER_END), flexShrink: 0 })} />
    </Stack>
  );
};
