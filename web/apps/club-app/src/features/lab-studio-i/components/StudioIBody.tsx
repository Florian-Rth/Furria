import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioIDrafts } from '../hooks/use-studio-i-drafts';
import { useStudioIMode } from '../hooks/use-studio-i-mode';
import { StudioIEditor } from './StudioIEditor';
import { StudioIPractice } from './StudioIPractice';

interface StudioIBodyProps {
  actId: number;
  title: string;
  origin: KkScreenOrigin;
  studio: Studio;
  viewerId: number | null;
  canEdit: boolean;
}

export const StudioIBody: FC<StudioIBodyProps> = ({
  actId,
  title,
  origin,
  studio,
  viewerId,
  canEdit,
}) => {
  const playback = useStudioPlayback(studio, viewerId);
  const drafts = useStudioIDrafts(studio.steps);
  const mode = useStudioIMode(playback, drafts.spans, canEdit);
  const body = mode.editing ? (
    <StudioIEditor studio={studio} playback={playback} drafts={drafts} mode={mode} />
  ) : (
    <StudioIPractice
      actId={actId}
      studio={studio}
      playback={playback}
      viewerId={viewerId}
      canEdit={canEdit}
      onEdit={mode.enter}
    />
  );

  return (
    <KkScreen kind="fullscreen" title={title} origin={origin} actions={mode.actions}>
      {body}
    </KkScreen>
  );
};
