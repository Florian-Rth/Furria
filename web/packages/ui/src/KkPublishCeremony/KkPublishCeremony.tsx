import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { KkVisuallyHidden } from '../KkVisuallyHidden';
import { announcementOf } from './internal/logic/ceremony-announcement';
import { isKkPressBusy } from './internal/logic/press-beats';
import { sheetMotionOf } from './internal/logic/press-motion';
import { KkPressConfetti } from './internal/ui/KkPressConfetti';
import { KkPressCut } from './internal/ui/KkPressCut';
import { KkPressPlates } from './internal/ui/KkPressPlates';
import { KkPressRoller } from './internal/ui/KkPressRoller';
import { KkPressStamp } from './internal/ui/KkPressStamp';
import type { KkPublishAnnouncements } from './publish-stamp';
import type { KkPublishCeremonyStage } from './use-publish-ceremony';

interface KkPublishCeremonyProps {
  stage: KkPublishCeremonyStage;
  announcements: KkPublishAnnouncements;
  children: ReactNode;
}

export const KkPublishCeremony: FC<KkPublishCeremonyProps> = ({
  stage,
  announcements,
  children,
}) => {
  const { phase, failed, runKey } = stage;
  const busy = isKkPressBusy(phase);
  const announcement = announcementOf(stage, announcements);
  const stamp = stage.stamp === null ? null : <KkPressStamp key={runKey} stamp={stage.stamp} />;

  return (
    <Box
      component={motion.div}
      data-kk-publish-ceremony
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
