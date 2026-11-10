import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkPromoWallName } from '../../promo-stage-types';
import { usePromoScene } from '../logic/promo-scene-context';
import { useWallFit } from '../logic/use-wall-fit';
import { wallDelaysOf } from '../logic/wall-cascade';
import { PROMO_RISE, PROMO_SLAM } from '../promo-motion';

const STAR = '✶';
const HIDDEN = { opacity: 0, y: 18, scale: 1 };
const FRESH_HIDDEN = { opacity: 0, y: 0, scale: 1.9 };
const SHOWN = { opacity: 1, y: 0, scale: 1 };

interface KkPromoStageNameWallProps {
  names: readonly KkPromoWallName[];
  height: number;
  delay?: number;
}

export const KkPromoStageNameWall: FC<KkPromoStageNameWallProps> = ({
  names,
  height,
  delay = 0.6,
}) => {
  const { live } = usePromoScene();
  const { room, content } = useWallFit(names.length);
  const delays = wallDelaysOf(names, delay);

  return (
    <Box ref={room} data-kk-promo-name-wall sx={{ height, overflow: 'clip' }}>
      <Stack
        ref={content}
        direction="row"
        sx={{ flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, transformOrigin: 'top left' }}
      >
        {names.map((entry, index) => {
          const hidden = entry.fresh ? FRESH_HIDDEN : HIDDEN;
          const transition = {
            ...(entry.fresh ? PROMO_SLAM : PROMO_RISE),
            delay: live ? (delays[index] ?? 0) : 0,
          };

          return (
            <Stack
              key={entry.key}
              direction="row"
              component={motion.div}
              initial={hidden}
              animate={live ? SHOWN : hidden}
              transition={transition}
              sx={{ alignItems: 'baseline', gap: 0.75, transformOrigin: 'left center' }}
            >
              {entry.fresh && (
                <Typography variant="h3" component="span" sx={{ color: 'warning.main' }}>
                  {STAR}
                </Typography>
              )}
              <Typography
                variant="h2"
                component="span"
                sx={{ color: entry.fresh ? 'primary.main' : 'text.primary', whiteSpace: 'nowrap' }}
              >
                {entry.name}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};
