import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioEdit } from '@furria/ui/KkStudioEdit';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import { PracticeSegmentsLive } from '@/features/act-practice/components/PracticeSegmentsLive';
import {
  barStatusOf,
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_TRANSPORT_LABEL,
} from '@/features/act-practice/practice-copy';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_DONE, STUDIO_EDIT } from '../studio-copy';

interface ActStudioControlsProps {
  screen: StudioScreen;
}

export const ActStudioControls: FC<ActStudioControlsProps> = ({ screen }) => {
  const { playback, practice, mode } = screen;
  const status = barStatusOf(practice.loopKind, practice.partName);
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const edit = mode.canEdit ? (
    <>
      <KkPracticeTransport.Divider />
      <KkStudioEdit
        editing={mode.editing}
        editLabel={STUDIO_EDIT}
        doneText={STUDIO_DONE}
        onToggle={mode.toggle}
      />
    </>
  ) : null;

  return (
    <KkPracticeTransport label={PRACTICE_TRANSPORT_LABEL}>
      <KkStudioView.Strip>
        <KkStudioView.Layer shown>
          <PracticeSegmentsLive
            playback={playback}
            practice={practice}
            onLoopStep={practice.loopStep}
            onLoopPart={practice.loopPart}
          />
          <KkPracticeTransport.Status
            statusKey={practice.loopKind}
            text={status}
            accent={practice.loopKind !== 'off'}
          />
        </KkStudioView.Layer>
      </KkStudioView.Strip>
      <KkPracticeTransport.Pill>
        <KkPracticeTransport.Skip
          direction="back"
          label={PRACTICE_BACK}
          disabled={!practice.canStep}
          onSkip={back}
        />
        <KkPracticeTransport.Play
          playing={practice.playing}
          label={practice.playLabel}
          disabled={!practice.canPlay}
          onToggle={practice.toggle}
        />
        <KkPracticeTransport.Skip
          direction="forward"
          label={PRACTICE_FORWARD}
          disabled={!practice.canStep}
          onSkip={forward}
        />
        <KkPracticeTransport.Divider />
        <KkPracticeTransport.Rate
          text={practice.rateText}
          label={practice.rateLabel}
          slowed={practice.slowed}
          onPress={practice.slowDown}
        />
        {edit}
      </KkPracticeTransport.Pill>
    </KkPracticeTransport>
  );
};
