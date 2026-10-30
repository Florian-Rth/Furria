import { KkFocusLanes } from '@furria/ui/KkFocusLanes';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { playheadShareOf } from '../focus-window';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusLanePlayheadProps {
  editor: FocusEditor;
}

export const FocusLanePlayhead: FC<FocusLanePlayheadProps> = ({ editor }) => {
  const { view: control } = editor;
  const seconds = usePlaybackSeconds(editor.screen.playback.player);
  const share = playheadShareOf(control.view, seconds, control.playing);

  if (share === null) {
    return null;
  }

  return <KkFocusLanes.Playhead share={share} />;
};
