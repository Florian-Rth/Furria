import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkStampLayer } from '../../../internal/KkStampLayer';
import { useStampLife } from '../../../internal/use-stamp-life';
import { kkTokens } from '../../../tokens';
import type { KkPublishStamp } from '../../publish-stamp';
import { KK_PRESS_BEATS_MS } from '../logic/press-beats';
import { STAMP_LEAVING, STAMP_LIFTED, STAMP_SLAM } from '../logic/press-motion';
import { stampSignatureOf } from '../logic/stamp-signature';

const STAMP_PAPER = '94%';
const STAMP_WIDTH = '26rem';

const stampPaint = (theme: Theme) => {
  const palette = (theme.vars ?? theme).palette;
  return {
    width: `min(calc(100% - ${theme.spacing(3)}), ${STAMP_WIDTH})`,
    color: palette.primary.main,
    border: `${kkTokens.line.page}px solid ${palette.primary.main}`,
    outline: `${kkTokens.line.hair}px solid ${palette.primary.main}`,
    outlineOffset: theme.spacing(-0.75),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    backgroundColor: `color-mix(in srgb, ${palette.background.paper} ${STAMP_PAPER}, transparent)`,
    boxShadow: kkTokens.shadow.floating,
    px: 2.5,
    py: 1.75,
  } as const;
};

interface KkPressStampProps {
  stamp: KkPublishStamp;
}

export const KkPressStamp: FC<KkPressStampProps> = ({ stamp }) => {
  const { life, leave } = useStampLife(KK_PRESS_BEATS_MS.stampShown);

  if (life === 'gone') {
    return null;
  }

  const target = life === 'leaving' ? STAMP_LEAVING : STAMP_SLAM;
  const signature = stampSignatureOf(stamp.signer, stamp.at);

  return (
    <KkStampLayer>
      <Box
        component={motion.div}
        data-kk-press-stamp
        initial={STAMP_LIFTED}
        animate={target}
        onAnimationComplete={leave}
        sx={stampPaint}
      >
        <Stack sx={{ gap: 0.75, minWidth: 0 }}>
          <Typography variant="h2" component="p" sx={{ textTransform: 'uppercase', lineHeight: 1 }}>
            {stamp.title}
          </Typography>
          <Typography variant="caption" noWrap sx={{ fontWeight: 800, color: 'text.primary' }}>
            {signature}
          </Typography>
          <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {stamp.address}
          </Typography>
        </Stack>
      </Box>
    </KkStampLayer>
  );
};
