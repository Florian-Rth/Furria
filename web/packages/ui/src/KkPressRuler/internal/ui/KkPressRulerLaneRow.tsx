import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkPressRulerLabels, KkPressRulerLane } from '../../press-ruler-data';
import { GUTTER_END } from '../logic/ruler-metrics';
import type { RulerPress } from '../logic/ruler-press';
import { useRulerLane } from '../logic/use-ruler-lane';
import type { RulerProbeState } from '../logic/use-ruler-probe';
import { KkPressRulerLaneYear } from './KkPressRulerLaneYear';
import { KkPressRulerPlot } from './KkPressRulerPlot';
import { KkPressRulerTodayTag } from './KkPressRulerTodayTag';
import { rulerStampMotion } from './ruler-paint';

interface KkPressRulerLaneRowProps {
  lane: KkPressRulerLane;
  order: number;
  width: number;
  today: number | null;
  draftCount: number;
  press: RulerPress;
  probe: RulerProbeState;
  labels: KkPressRulerLabels;
  onSection: (laneKey: string) => void;
}

export const KkPressRulerLaneRow: FC<KkPressRulerLaneRowProps> = ({
  lane,
  order,
  width,
  today,
  draftCount,
  press,
  probe,
  labels,
  onSection,
}) => {
  const view = useRulerLane(lane, width, press, probe);
  const laneLabel = labels.laneOf(lane);
  const countVariant = lane.present ? 'subtitle2' : 'caption';
  const countColor = lane.present ? 'text.primary' : 'text.secondary';
  const countAlign = lane.present ? 'flex-start' : 'flex-end';

  const selectLane = (): void => {
    onSection(lane.key);
  };

  const todayTag =
    lane.present && today !== null ? (
      <KkPressRulerTodayTag label={labels.today} x={today * width} width={width} />
    ) : null;

  return (
    <Stack direction="row" data-kk-press-ruler-lane sx={{ minWidth: 0, alignItems: 'stretch' }}>
      <KkPressRulerLaneYear lane={lane} label={laneLabel} onSelect={selectLane} />
      <Box
        role="group"
        aria-label={laneLabel}
        tabIndex={0}
        onPointerDown={view.probe.onPointerDown}
        onPointerMove={view.probe.onPointerMove}
        onPointerUp={view.probe.onPointerUp}
        onPointerCancel={view.probe.onPointerCancel}
        onKeyDown={view.probe.onKeyDown}
        onBlur={view.probe.onBlur}
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          minWidth: 0,
          touchAction: 'pan-y',
          cursor: 'crosshair',
          userSelect: 'none',
          ...focusRing(theme),
          ...rulerStampMotion,
        })}
      >
        <KkPressRulerPlot
          lane={lane}
          order={order}
          width={width}
          metrics={view.metrics}
          columns={view.columns}
          today={today}
          draftCount={draftCount}
          cursor={view.cursor}
          delayOf={view.delayOf}
        />
        {todayTag}
      </Box>
      <Stack
        sx={(theme) => ({
          width: theme.spacing(GUTTER_END),
          flexShrink: 0,
          alignItems: 'flex-end',
          justifyContent: countAlign,
        })}
      >
        <Typography
          variant={countVariant}
          sx={{ lineHeight: 1, color: countColor, fontVariantNumeric: 'tabular-nums' }}
        >
          {lane.count}
        </Typography>
      </Stack>
    </Stack>
  );
};
