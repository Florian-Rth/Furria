import { ActStudioView } from '@furria/studio/ActStudioView';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';
import type { StudioEveningContext } from '@/features/act-studio/hooks/use-studio-screen';
import { useStudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import type { ActStudio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { useEjVersions } from '../hooks/use-ej-versions';
import { EditJobsEditor } from './EditJobsEditor';

interface EditJobsStudioProps {
  actId: number;
  title: string;
  tone: KkGroupTone | null;
  studio: ActStudio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioEveningContext;
}

export const EditJobsStudio: FC<EditJobsStudioProps> = ({
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
  const versions = useEjVersions(actId, context.evening?.eventId ?? null, studio);

  if (screen.editor === null) {
    return <ActStudioView title={title} tone={tone} screen={screen} />;
  }

  return <EditJobsEditor title={title} screen={screen} versions={versions} />;
};
