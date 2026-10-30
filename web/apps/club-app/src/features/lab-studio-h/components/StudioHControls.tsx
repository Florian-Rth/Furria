import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioHEdit } from '@furria/ui/KkStudioHEdit';
import { KkStudioHView } from '@furria/ui/KkStudioHView';
import type { FC } from 'react';
import { PracticeSegmentsLive } from '@/features/act-practice/components/PracticeSegmentsLive';
import {
  barStatusOf,
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_TRANSPORT_LABEL,
} from '@/features/act-practice/practice-copy';
import type { StudioH } from '../hooks/use-studio-h';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import type { StudioHTakes } from '../hooks/use-studio-h-takes';
import { STUDIO_H_DONE, STUDIO_H_EDIT } from '../studio-h-copy';
import { StudioHCountStrip } from './StudioHCountStrip';
import { StudioHMarkStrip } from './StudioHMarkStrip';
import { StudioHVideoStrip } from './StudioHVideoStrip';

interface StudioHControlsProps {
  h: StudioH;
  editor: StudioHStage;
  takes: StudioHTakes;
}

export const StudioHControls: FC<StudioHControlsProps> = ({ h, editor, takes }) => {
  const { playback, practice, mode, frame } = h;
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
      <KkStudioHEdit
        editing={mode.editing}
        editLabel={STUDIO_H_EDIT}
        doneText={STUDIO_H_DONE}
        onToggle={mode.toggle}
      />
    </>
  ) : null;

  return (
    <KkPracticeTransport label={PRACTICE_TRANSPORT_LABEL}>
      <KkStudioHView.Strip>
        <KkStudioHView.Layer shown={frame.strip === 'segments'}>
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
        </KkStudioHView.Layer>
        <KkStudioHView.Layer shown={frame.strip === 'marks'}>
          <StudioHMarkStrip h={h} />
        </KkStudioHView.Layer>
        <KkStudioHView.Layer shown={frame.strip === 'counts'}>
          <StudioHCountStrip h={h} editor={editor} />
        </KkStudioHView.Layer>
        <KkStudioHView.Layer shown={frame.strip === 'placement'}>
          <StudioHVideoStrip h={h} takes={takes} />
        </KkStudioHView.Layer>
      </KkStudioHView.Strip>
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
