import Box from '@mui/material/Box';
import type { FC, MouseEvent, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const FADE = '14%';

interface KkStudioALensRootProps extends PropsWithChildren {
  label: string;
  onPick: (offsetFromCentre: number) => void;
  sx?: KkSx;
}

export const KkStudioALensRoot: FC<KkStudioALensRootProps> = ({ label, onPick, sx, children }) => {
  const pick = (event: MouseEvent<HTMLDivElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    onPick(event.clientX - (box.left + box.width / 2));
  };

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-studio-a-lens
      onClick={pick}
      sx={[
        (theme) => ({
          position: 'relative',
          height: '2.5rem',
          containerType: 'inline-size',
          overflow: 'clip',
          cursor: 'pointer',
          userSelect: 'none',
          borderRadius: '6px',
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} 4%, transparent)`,
          maskImage: `linear-gradient(to right, transparent 0, black ${FADE}, black calc(100% - ${FADE}), transparent 100%)`,
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 'calc(50% - 1px)',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: (theme.vars ?? theme).palette.primary.main,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};
