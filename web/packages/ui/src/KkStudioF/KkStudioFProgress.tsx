import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent, ReactNode } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';
import type { KkStudioFSegment } from './studio-f-types';

const BAR_HEIGHT = '0.25rem';
const SEGMENT_GAP = '0.1875rem';
const PART_GAP = '0.5rem';

const segmentPaint =
  (segment: KkStudioFSegment) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      flex: 1,
      minWidth: 0,
      height: kkTokens.tapTarget,
      ml: segment.opensPart ? PART_GAP : SEGMENT_GAP,
      '&:first-of-type': { ml: 0 },
      borderRadius: `${kkTokens.radius.bar}px`,
      ...focusRing(theme),
      '& [data-kk-studio-f-bar]': {
        position: 'relative',
        width: '100%',
        height: BAR_HEIGHT,
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: segment.state === 'done' ? palette.text.secondary : palette.divider,
        overflow: 'clip',
        transition: 'transform 160ms ease-out',
      },
      '&:active [data-kk-studio-f-bar]': { transform: 'scaleY(1.6)' },
    };
  };

interface KkStudioFProgressProps {
  label: string;
  segments: readonly KkStudioFSegment[];
  fill: ReactNode;
  onSelect: (index: number) => void;
}

export const KkStudioFProgress: FC<KkStudioFProgressProps> = ({
  label,
  segments,
  fill,
  onSelect,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const index = Number(event.currentTarget.dataset.kkStudioFSegment);

    if (Number.isInteger(index)) {
      onSelect(index);
    }
  };
  const items = segments.map((segment, index) => {
    const current = segment.state === 'current';
    const content = current ? fill : null;

    return (
      <ButtonBase
        key={segment.key}
        aria-label={segment.label}
        aria-current={current ? 'step' : undefined}
        data-kk-studio-f-segment={index}
        onClick={choose}
        sx={segmentPaint(segment)}
      >
        <Box data-kk-studio-f-bar>{content}</Box>
      </ButtonBase>
    );
  });

  return (
    <Stack
      component="nav"
      direction="row"
      aria-label={label}
      data-kk-studio-f-progress
      sx={{ minWidth: 0, alignItems: 'center' }}
    >
      {items}
    </Stack>
  );
};
