import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkPromoCut, KkPromoPoint, KkPromoScenePhase } from '../../promo-stage-types';
import { PromoSceneContext } from '../logic/promo-scene-context';
import { PROMO_CUT_SECONDS, sceneMotionOf } from '../logic/scene-cuts';
import { PromoWipeBand } from '../ui/PromoWipeBand';

const CENTER: KkPromoPoint = { x: 50, y: 50 };
const LAYER: Record<KkPromoScenePhase, number> = { waiting: 0, leaving: 1, live: 2 };

interface KkPromoStageSceneProps extends PropsWithChildren {
  phase: KkPromoScenePhase;
  cut: KkPromoCut;
  origin?: KkPromoPoint;
}

export const KkPromoStageScene: FC<KkPromoStageSceneProps> = ({
  phase,
  cut,
  origin = CENTER,
  children,
}) => {
  const live = phase === 'live';
  const scene = { live };
  const band = live && cut === 'wipe' ? <PromoWipeBand seconds={PROMO_CUT_SECONDS.wipe} /> : null;

  return (
    <PromoSceneContext.Provider value={scene}>
      <Box
        component={motion.div}
        data-kk-promo-scene={phase}
        initial={false}
        animate={sceneMotionOf(phase, cut, origin)}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: LAYER[phase],
          transformOrigin: 'center',
          willChange: 'transform, clip-path',
        }}
      >
        {children}
      </Box>
      {band}
    </PromoSceneContext.Provider>
  );
};
