import { ActStudioView } from '@furria/studio/ActStudioView';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';
import type { StudioEveningContext } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { ActStudio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { StepSetupView } from './StepSetupView';

interface StepSetupStudioProps {
  actId: number;
  title: string;
  tone: KkGroupTone | null;
  studio: ActStudio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
}

export const StepSetupStudio: FC<StepSetupStudioProps> = ({
  actId,
  title,
  tone,
  studio,
  viewerId,
  canEdit,
  cast,
  context,
}) => {
  const screen = useStudioScreen(actId, studio, viewerId, canEdit, cast, context);

  if (screen.editor === null) {
    return <ActStudioView title={title} tone={tone} screen={screen} />;
  }

  return <StepSetupView actId={actId} title={title} screen={screen} />;
};
