import { motion } from 'motion/react';
import type { FC } from 'react';
import { TuschHeadlineText } from './TuschHeadlineText';
import type { TuschShadowBox } from './use-tusch-headline-shadow';
import type { TuschLiftMotion } from './use-tusch-lift';

interface TuschHeadlineShadowProps {
  box: TuschShadowBox | null;
  lift: TuschLiftMotion;
}

export const TuschHeadlineShadow: FC<TuschHeadlineShadowProps> = ({ box, lift }) => {
  if (box === null) {
    return null;
  }

  const shadowStyle = {
    position: 'absolute' as const,
    left: box.left,
    top: box.top,
    width: box.width,
    x: lift.shadowX,
    y: lift.shadowY,
    scale: lift.shadowScale,
    opacity: lift.shadowOpacity,
    originX: 0,
    originY: 0.5,
    willChange: 'transform',
    pointerEvents: 'none' as const,
  };

  return (
    <motion.span aria-hidden style={shadowStyle}>
      <TuschHeadlineText tone="shadow">{box.text}</TuschHeadlineText>
    </motion.span>
  );
};
