import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, Ref } from 'react';
import { CHROME_DENSITY_PROPERTY } from '../../../internal/chrome-density';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';
import { useChromeDensity } from '../logic/use-chrome-density';

const { gutter } = kkTokens.shell;

interface KkShellChromeProps {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellChrome: FC<KkShellChromeProps> = ({ ref }) => {
  const density = useChromeDensity();
  const densityStyle = { minWidth: 0, [CHROME_DENSITY_PROPERTY]: density };

  return (
    <Stack
      data-kk-shell-chrome
      sx={(theme) => ({
        position: 'fixed',
        top: safeArea('top', gutter),
        left: safeArea('left', gutter),
        right: safeArea('right', gutter),
        zIndex: theme.zIndex.appBar,
        minWidth: 0,
      })}
    >
      <motion.div ref={ref} style={densityStyle} />
    </Stack>
  );
};
