import {
  EJ_MUSIC_PAGE,
  EJ_NO_STEP,
  EJ_NO_STEP_HINT,
  EJ_NO_STEP_MUSIC,
  EJ_PAGE_LABEL,
} from '@furria/studio/edit-jobs-copy';
import type { JobView } from '@furria/studio/edit-jobs-view';
import { actionsIn } from '@furria/studio/edit-jobs-view';
import { JobActionButton } from '@furria/studio/JobActionButton';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkEjButton } from '@furria/ui/KkEjButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface JobPhoneEmptyProps {
  screen: StudioScreen;
  steps: JobView;
}

export const JobPhoneEmpty: FC<JobPhoneEmptyProps> = ({ screen, steps }) => {
  const music = (): void => {
    screen.openMusic('music');
  };
  const silent = screen.playback.length <= 0;
  const note = silent ? EJ_NO_STEP_MUSIC : EJ_NO_STEP_HINT;
  const marks = actionsIn(steps, ['mark']).map((action) => (
    <JobActionButton key={action.key} action={action} />
  ));
  const action = silent ? (
    <KkEjButton text={EJ_MUSIC_PAGE} glyph="music" tone="accent" onPress={music} />
  ) : (
    marks
  );

  return (
    <KkLaneDesk.Panel label={EJ_NO_STEP}>
      <KkLaneInspector>
        <KkLaneInspector.Head eyebrow={EJ_PAGE_LABEL} title={EJ_NO_STEP} />
        <KkLaneInspector.Note text={note} />
        <KkLaneInspector.Actions label={EJ_NO_STEP}>{action}</KkLaneInspector.Actions>
      </KkLaneInspector>
    </KkLaneDesk.Panel>
  );
};
