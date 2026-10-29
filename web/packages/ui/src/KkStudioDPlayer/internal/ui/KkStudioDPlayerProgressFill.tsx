import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

interface KkStudioDPlayerProgressFillProps {
  share: number;
}

export const KkStudioDPlayerProgressFill: FC<KkStudioDPlayerProgressFillProps> = ({ share }) => {
  const fill = { transform: `translateY(-50%) scaleX(${share})` };
  const knob = { transform: `translate3d(calc(${share * PERCENT}cqw - 50%), -50%, 0)` };

  return (
    <>
      <Box
        aria-hidden
        style={fill}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: '3px',
          transformOrigin: 'left center',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: (theme.vars ?? theme).palette.text.primary,
          willChange: 'transform',
          zIndex: 1,
        })}
      />
      <Box
        aria-hidden
        style={knob}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: '50%',
          width: '0.75rem',
          height: '0.75rem',
          borderRadius: '50%',
          backgroundColor: (theme.vars ?? theme).palette.text.primary,
          boxShadow: kkTokens.shadow.floating,
          willChange: 'transform',
          zIndex: 3,
        })}
      />
    </>
  );
};
