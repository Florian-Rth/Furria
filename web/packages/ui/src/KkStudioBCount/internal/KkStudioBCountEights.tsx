import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';

const BAR = { flex: 1, gap: 0.5, minWidth: 0 } as const;

const segmentPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flex: 1,
  height: '0.375rem',
  borderRadius: `${kkTokens.radius.bar}px`,
  backgroundColor: (theme.vars ?? theme).palette.action.selected,
});

const FILL = {
  position: 'absolute',
  inset: 0,
  transformOrigin: 'left center',
  bgcolor: 'text.primary',
  willChange: 'transform',
} as const;

const CURRENT_FILL = { ...FILL, bgcolor: 'primary.main' } as const;

const fillOf = (index: number, eight: number | null, share: number): number => {
  if (eight === null || index > eight) {
    return 0;
  }

  return index < eight ? 1 : share;
};

interface KkStudioBCountEightsProps {
  eight: number | null;
  eights: number;
  share: number;
}

export const KkStudioBCountEights: FC<KkStudioBCountEightsProps> = ({ eight, eights, share }) => {
  const segments = Array.from({ length: eights }, (_, slot) => slot).map((index) => {
    const fill = { transform: `scaleX(${fillOf(index, eight, share)})` };

    return (
      <Box key={index} component="span" sx={segmentPaint}>
        <Box component="span" style={fill} sx={index === eight ? CURRENT_FILL : FILL} />
      </Box>
    );
  });

  return (
    <Stack direction="row" aria-hidden sx={BAR}>
      {segments}
    </Stack>
  );
};
