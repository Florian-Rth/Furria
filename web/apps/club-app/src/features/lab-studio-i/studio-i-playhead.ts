import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { StepSpan } from './studio-i-spans';
import { loopRangeOf } from './studio-i-wave';

export const loopOnSpan = (
  player: MixPlayer,
  span: StepSpan,
  marks: readonly CountMark[],
): void => {
  const loop = loopRangeOf(span, marks);
  const position = player.position();
  player.setLoop(loop);
  if (position < loop.start || position >= loop.end) {
    player.seek(loop.start);
  }
};

export const restartOnSpan = (
  player: MixPlayer,
  span: StepSpan,
  marks: readonly CountMark[],
): void => {
  const loop = loopRangeOf(span, marks);
  player.setLoop(loop);
  player.seek(loop.start);
};
