import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { usePromoScene } from '../logic/promo-scene-context';
import { PROMO_SETTLE } from '../promo-motion';

const LEAD_WIDTH = 450;

interface KkPromoStageLeadProps extends PropsWithChildren {
  delay?: number;
}

export const KkPromoStageLead: FC<KkPromoStageLeadProps> = ({ delay = 0.8, children }) => {
  const { live } = usePromoScene();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={live ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ ...PROMO_SETTLE, delay: live ? delay : 0 }}
    >
      <Typography
        variant="body1"
        data-kk-promo-lead
        sx={{ maxWidth: LEAD_WIDTH, color: 'text.secondary', fontWeight: 600, lineHeight: 1.45 }}
      >
        {children}
      </Typography>
    </Box>
  );
};
