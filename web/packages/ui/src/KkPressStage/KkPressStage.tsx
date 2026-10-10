import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { KkVisuallyHidden } from '../KkVisuallyHidden';
import { sheetMotionOf } from './internal/logic/press-motion';
import { KkPressConfetti } from './internal/ui/KkPressConfetti';
import { KkPressCut } from './internal/ui/KkPressCut';
import { KkPressPlates } from './internal/ui/KkPressPlates';
import { KkPressRoller } from './internal/ui/KkPressRoller';
import type { KkPressPhase } from './press-beats';
import { isKkPressBusy } from './press-beats';

interface KkPressStageProps {
  phase: KkPressPhase;
  failed: boolean;
  runKey: number;
  announcement: string;
  stamp?: ReactNode;
  children: ReactNode;
}

export const KkPressStage: FC<KkPressStageProps> = ({
  phase,
  failed,
  runKey,
  announcement,
  stamp,
  children,
}) => {
  const busy = isKkPressBusy(phase);

  return (
    <Box
      component={motion.div}
      data-kk-press-stage
      animate={sheetMotionOf(phase, failed)}
      sx={{ position: 'relative', minWidth: 0 }}
    >
      <Box inert={busy} aria-busy={busy} sx={{ minWidth: 0 }}>
        {children}
      </Box>
      <KkPressRoller phase={phase} runKey={runKey} />
      <KkPressPlates phase={phase} failed={failed} runKey={runKey} />
      <KkPressCut phase={phase} runKey={runKey} />
      <KkPressConfetti phase={phase} runKey={runKey} />
      {stamp}
      <KkVisuallyHidden>
        <Box component="span" role="status" aria-live="polite">
          {announcement}
        </Box>
      </KkVisuallyHidden>
    </Box>
  );
};
