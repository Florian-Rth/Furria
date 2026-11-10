import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useCanvasScale } from '../logic/use-canvas-scale';
import { PROMO_CANVAS } from '../promo-paint';
import { PromoPaper } from '../ui/PromoPaper';

const LIGHT_SCHEME = { 'data-light': '' };

interface KkPromoStageRootProps extends PropsWithChildren {
  label: string;
  onPress?: () => void;
}

export const KkPromoStageRoot: FC<KkPromoStageRootProps> = ({ label, onPress, children }) => {
  const { room, canvas } = useCanvasScale();

  return (
    <Box
      ref={room}
      role="region"
      aria-label={label}
      data-kk-promo-stage
      onClick={onPress}
      {...LIGHT_SCHEME}
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'clip',
        bgcolor: 'background.default',
        color: 'text.primary',
        cursor: 'none',
      }}
    >
      <Box
        ref={canvas}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: PROMO_CANVAS.width,
          height: PROMO_CANVAS.height,
          transformOrigin: 'center',
          isolation: 'isolate',
          overflow: 'clip',
        }}
      >
        <PromoPaper />
        {children}
      </Box>
    </Box>
  );
};
