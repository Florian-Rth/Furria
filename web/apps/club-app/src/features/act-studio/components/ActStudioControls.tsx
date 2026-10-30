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
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { ActStudioTakes } from '../hooks/use-act-studio-takes';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_DONE, STUDIO_EDIT } from '../studio-copy';
import { ActStudioCountStrip } from './ActStudioCountStrip';
import { ActStudioMarkStrip } from './ActStudioMarkStrip';
import { ActStudioVideoStrip } from './ActStudioVideoStrip';

interface ActStudioControlsProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  takes: ActStudioTakes;
}

export const ActStudioControls: FC<ActStudioControlsProps> = ({ screen, editor, takes }) => {
  const { playback, practice, mode, frame } = screen;
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
        <KkStudioView.Layer shown={frame.strip === 'segments'}>
          <PracticeSegmentsLive
            playback={playback}
            practice={practice}
            onPress={practice.loopStep}
            onHold={practice.loopPart}
          />
          <KkPracticeTransport.Status
            statusKey={practice.loopKind}
            text={status}
            accent={practice.loopKind !== 'off'}
          />
        </KkStudioView.Layer>
        <KkStudioView.Layer shown={frame.strip === 'marks'}>
          <ActStudioMarkStrip screen={screen} />
        </KkStudioView.Layer>
        <KkStudioView.Layer shown={frame.strip === 'counts'}>
          <ActStudioCountStrip screen={screen} editor={editor} />
        </KkStudioView.Layer>
        <KkStudioView.Layer shown={frame.strip === 'placement'}>
          <ActStudioVideoStrip screen={screen} takes={takes} />
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
