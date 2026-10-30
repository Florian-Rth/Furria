import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioMarksPartProps {
  start: number;
  end: number;
  name: string;
  current: boolean;
}

export const KkStudioMarksPart: FC<KkStudioMarksPartProps> = ({ start, end, name, current }) => {
  const place = { left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` };

  return (
    <Box
      data-kk-studio-part
      data-current={current}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        height: '1.125rem',
        px: 0.25,
        borderTop: `${kkTokens.line.section}px solid ${palette(theme).divider}`,
        color: palette(theme).text.secondary,
        '&[data-current="true"]': {
          borderTopColor: palette(theme).text.primary,
          color: palette(theme).text.primary,
        },
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          display: 'block',
          lineHeight: '1rem',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'inherit',
        }}
      >
        {name}
      </Typography>
    </Box>
  );
};
