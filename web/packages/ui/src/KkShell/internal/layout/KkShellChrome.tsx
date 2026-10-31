import Stack from '@mui/material/Stack';
import type { FC, Ref } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { useScrollDriven } from '../../../internal/use-scroll-driven';
import { kkTokens } from '../../../tokens';
import { KkShellChromeDensity } from './KkShellChromeDensity';
import { KkShellChromeScrollDensity } from './KkShellChromeScrollDensity';

const { gutter } = kkTokens.shell;

interface KkShellChromeProps {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellChrome: FC<KkShellChromeProps> = ({ ref }) => {
  const scrollDriven = useScrollDriven();
  const Density = scrollDriven ? KkShellChromeScrollDensity : KkShellChromeDensity;

  return (
    <Stack
      component="header"
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
      <Density ref={ref} />
    </Stack>
  );
};
