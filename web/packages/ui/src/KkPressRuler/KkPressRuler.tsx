import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { createPortal } from 'react-dom';
import type { KkSx } from '../kk-sx';
import { rulerPressOf } from './internal/logic/ruler-press';
import { useRulerProbe } from './internal/logic/use-ruler-probe';
import { useRulerWidth } from './internal/logic/use-ruler-width';
import { KkPressRulerAxis } from './internal/ui/KkPressRulerAxis';
import { KkPressRulerLaneRow } from './internal/ui/KkPressRulerLaneRow';
import { KkPressRulerLegend } from './internal/ui/KkPressRulerLegend';
import { KkPressRulerLoupe } from './internal/ui/KkPressRulerLoupe';
import type {
  KkPressRulerAxisLabel,
  KkPressRulerLabels,
  KkPressRulerLane,
  KkPressRulerLegendEntry,
} from './press-ruler-data';

interface KkPressRulerProps {
  label: string;
  lanes: readonly KkPressRulerLane[];
  axis: readonly KkPressRulerAxisLabel[];
  today: number | null;
  draftCount: number;
  legend: readonly KkPressRulerLegendEntry[];
  labels: KkPressRulerLabels;
  onReveal: (id: string) => void;
  onSection: (laneKey: string) => void;
  sx?: KkSx;
}

export const KkPressRuler: FC<KkPressRulerProps> = ({
  label,
  lanes,
  axis,
  today,
  draftCount,
  legend,
  labels,
  onReveal,
  onSection,
  sx,
}) => {
  const measure = useRulerWidth();
  const probe = useRulerProbe(onReveal);
  const press = rulerPressOf(lanes);
  const { width } = measure;

  const rows =
    width === null
      ? null
      : lanes.map((lane, order) => (
          <KkPressRulerLaneRow
            key={lane.key}
            lane={lane}
            order={order}
            width={width}
            today={today}
            draftCount={draftCount}
            press={press}
            probe={probe}
            labels={labels}
            onSection={onSection}
          />
        ));

  const loupe =
    probe.probe === null
      ? null
      : createPortal(
          <KkPressRulerLoupe probe={probe.probe} today={today} labels={labels} />,
          document.body,
        );

  return (
    <Stack
      component="nav"
      aria-label={label}
      ref={probe.rootRef}
      data-kk-press-ruler
      sx={[
        {
          position: 'relative',
          minWidth: 0,
          gap: 0.375,
          py: 1,
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkPressRulerAxis labels={axis} width={width} measure={measure.ref} />
      {rows}
      <KkPressRulerLegend entries={legend} />
      {loupe}
    </Stack>
  );
};
