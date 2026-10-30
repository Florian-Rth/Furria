import { KkFocusOverview } from '@furria/ui/KkFocusOverview';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { bracketTextOf, FOCUS_BRACKET } from '../focus-copy';
import { followedStartOf } from '../focus-window';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusOverviewWindowProps {
  editor: FocusEditor;
}

export const FocusOverviewWindow: FC<FocusOverviewWindowProps> = ({ editor }) => {
  const { view: control } = editor;
  const seconds = usePlaybackSeconds(editor.screen.playback.player);
  const { length } = control;
  const start = control.playing ? followedStartOf(control.view, seconds) : control.view.start;
  const end = start + control.view.width;
  const shareOf = (value: number): number =>
    length <= 0 ? 0 : Math.min(1, Math.max(0, value / length));
  const valueText = bracketTextOf(start, Math.min(end, length));
  const startShare = shareOf(start);
  const endShare = shareOf(end);
  const playhead = shareOf(seconds);

  if (length <= 0) {
    return null;
  }

  return (
    <>
      <KkFocusOverview.Bracket
        start={startShare}
        end={endShare}
        label={FOCUS_BRACKET}
        valueText={valueText}
        onGrab={control.grab}
        onPan={control.pan}
        onEdge={control.edge}
        onRelease={control.release}
        onKey={control.key}
      />
      <KkFocusOverview.Playhead share={playhead} />
    </>
  );
};
