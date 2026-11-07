import { ActStudioView } from '@furria/studio/ActStudioView';
import { StepSetupView } from '@furria/studio/StepSetupView';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import type { StepSetupPage } from '../hooks/use-step-setup-page';
import { useStepSetupPort } from '../hooks/use-step-setup-port';
import { useStudioScreen } from '../hooks/use-studio-screen';

interface StepSetupBodyProps {
  page: StepSetupPage;
  actId: number;
  studio: ActStudio;
}

export const StepSetupBody: FC<StepSetupBodyProps> = ({ page, actId, studio }) => {
  const screen = useStudioScreen(actId, studio, page.viewerId, page.canEdit, page.cast, {
    evening: null,
    startEditing: true,
    startHall: null,
    stageEditor: true,
    tone: page.tone,
  });
  const port = useStepSetupPort(screen, page.leave);

  if (screen.editor === null) {
    return <ActStudioView title={page.actName} tone={page.tone} screen={screen} />;
  }

  return <StepSetupView title={page.actName} screen={screen} port={port} />;
};
