import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';
import { PROMO_SHADOW } from '../promo-paint';

const VIEWPORT = { width: 1440, height: 900 } as const;
const BAR_HEIGHT = 44;
const DOT = 11;
const DOT_TONES = ['#FF5F57', '#FEBC2E', '#28C840'] as const;
const FRAME = '#E3E5E9';
const ADDRESS_WIDTH = 560;

interface KkPromoStageBrowserProps {
  image: string | null;
  address: string;
  title: string;
  scale?: number;
}

export const KkPromoStageBrowser: FC<KkPromoStageBrowserProps> = ({
  image,
  address,
  title,
  scale = 0.5,
}) => {
  const screen = image === null ? null : { src: image };

  return (
    <Box
      data-kk-promo-browser
      sx={{ width: VIEWPORT.width * scale, height: (VIEWPORT.height + BAR_HEIGHT) * scale }}
    >
      <Box
        sx={{
          width: VIEWPORT.width,
          borderRadius: '18px',
          overflow: 'clip',
          bgcolor: FRAME,
          boxShadow: PROMO_SHADOW.device,
          border: 1,
          borderColor: 'divider',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Stack direction="row" sx={{ height: BAR_HEIGHT, px: 2.5, alignItems: 'center', gap: 2.5 }}>
          <Stack direction="row" sx={{ gap: 1 }}>
            {DOT_TONES.map((tone) => (
              <Box
                key={tone}
                sx={{ width: DOT, height: DOT, borderRadius: '50%', bgcolor: tone }}
              />
            ))}
          </Stack>
          <Box
            sx={{
              flexGrow: 1,
              maxWidth: ADDRESS_WIDTH,
              mx: 'auto',
              py: 0.75,
              px: 2,
              borderRadius: `${kkTokens.radius.pill}px`,
              bgcolor: 'background.paper',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {address}
            </Typography>
          </Box>
          <Box sx={{ width: DOT * 5 }} />
        </Stack>
        <Box sx={{ position: 'relative', width: VIEWPORT.width, height: VIEWPORT.height }}>
          <KkPhoto alt={title} image={screen} fill priority placeholderLabel={title} />
        </Box>
      </Box>
    </Box>
  );
};
