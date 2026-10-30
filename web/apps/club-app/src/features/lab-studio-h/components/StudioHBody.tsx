import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioHView } from '@furria/ui/KkStudioHView';
import type { FC } from 'react';
import { PracticeSteps } from '@/features/act-practice/components/PracticeSteps';
import type { Studio } from '@/features/acts/schemas';
import { useStudioH } from '../hooks/use-studio-h';
import { useStudioHStage } from '../hooks/use-studio-h-stage';
import { useStudioHTakes } from '../hooks/use-studio-h-takes';
import { STUDIO_H_LABEL } from '../studio-h-copy';
import { StudioHControls } from './StudioHControls';
import { StudioHHead } from './StudioHHead';
import { StudioHHero } from './StudioHHero';
import { StudioHSide } from './StudioHSide';
import { StudioHSpotSheet } from './StudioHSpotSheet';
import { StudioHToolTabs } from './StudioHToolTabs';

interface StudioHBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
}

export const StudioHBody: FC<StudioHBodyProps> = ({ actId, studio, viewerId, canEdit }) => {
  const h = useStudioH(actId, studio, viewerId, canEdit);
  const editor = useStudioHStage(h);
  const takes = useStudioHTakes(h);

  return (
    <KkStudioHView label={STUDIO_H_LABEL} editing={h.mode.editing}>
      <StudioHHead h={h} />
      <KkPracticeView.Hero>
        <StudioHHero h={h} editor={editor} />
      </KkPracticeView.Hero>
      <KkPracticeView.Side>
        <StudioHSide h={h} editor={editor} takes={takes} />
      </KkPracticeView.Side>
      <KkPracticeView.Controls>
        <StudioHControls h={h} editor={editor} takes={takes} />
      </KkPracticeView.Controls>
      <KkStudioHView.Tools>
        <StudioHToolTabs mode={h.mode} />
      </KkStudioHView.Tools>
      <PracticeSteps steps={h.steps} />
      <StudioHSpotSheet h={h} editor={editor} />
    </KkStudioHView>
  );
};
