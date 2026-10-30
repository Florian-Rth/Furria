import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkFocusLanesBeat {
  key: string;
  share: number;
  strong: boolean;
  text: string | null;
}

interface KkFocusLanesBeatsProps {
  beats: readonly KkFocusLanesBeat[];
}

export const KkFocusLanesBeats: FC<KkFocusLanesBeatsProps> = ({ beats }) => {
  const marks = beats.map((beat) => (
    <Box
      key={beat.key}
      data-strong={beat.strong}
      style={{ left: `${beat.share * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 0,
        borderLeft: `1px solid color-mix(in srgb, ${palette(theme).text.primary} 22%, transparent)`,
        '&[data-strong="true"]': {
          borderLeft: `${kkTokens.line.hair}px solid ${palette(theme).text.secondary}`,
        },
        '&::after':
          beat.text === null
            ? {}
            : {
                content: `"${beat.text}"`,
                position: 'absolute',
                bottom: 0,
                left: '0.125rem',
                typography: 'caption',
                lineHeight: '1rem',
                fontWeight: beat.strong ? 900 : 600,
                fontVariantNumeric: 'tabular-nums',
                color: beat.strong ? palette(theme).text.primary : palette(theme).text.secondary,
              },
      })}
    />
  ));

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
