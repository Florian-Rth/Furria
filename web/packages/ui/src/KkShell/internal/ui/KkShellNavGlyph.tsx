import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { navGlyphPose } from '../logic/nav-motion';

const RESTING_GLYPH = navGlyphPose(false);

const GLYPH_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

interface KkShellNavGlyphProps {
  name: KkIconName;
  active: boolean;
  transition: Transition;
}

export const KkShellNavGlyph: FC<KkShellNavGlyphProps> = ({ name, active, transition }) => {
  const iconPaint = (theme: Theme): CSSObject =>
    active ? redInk(theme) : { color: 'text.secondary' };

  return (
    <motion.span
      style={GLYPH_STYLE}
      initial={RESTING_GLYPH}
      animate={navGlyphPose(active)}
      transition={transition}
    >
      <KkIcon name={name} size="small" sx={iconPaint} />
    </motion.span>
  );
};
