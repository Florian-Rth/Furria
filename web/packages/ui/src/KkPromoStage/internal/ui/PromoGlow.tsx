import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const { glowRed, glowGold } = kkTokens.chrome.light;
const GLOW = `radial-gradient(closest-side at 62% 44%, ${glowGold} 0%, rgba(244,180,0,0) 70%), radial-gradient(closest-side at 72% 62%, ${glowRed} 0%, rgba(225,29,42,0) 75%)`;

export const PromoGlow: FC = () => (
  <Box aria-hidden data-kk-promo-glow sx={{ position: 'absolute', inset: 0, background: GLOW }} />
);
