import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { KkScreenHeaderAlign } from '../../../KkScreenHeader/internal/layout/KkScreenHeaderRoot';
import { KkScreenHeader } from '../../../KkScreenHeader/KkScreenHeader';
import { kkTokens } from '../../../tokens';
import type { KkGreetingBeat } from '../logic/greeting-context';
import { GreetingStageContext } from '../logic/greeting-context';
import type { GreetingConductorProps } from '../logic/use-greeting-conductor';
import { useGreetingConductor } from '../logic/use-greeting-conductor';
import { GreetingBurst } from '../ui/GreetingBurst';

const STAGE = { position: 'relative', minWidth: 0, maxWidth: kkTokens.measure.text } as const;

export type KkGreetingVisual = ReactNode | ((beat: KkGreetingBeat) => ReactNode);

interface KkGreetingRootProps extends GreetingConductorProps, PropsWithChildren {
  visual?: KkGreetingVisual;
  align?: KkScreenHeaderAlign;
}

const visualOf = (visual: KkGreetingVisual, beat: KkGreetingBeat): ReactNode =>
  typeof visual === 'function' ? visual(beat) : visual;

export const KkGreetingRoot: FC<KkGreetingRootProps> = ({
  children,
  visual,
  align,
  ...conducting
}) => {
  const { stage, shot } = useGreetingConductor(conducting);
  const beat: KkGreetingBeat = { phase: stage.phase, clock: stage.clock, festive: stage.festive };
  const shownVisual =
    visual === undefined ? null : (
      <KkScreenHeader.Visual>{visualOf(visual, beat)}</KkScreenHeader.Visual>
    );

  return (
    <GreetingStageContext.Provider value={stage}>
      <Box ref={stage.attach} data-kk-greeting sx={STAGE}>
        <KkScreenHeader align={align}>
          {shownVisual}
          <KkScreenHeader.Text>{children}</KkScreenHeader.Text>
        </KkScreenHeader>
        <GreetingBurst shot={shot} />
      </Box>
    </GreetingStageContext.Provider>
  );
};
