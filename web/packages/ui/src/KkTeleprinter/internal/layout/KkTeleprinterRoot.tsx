import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const { edgeSprocket, edgeSprocketGap } = kkTokens.gallery;
const EDGE = 2;

interface KkTeleprinterRootProps extends PropsWithChildren {
  label: string;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkTeleprinterRoot: FC<KkTeleprinterRootProps> = ({
  label,
  dimmed = false,
  sx,
  children,
}) => {
  const opacity = dimmed ? kkTokens.opacity.dimmed : 1;

  return (
    <Stack
      role="log"
      aria-label={label}
      data-kk-teleprinter
      sx={[
        {
          position: 'relative',
          minWidth: 0,
          rowGap: 1,
          pl: EDGE,
          opacity,
          color: 'text.primary',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: edgeSprocket + 4,
            color: 'text.disabled',
            backgroundImage: `radial-gradient(circle, currentColor ${edgeSprocket / 2}px, transparent ${edgeSprocket / 2 + 0.5}px)`,
            backgroundSize: `${edgeSprocket + 4}px ${edgeSprocketGap}px`,
            backgroundRepeat: 'repeat-y',
            borderRight: `${kkTokens.line.hair}px dashed`,
            borderRightColor: 'divider',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
};
