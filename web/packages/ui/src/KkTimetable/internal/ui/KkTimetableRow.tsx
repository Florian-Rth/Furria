import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { rowDividerTop } from '../../../internal/row-divider';
import { kkTokens } from '../../../tokens';
import { timetableTrackOf } from '../logic/timetable-track';
import { KkTimetableTrack } from './KkTimetableTrack';

interface KkTimetableRowProps {
  label: string;
  meta: string;
  lastRunMs: number | null;
  dueMs: number | null;
  cadenceMs: number | null;
  nowMs: number;
  failed: boolean;
  failure?: string;
  onDemandLabel: string;
}

export const KkTimetableRow: FC<KkTimetableRowProps> = ({
  label,
  meta,
  lastRunMs,
  dueMs,
  cadenceMs,
  nowMs,
  failed,
  failure,
  onDemandLabel,
}) => {
  const track = timetableTrackOf(lastRunMs, dueMs, cadenceMs, nowMs, kkTokens.system.trackDue);
  const trackLine =
    track.state === 'onDemand' ? (
      <Typography
        component="span"
        sx={{ typography: 'caption', fontWeight: 800, color: 'text.disabled' }}
      >
        {onDemandLabel}
      </Typography>
    ) : (
      <KkTimetableTrack state={track.state} cursor={track.cursor} due={track.due} failed={failed} />
    );
  const failureLine =
    failure === undefined ? null : (
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.caption,
          fontWeight: 700,
          overflowWrap: 'anywhere',
          ...redInk(theme),
        })}
      >
        {failure}
      </Typography>
    );

  return (
    <Stack
      component="li"
      data-kk-timetable-row={track.state}
      sx={{ rowGap: 0.5, py: 1, minWidth: 0, ...rowDividerTop }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', columnGap: 1, minWidth: 0 }}
      >
        <Typography component="span" sx={{ typography: 'body2', fontWeight: 800, minWidth: 0 }}>
          {label}
        </Typography>
        <Typography
          component="span"
          sx={{
            typography: 'caption',
            fontVariantNumeric: 'tabular-nums',
            color: 'text.secondary',
            textAlign: 'right',
          }}
        >
          {meta}
        </Typography>
      </Stack>
      {trackLine}
      {failureLine}
    </Stack>
  );
};
