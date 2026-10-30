import { KkStudioHMarks } from '@furria/ui/KkStudioHMarks';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHMarks } from '../hooks/use-studio-h-marks';
import { STUDIO_H_MARKS_LABEL } from '../studio-h-copy';
import { StudioHPlayheadLive } from './StudioHPlayheadLive';

interface StudioHMarkStripProps {
  h: StudioH;
}

export const StudioHMarkStrip: FC<StudioHMarkStripProps> = ({ h }) => {
  const marks = useStudioHMarks(h);
  const parts = marks.parts.map((part) => (
    <KkStudioHMarks.Part
      key={part.key}
      start={part.start}
      end={part.end}
      name={part.name}
      current={part.current}
    />
  ));
  const steps = marks.steps.map((step) => (
    <KkStudioHMarks.Step
      key={step.key}
      start={step.start}
      end={step.end}
      number={step.number}
      label={step.label}
      current={step.current}
      onPress={step.press}
    />
  ));
  const borders = marks.borders.map((border) => (
    <KkStudioHMarks.Border
      key={border.key}
      share={border.share}
      label={border.label}
      text={border.text}
      active={border.active}
      onMove={border.move}
      onEnd={border.end}
    />
  ));

  return (
    <KkStudioHMarks label={STUDIO_H_MARKS_LABEL}>
      {parts}
      {steps}
      <StudioHPlayheadLive player={h.playback.player} start={0} end={h.playback.length} />
      {borders}
    </KkStudioHMarks>
  );
};
