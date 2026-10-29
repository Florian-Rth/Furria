import { KkNote } from '@furria/ui/KkNote';
import { KkStudioAManual } from '@furria/ui/KkStudioAManual';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioAManual } from '../hooks/use-studio-a-manual';
import type { StudioAPractice } from '../hooks/use-studio-a-practice';
import { STUDIO_A_LOOP_ACTION, STUDIO_A_MANUAL_LABEL, STUDIO_A_NO_STEPS } from '../studio-a-copy';

interface StudioAManualLayerProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: StudioAPractice;
  mirrored: boolean;
}

export const StudioAManualLayer: FC<StudioAManualLayerProps> = ({
  studio,
  playback,
  practice,
  mirrored,
}) => {
  const manual = useStudioAManual(studio, playback, practice, mirrored);
  const sections = manual.sections.map((section) => {
    const action =
      section.loop === null ? undefined : { label: STUDIO_A_LOOP_ACTION, onSelect: section.loop };
    const head = (
      <KkStudioAManual.Head
        title={section.title}
        meta={section.meta}
        state={section.state}
        tone={section.attention ? 'attention' : 'part'}
        action={action}
      />
    );
    const rows = section.rows.map((row) => {
      const thumb =
        row.thumb === null ? undefined : (
          <KkStudioAManual.Thumb dots={row.thumb} aspect={manual.aspect} />
        );

      return (
        <KkStudioAManual.Step
          key={row.key}
          number={row.number}
          title={row.title}
          facts={row.facts}
          description={row.description}
          thumb={thumb}
          state={row.state}
          tone={row.attention ? 'attention' : 'timed'}
          actionLabel={row.actionLabel}
          onSelect={row.select}
        />
      );
    });

    return (
      <KkStudioAManual.Group key={section.key} head={head}>
        {rows}
      </KkStudioAManual.Group>
    );
  });

  if (sections.length === 0) {
    return <KkNote>{STUDIO_A_NO_STEPS}</KkNote>;
  }

  return (
    <KkStudioAManual label={STUDIO_A_MANUAL_LABEL}>
      <KkStudioAManual.List>{sections}</KkStudioAManual.List>
    </KkStudioAManual>
  );
};
