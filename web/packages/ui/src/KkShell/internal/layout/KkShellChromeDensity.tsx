import { motion } from 'motion/react';
import type { FC, Ref } from 'react';
import { CHROME_DENSITY_PROPERTY } from '../../../internal/chrome-density';
import { useChromeDensity } from '../logic/use-chrome-density';

interface KkShellChromeDensityProps {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellChromeDensity: FC<KkShellChromeDensityProps> = ({ ref }) => {
  const density = useChromeDensity();
  const densityStyle = { minWidth: 0, [CHROME_DENSITY_PROPERTY]: density };

  return <motion.div ref={ref} style={densityStyle} />;
};
