import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';
import { AWAKE_ATTRIBUTE, PLAYER_LAYER } from '../player-paint';

const SCRIM =
  'linear-gradient(to bottom, rgba(5,6,8,0.62) 0%, rgba(5,6,8,0) 22%, rgba(5,6,8,0) 52%, rgba(5,6,8,0.78) 82%, rgba(5,6,8,0.92) 100%)';

interface KkStudioDPlayerRootProps extends PropsWithChildren {
  label: string;
  awake: boolean;
  onSurfaceTap?: () => void;
  sx?: KkSx;
}

export const KkStudioDPlayerRoot: FC<KkStudioDPlayerRootProps> = ({
  label,
  awake,
  onSurfaceTap,
  sx,
  children,
}) => {
  const scheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '', [AWAKE_ATTRIBUTE]: String(awake) };

  return (
    <Portal>
      <Box
        role="region"
        aria-label={label}
        data-kk-studio-d-player
        {...scheme}
        sx={[
          (theme) => ({
            position: 'fixed',
            inset: 0,
            zIndex: theme.zIndex.appBar + 1,
            isolation: 'isolate',
            backgroundColor: kkTokens.color.dark.darkroom,
            color: 'text.primary',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            cursor: awake ? 'auto' : 'none',
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box
          aria-hidden
          data-kk-studio-d-scrim
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: PLAYER_LAYER.scrim,
            backgroundImage: SCRIM,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          data-kk-studio-d-surface
          onClick={onSurfaceTap}
          sx={{ position: 'absolute', inset: 0, zIndex: PLAYER_LAYER.surface }}
        />
        {children}
      </Box>
    </Portal>
  );
};
