import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { KkScreenHeader } from '../../../KkScreenHeader/KkScreenHeader';
import { kkTokens } from '../../../tokens';
import { GreetingStageContext } from '../logic/greeting-context';
import type { GreetingConductorProps } from '../logic/use-greeting-conductor';
import { useGreetingConductor } from '../logic/use-greeting-conductor';
import { GreetingBurst } from '../ui/GreetingBurst';

const STAGE = { position: 'relative', minWidth: 0, maxWidth: kkTokens.measure.text } as const;

interface KkGreetingRootProps extends GreetingConductorProps, PropsWithChildren {
  visual?: ReactNode;
}

export const KkGreetingRoot: FC<KkGreetingRootProps> = ({ children, visual, ...conducting }) => {
  const { stage, shot } = useGreetingConductor(conducting);
  const shownVisual =
    visual === undefined ? null : <KkScreenHeader.Visual>{visual}</KkScreenHeader.Visual>;

  return (
    <GreetingStageContext.Provider value={stage}>
      <Box ref={stage.attach} data-kk-greeting sx={STAGE}>
        <KkScreenHeader>
          {shownVisual}
          <KkScreenHeader.Text>{children}</KkScreenHeader.Text>
        </KkScreenHeader>
        <GreetingBurst shot={shot} />
      </Box>
    </GreetingStageContext.Provider>
  );
};
