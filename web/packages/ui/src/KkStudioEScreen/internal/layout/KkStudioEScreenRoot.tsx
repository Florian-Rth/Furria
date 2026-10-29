import Box from '@mui/material/Box';
import type { FC, PointerEventHandler, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type KkStudioEScreenFit = 'aspect' | 'fill';

export interface KkStudioEScreenSurface {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

const VIDEO_ASPECT = 16 / 9;
const WIDE = '@container kk-studio-e (min-aspect-ratio: 5/4)';

interface KkStudioEScreenRootProps extends PropsWithChildren {
  label: string;
  fit: KkStudioEScreenFit;
  surface?: KkStudioEScreenSurface;
}

export const KkStudioEScreenRoot: FC<KkStudioEScreenRootProps> = ({
  label,
  fit,
  surface,
  children,
}) => {
  const sized =
    fit === 'aspect'
      ? {
          width: '100%',
          height: '100%',
          [WIDE]: {
            width: `min(100cqw, calc(100cqh * ${VIDEO_ASPECT}))`,
            height: 'auto',
            aspectRatio: `${VIDEO_ASPECT}`,
          },
        }
      : { width: '100%', height: '100%' };

  return (
    <Box
      role="region"
      aria-label={label}
      data-kk-studio-e-screen={fit}
      {...surface}
      sx={{
        position: 'relative',
        minWidth: 0,
        minHeight: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        touchAction: surface === undefined ? 'manipulation' : 'none',
        cursor: surface === undefined ? 'default' : 'pointer',
        ...sized,
      }}
    >
      {children}
    </Box>
  );
};
