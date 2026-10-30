import { KkStudioMarks } from '@furria/ui/KkStudioMarks';
import type { FC } from 'react';
import { useActStudioMarks } from '../hooks/use-act-studio-marks';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_MARKS_LABEL } from '../studio-copy';
import { ActStudioPlayheadLive } from './ActStudioPlayheadLive';

interface ActStudioMarkStripProps {
  screen: StudioScreen;
}

export const ActStudioMarkStrip: FC<ActStudioMarkStripProps> = ({ screen }) => {
  const marks = useActStudioMarks(screen);
  const parts = marks.parts.map((part) => (
    <KkStudioMarks.Part
      key={part.key}
      start={part.start}
      end={part.end}
      name={part.name}
      current={part.current}
    />
  ));
  const steps = marks.steps.map((step) => (
    <KkStudioMarks.Step
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
    <KkStudioMarks.Border
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
    <KkStudioMarks label={STUDIO_MARKS_LABEL}>
      {parts}
      {steps}
      <ActStudioPlayheadLive
        player={screen.playback.player}
        start={0}
        end={screen.playback.length}
      />
      {borders}
    </KkStudioMarks>
  );
};
