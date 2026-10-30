import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RasterScroll } from '../hooks/use-raster-scroll';
import type { SeasonA } from '../hooks/use-season-a';
import { HEAD_HEIGHT } from '../raster-geometry';
import { NEXT_EVENING, PREVIOUS_EVENING, toEveningPosition } from '../season-a-copy';

interface RasterCornerProps {
  season: SeasonA;
  scroll: RasterScroll;
}

export const RasterCorner: FC<RasterCornerProps> = ({ season, scroll }) => {
  const isMedium = useIsMediumScreen();
  const position = toEveningPosition(scroll.column, season.evenings.length);
  const atStart = !scroll.canPrevious;
  const atEnd = !scroll.canNext;
  const stepper = isMedium ? (
    <KkMeta>{season.meta}</KkMeta>
  ) : (
    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
      <KkEyebrow tone="muted">{position}</KkEyebrow>
      <Stack direction="row" sx={{ gap: 0.5 }}>
        <KkLaneButton
          text={PREVIOUS_EVENING}
          glyph="left"
          textShown={false}
          disabled={atStart}
          onPress={scroll.previous}
        />
        <KkLaneButton
          text={NEXT_EVENING}
          glyph="right"
          textShown={false}
          disabled={atEnd}
          onPress={scroll.next}
        />
      </Stack>
    </Stack>
  );

  return (
    <Stack sx={{ height: HEAD_HEIGHT, minWidth: 0 }}>
      <Stack sx={{ flex: 1, justifyContent: 'flex-end', gap: 0.5, pb: 1, pr: 1, minWidth: 0 }}>
        <KkHeading level={4} component="h1">
          {season.title}
        </KkHeading>
        {stepper}
      </Stack>
      <KkRule weight="section" />
    </Stack>
  );
};
