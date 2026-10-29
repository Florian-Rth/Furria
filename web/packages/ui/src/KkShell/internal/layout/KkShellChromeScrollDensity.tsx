import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC, Ref } from 'react';
import { scrollLinkedPaint } from '../../../internal/scroll-linked';
import { kkTokens } from '../../../tokens';
import {
  CHROME_THICKENING,
  SCROLLED_DENSITY_HANDOFF,
  SCROLLED_DENSITY_REGISTRATION,
} from '../logic/chrome-density-frames';

const { scrollTravel } = kkTokens.shell;

const THICKENING = {
  minWidth: 0,
  ...SCROLLED_DENSITY_HANDOFF,
  ...scrollLinkedPaint(CHROME_THICKENING, scrollTravel, 'instant-when-reduced'),
};

interface KkShellChromeScrollDensityProps {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellChromeScrollDensity: FC<KkShellChromeScrollDensityProps> = ({ ref }) => (
  <>
    <GlobalStyles styles={SCROLLED_DENSITY_REGISTRATION} />
    <Box ref={ref} sx={THICKENING} />
  </>
);
