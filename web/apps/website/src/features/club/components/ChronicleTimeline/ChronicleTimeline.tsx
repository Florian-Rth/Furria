import { KkSection } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  chronicleChapter,
  MILESTONES,
  resolveMilestoneTint,
} from '@/features/club/chronicle-content';
import { ChronicleSpine } from './internal/layout/ChronicleSpine';
import { ChronicleMilestone } from './internal/ui/ChronicleMilestone';

export const ChronicleTimeline: FC = () => {
  const theme = useTheme();

  return (
    <KkSection>
      <KkSection.Header {...chronicleChapter} />
      <ChronicleSpine>
        {MILESTONES.map((milestone, index) => (
          <ChronicleMilestone
            key={milestone.year}
            milestone={milestone}
            tint={resolveMilestoneTint(theme, index)}
            accented={index === 0}
          />
        ))}
      </ChronicleSpine>
    </KkSection>
  );
};
