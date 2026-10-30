import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import { KkLaneProgress } from '@furria/ui/KkLaneProgress';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import { KkText } from '@furria/ui/KkText';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { eveningCountOf, readinessOf } from '@/features/season/season-grid';
import { useReadinessReveal } from '../hooks/use-readiness-reveal';
import { ROW_HEIGHT } from '../raster-geometry';
import { toActMeta, toOpenChecks, toReadinessLabelOf, toReadinessText } from '../season-a-copy';
import type { RasterActRow } from '../season-raster';

interface RasterActHeadProps {
  row: RasterActRow;
}

export const RasterActHead: FC<RasterActHeadProps> = ({ row }) => {
  const { act } = row;
  const isMedium = useIsMediumScreen();
  const reveal = useReadinessReveal();
  const readiness = readinessOf(act);
  const groupName = act.group?.name ?? null;
  const metaText = reveal.shown
    ? toOpenChecks(readiness)
    : toActMeta(groupName, eveningCountOf(act));
  const metaTone = reveal.shown && !readiness.ready ? 'accent' : 'muted';
  const tone = act.group?.tone ?? null;
  const readinessText = toReadinessText(readiness);
  const readinessLabel = toReadinessLabelOf(act.name, readiness);
  const nameLines = isMedium ? 2 : 3;
  const name = (
    <KkText variant="subtitle2" clamp={nameLines}>
      {act.name}
    </KkText>
  );
  const meta = (
    <KkMeta tone={metaTone} lines={2}>
      {metaText}
    </KkMeta>
  );
  const meter = (
    <Box
      onMouseEnter={reveal.show}
      onMouseLeave={reveal.hide}
      onFocus={reveal.show}
      onBlur={reveal.hide}
      sx={{ flexShrink: 0 }}
    >
      <KkLaneProgress
        done={readiness.done}
        total={readiness.total}
        text={readinessText}
        label={readinessLabel}
        expanded={reveal.pinned}
        onPress={reveal.toggle}
      />
    </Box>
  );
  const body = isMedium ? (
    <Stack direction="row" sx={{ flex: 1, alignItems: 'center', gap: 1, pr: 1, minWidth: 0 }}>
      <KkGroupToneDot tone={tone} />
      <Stack sx={{ flex: 1, gap: 0.25, minWidth: 0 }}>
        {name}
        {meta}
      </Stack>
      {meter}
    </Stack>
  ) : (
    <Stack sx={{ flex: 1, justifyContent: 'center', gap: 0.5, pr: 1, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        <KkGroupToneDot tone={tone} />
        {name}
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        {meter}
        {meta}
      </Stack>
    </Stack>
  );

  return (
    <Stack sx={{ height: ROW_HEIGHT, minWidth: 0 }}>
      {body}
      <KkRule weight="hair" />
    </Stack>
  );
};
