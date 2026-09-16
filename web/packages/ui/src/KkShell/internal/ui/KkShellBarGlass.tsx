import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { BAR_GLASS_LAYOUT_ID, GLASS_GLIDE } from '../logic/bar-search-motion';

const { glassSize } = kkTokens.shell.barSearch;

const GLASS_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: glassSize,
  height: glassSize,
  flexShrink: 0,
};

export const KkShellBarGlass: FC = () => (
  <motion.span
    layoutId={BAR_GLASS_LAYOUT_ID}
    layout="position"
    transition={GLASS_GLIDE}
    style={GLASS_STYLE}
  >
    <KkIcon name="search" size="small" sx={{ color: 'text.secondary' }} />
  </motion.span>
);
