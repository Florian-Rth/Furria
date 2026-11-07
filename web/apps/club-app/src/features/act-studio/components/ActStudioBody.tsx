import { ActStudioView } from '@furria/studio/ActStudioView';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { StudioScreenContext } from '../hooks/use-studio-screen';
import { useStudioScreen } from '../hooks/use-studio-screen';
import { ActStudioEditor } from './ActStudioEditor';

interface ActStudioBodyProps {
  actId: number;
  title: string;
  tone: KkGroupTone | null;
  studio: ActStudio;
  viewerId: number | null;
  canEdit: boolean;
  cast: readonly CastPerson[];
  context: StudioScreenContext;
}

export const ActStudioBody: FC<ActStudioBodyProps> = ({
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

  if (screen.editor !== null) {
    return <ActStudioEditor actId={actId} title={title} studio={studio} screen={screen} />;
  }

  return <ActStudioView title={title} tone={tone} screen={screen} />;
};
