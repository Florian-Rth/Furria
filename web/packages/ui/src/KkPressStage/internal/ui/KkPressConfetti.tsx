import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkConfettiRain } from '../../../KkConfettiRain';
import type { KkPressPhase } from '../../press-beats';
import { hasKkPressCut } from '../../press-beats';
import { PRESS_CONFETTI } from '../logic/press-motion';
import { useRainWindow } from '../logic/use-rain-window';
import { KkPressBurst } from './KkPressBurst';

const RAIN_PIECES = 48;
const LEFT_SEED = 17;
const RIGHT_SEED = 41;

interface KkPressConfettiProps {
  phase: KkPressPhase;
  runKey: number;
}

export const KkPressConfetti: FC<KkPressConfettiProps> = ({ phase, runKey }) => {
  const fireKey = hasKkPressCut(phase) ? runKey : 0;
  const rain = useRainWindow(fireKey);
  const fading = rain === 'fading';
  const rainLayer =
    rain === 'dry' ? null : (
      <Box
        aria-hidden
        data-kk-press-rain
        sx={(theme) => ({
          position: 'fixed',
          inset: 0,
          zIndex: theme.zIndex.tooltip,
          isolation: 'isolate',
          pointerEvents: 'none',
        })}
      >
        <KkConfettiRain
          count={RAIN_PIECES}
          seed={runKey}
          fadeOut={fading}
          colors={PRESS_CONFETTI}
          alwaysPlays
        />
      </Box>
    );

  return (
    <>
      <KkPressBurst corner="left" fireKey={fireKey} seed={LEFT_SEED} />
      <KkPressBurst corner="right" fireKey={fireKey} seed={RIGHT_SEED} />
      {rainLayer}
    </>
  );
};
