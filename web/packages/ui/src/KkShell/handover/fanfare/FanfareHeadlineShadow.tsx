import { motion } from 'motion/react';
import type { FC } from 'react';
import { FanfareHeadlineText } from './FanfareHeadlineText';
import type { FanfareShadowBox } from './use-fanfare-headline-shadow';
import type { FanfareLiftMotion } from './use-fanfare-lift';

interface FanfareHeadlineShadowProps {
  box: FanfareShadowBox | null;
  lift: FanfareLiftMotion;
}

export const FanfareHeadlineShadow: FC<FanfareHeadlineShadowProps> = ({ box, lift }) => {
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
      <FanfareHeadlineText tone="shadow">{box.text}</FanfareHeadlineText>
    </motion.span>
  );
};
