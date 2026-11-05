import type { FC } from 'react';
import type { KkTabMark, KkTabStrokeState } from '../tab-strokes';
import { TAB_STROKE_DRAW_DELAY_MS, TAB_STROKE_DRAW_STAGGER_MS } from './tab-stroke-paint';

interface KkTabStrokeMarksProps {
  marks: readonly KkTabMark[];
  states: readonly KkTabStrokeState[];
  offset: number;
  width: number;
}

export const KkTabStrokeMarks: FC<KkTabStrokeMarksProps> = ({ marks, states, offset, width }) => {
  const firstFresh = states.indexOf('fresh');
  const lines = marks.map((mark) => {
    const state = states[offset + mark.index] ?? 'open';
    const order = offset + mark.index - firstFresh;
    const delay =
      state === 'fresh' ? `${TAB_STROKE_DRAW_DELAY_MS + order * TAB_STROKE_DRAW_STAGGER_MS}ms` : '';

    return (
      <line
        key={mark.index}
        data-tab-stroke={state}
        x1={mark.x1}
        y1={mark.y1}
        x2={mark.x2}
        y2={mark.y2}
        strokeWidth={mark.crossing ? width * 0.86 : width}
        pathLength={1}
        style={{ animationDelay: delay }}
      />
    );
  });

  return <g>{lines}</g>;
};
