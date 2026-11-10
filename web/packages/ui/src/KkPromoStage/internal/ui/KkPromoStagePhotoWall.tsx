import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkPhoto } from '../../../KkPhoto';
import { photoColumnsOf } from '../logic/photo-columns';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_FLIGHT } from '../promo-motion';
import { PROMO_SHADOW } from '../promo-paint';

const COLUMN_WIDTH = 172;
const COLUMN_GAP = 18;
const PRINT_BORDER = 9;
const COLUMN_TRAVEL = [64, -90, 40] as const;
const COLUMN_TILT = [-4, 3, -2] as const;
const DRIFT_SECONDS = 9;

interface KkPromoStagePhotoWallProps {
  photos: readonly string[];
  placeholderLabel: string;
  left: number;
  top: number;
}

export const KkPromoStagePhotoWall: FC<KkPromoStagePhotoWallProps> = ({
  photos,
  placeholderLabel,
  left,
  top,
}) => {
  const { live } = usePromoScene();
  const columns = photoColumnsOf(photos, COLUMN_TRAVEL.length);

  return (
    <Stack
      direction="row"
      data-kk-promo-photo-wall
      sx={{ position: 'absolute', left, top, gap: `${COLUMN_GAP}px`, alignItems: 'flex-start' }}
    >
      {columns.map((column, columnIndex) => {
        const travel = COLUMN_TRAVEL[columnIndex] ?? 0;
        const tilt = COLUMN_TILT[columnIndex] ?? 0;
        const away = { y: 700 + columnIndex * 120, rotate: tilt * 3 };
        const home = { y: [0, -travel, 0], rotate: tilt };

        return (
          <Stack
            key={column.key}
            component={motion.div}
            initial={away}
            animate={live ? home : away}
            transition={{
              ...PROMO_FLIGHT,
              delay: live ? 0.15 + columnIndex * 0.14 : 0,
              y: live
                ? { duration: DRIFT_SECONDS, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                : PROMO_FLIGHT,
            }}
            sx={{ width: COLUMN_WIDTH, gap: `${COLUMN_GAP}px` }}
          >
            {column.photos.map((photo) => (
              <Box
                key={photo.key}
                sx={{
                  p: `${PRINT_BORDER}px`,
                  pb: `${PRINT_BORDER * 3}px`,
                  bgcolor: 'common.white',
                  boxShadow: PROMO_SHADOW.card,
                  transform: `rotate(${photo.tilt}deg)`,
                }}
              >
                <KkPhoto
                  alt=""
                  image={photo.src === null ? null : { src: photo.src }}
                  aspectRatio={photo.aspect}
                  placeholderLabel={placeholderLabel}
                />
              </Box>
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
};
