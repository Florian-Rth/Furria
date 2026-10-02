import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { KkScreenHeader } from '../../../KkScreenHeader/KkScreenHeader';
import { kkTokens } from '../../../tokens';
import { GreetingStageContext } from '../logic/greeting-context';
import type { GreetingConductorProps } from '../logic/use-greeting-conductor';
import { useGreetingConductor } from '../logic/use-greeting-conductor';
import { GreetingBurst } from '../ui/GreetingBurst';

const STAGE = { position: 'relative', minWidth: 0, maxWidth: kkTokens.measure.text } as const;

interface KkGreetingRootProps extends GreetingConductorProps, PropsWithChildren {}

export const KkGreetingRoot: FC<KkGreetingRootProps> = ({ children, ...conducting }) => {
  const { stage, shot } = useGreetingConductor(conducting);

  return (
    <GreetingStageContext.Provider value={stage}>
      <Box ref={stage.rootRef} data-kk-greeting sx={STAGE}>
        <KkScreenHeader>
          <KkScreenHeader.Text>{children}</KkScreenHeader.Text>
        </KkScreenHeader>
        <GreetingBurst shot={shot} />
      </Box>
    </GreetingStageContext.Provider>
  );
};
