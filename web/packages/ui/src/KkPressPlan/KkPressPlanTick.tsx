import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkPressPlanTickData } from './KkPressPlan';
import { KkPressPlanTickBar } from './KkPressPlanTickBar';
import { PRESS_PLAN_BARS } from './press-plan-bars';

const PERCENT = 100;

interface KkPressPlanTickProps {
  tick: KkPressPlanTickData;
  delaySeconds: number;
  onReveal: (id: string) => void;
}

export const KkPressPlanTick: FC<KkPressPlanTickProps> = ({ tick, delaySeconds, onReveal }) => {
  const left = `${tick.position * PERCENT}%`;
  const bars = PRESS_PLAN_BARS[tick.state].map((bar) => (
    <KkPressPlanTickBar key={bar.key} bar={bar} delaySeconds={delaySeconds} />
  ));

  const handleReveal = (): void => {
    onReveal(tick.id);
  };

  return (
    <ButtonBase
      aria-label={tick.label}
      title={tick.label}
      data-kk-press-plan-tick={tick.state}
      onClick={handleReveal}
      sx={(theme: Theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left,
        width: theme.spacing(2.5),
        transform: 'translateX(-50%)',
        borderRadius: 1,
        '&:hover, &.Mui-focusVisible': { bgcolor: 'action.hover' },
      })}
    >
      {bars}
    </ButtonBase>
  );
};
