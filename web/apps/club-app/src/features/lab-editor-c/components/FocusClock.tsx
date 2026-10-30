import { KkFocusTop } from '@furria/ui/KkFocusTop';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { countAt } from '@/features/act-player/music-timeline';
import { fineClockOf } from '@/features/act-studio/studio-copy';
import { clockMetaOf, countTextOf, FOCUS_CLOCK_LABEL } from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusClockProps {
  editor: FocusEditor;
}

export const FocusClock: FC<FocusClockProps> = ({ editor }) => {
  const { playback } = editor.screen;
  const seconds = usePlaybackSeconds(playback.player);
  const count = countAt(playback.segments, seconds);
  const countText = count === null ? null : countTextOf(count.count, count.eight);
  const value = fineClockOf(seconds);
  const meta = editor.desk
    ? clockMetaOf(editor.stepNumber, playback.steps.length, countText)
    : (countText ?? clockMetaOf(editor.stepNumber, playback.steps.length, null));

  return <KkFocusTop.Readout value={value} meta={meta} label={FOCUS_CLOCK_LABEL} />;
};
