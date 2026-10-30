import { KkFocusLanes } from '@furria/ui/KkFocusLanes';
import type { FC, PropsWithChildren } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { followedStartOf, trackScaleOf, trackShiftOf } from '../focus-window';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusTrackProps extends PropsWithChildren {
  editor: FocusEditor;
}

export const FocusTrack: FC<FocusTrackProps> = ({ editor, children }) => {
  const { view: control } = editor;
  const seconds = usePlaybackSeconds(editor.screen.playback.player);
  const start = control.playing ? followedStartOf(control.view, seconds) : control.view.start;
  const scale = trackScaleOf(control.view, control.length);
  const shift = trackShiftOf(start, control.length);

  return (
    <KkFocusLanes.Track scale={scale} shift={shift}>
      {children}
    </KkFocusLanes.Track>
  );
};
