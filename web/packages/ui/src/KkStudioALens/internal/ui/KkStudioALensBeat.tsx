import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioALensBeatProps {
  x: number;
  count: number;
}

const FIRST_COUNT = 1;

export const KkStudioALensBeat: FC<KkStudioALensBeatProps> = ({ x, count }) => {
  const first = count === FIRST_COUNT;

  return (
    <Box
      data-kk-studio-a-beat={count}
      style={{ left: `${x}px` }}
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;
        return {
          position: 'absolute',
          bottom: 0,
          top: 0,
          width: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '-0.5px',
            bottom: 0,
            width: first ? '2px' : '1px',
            height: first ? '26%' : '14%',
            backgroundColor: first ? palette.text.primary : palette.text.disabled,
          },
          '&::after': {
            content: `"${count}"`,
            position: 'absolute',
            top: '1.0625rem',
            left: 0,
            transform: 'translateX(-50%)',
            typography: 'caption',
            fontFamily: kkTokens.font.display,
            lineHeight: 1,
            color: first ? palette.text.primary : palette.text.disabled,
          },
        };
      }}
    />
  );
};
