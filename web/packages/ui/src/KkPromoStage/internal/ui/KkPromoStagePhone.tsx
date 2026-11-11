import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkPhoto } from '../../../KkPhoto';
import { PROMO_PHONE, PROMO_SHADOW } from '../promo-paint';

const { screenWidth, screenHeight, bezel, radius, screenRadius } = PROMO_PHONE;
const ISLAND = { width: 112, height: 32, top: 12 } as const;
const BODY = '#0E0F12';
const RIM = 'linear-gradient(145deg, #5B6068 0%, #1B1D22 30%, #0B0C0F 60%, #474B52 100%)';
const GLARE =
  'linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0) 42%)';

interface KkPromoStagePhoneProps {
  image: string | null;
  title: string;
  scale?: number;
}

export const KkPromoStagePhone: FC<KkPromoStagePhoneProps> = ({
  image,
  title,
  scale = PROMO_PHONE.scale,
}) => {
  const screen = image === null ? null : { src: image };

  return (
    <Box
      data-kk-promo-phone
      sx={{
        width: (screenWidth + bezel * 2) * scale,
        height: (screenHeight + bezel * 2) * scale,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: screenWidth + bezel * 2,
          height: screenHeight + bezel * 2,
          p: `${bezel}px`,
          borderRadius: `${radius}px`,
          background: RIM,
          boxShadow: PROMO_SHADOW.device,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: screenWidth,
            height: screenHeight,
            borderRadius: `${screenRadius}px`,
            overflow: 'clip',
            bgcolor: BODY,
            outline: `3px solid ${BODY}`,
          }}
        >
          <KkPhoto alt={title} image={screen} fill priority placeholderLabel={title} />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: ISLAND.top,
              left: '50%',
              width: ISLAND.width,
              height: ISLAND.height,
              transform: 'translateX(-50%)',
              borderRadius: `${ISLAND.height}px`,
              bgcolor: BODY,
            }}
          />
          <Box
            aria-hidden
            sx={{ position: 'absolute', inset: 0, background: GLARE, pointerEvents: 'none' }}
          />
        </Box>
      </Box>
    </Box>
  );
};
