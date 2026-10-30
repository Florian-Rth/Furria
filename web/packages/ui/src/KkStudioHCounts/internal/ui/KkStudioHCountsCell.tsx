import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHCountsCellProps {
  count: number;
  inRange: boolean;
  shown: boolean;
}

export const KkStudioHCountsCell: FC<KkStudioHCountsCellProps> = ({ count, inRange, shown }) => {
  const downbeat = count === 1;
  const number = shown ? count : null;

  return (
    <Box
      data-in-range={inRange}
      data-downbeat={downbeat}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'grid',
        alignItems: 'end',
        justifyItems: 'center',
        pb: 0.25,
        borderRadius: `${kkTokens.radius.bar}px`,
        color: palette(theme).text.secondary,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
        boxShadow: `inset 0 ${kkTokens.line.section}px 0 transparent`,
        '&[data-downbeat="true"]': {
          boxShadow: `inset ${kkTokens.line.section}px 0 0 ${palette(theme).text.primary}`,
        },
        '&[data-in-range="true"]': {
          color: palette(theme).primary.contrastText,
          backgroundColor: palette(theme).primary.main,
        },
        transition: 'background-color 120ms ease-out, color 120ms ease-out',
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          lineHeight: 1,
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};
