import { KkPracticeStage } from '@furria/ui/KkPracticeStage';
import { KkStudioIDetail } from '@furria/ui/KkStudioIDetail';
import { KkStudioIOverview } from '@furria/ui/KkStudioIOverview';
import type { FC } from 'react';
import { PRACTICE_FRONT, PRACTICE_STAGE_LABEL } from '@/features/act-practice/practice-copy';
import type { StudioIOverviewView } from '../hooks/use-studio-i-overview';
import { STUDIO_I_FINAL_SLOT } from '../studio-i-copy';

interface StudioIOverviewExtrasProps {
  overview: StudioIOverviewView;
}

export const StudioIOverviewExtras: FC<StudioIOverviewExtrasProps> = ({ overview }) => (
  <>
    <KkStudioIOverview.Section label={overview.stageTitle}>
      <KkStudioIOverview.Head title={overview.stageTitle} meta={overview.stageMeta} />
      <KkStudioIOverview.Stage>
        <KkPracticeStage
          label={PRACTICE_STAGE_LABEL}
          frontLabel={PRACTICE_FRONT}
          widthMetres={overview.stage.widthMetres}
          depthMetres={overview.stage.depthMetres}
          artworkSvg={overview.stage.artworkSvg}
        />
      </KkStudioIOverview.Stage>
    </KkStudioIOverview.Section>
    <KkStudioIOverview.Section label={overview.finalTitle}>
      <KkStudioIOverview.Head title={overview.finalTitle} meta={overview.finalMeta} />
      <KkStudioIDetail.Slot label={STUDIO_I_FINAL_SLOT} text={overview.finalNote} />
    </KkStudioIOverview.Section>
  </>
);
