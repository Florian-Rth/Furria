import { JobActionButton } from '@furria/studio/JobActionButton';
import {
  JOB_MUSIC_PAGE,
  JOB_NO_STEP,
  JOB_NO_STEP_HINT,
  JOB_NO_STEP_MUSIC,
  JOB_PAGE_LABEL,
} from '@furria/studio/job-copy';
import type { JobView } from '@furria/studio/job-view';
import { actionsIn } from '@furria/studio/job-view';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkPillButton } from '@furria/ui/KkPillButton';
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
  const note = silent ? JOB_NO_STEP_MUSIC : JOB_NO_STEP_HINT;
  const marks = actionsIn(steps, ['mark']).map((action) => (
    <JobActionButton key={action.key} action={action} />
  ));
  const action = silent ? (
    <KkPillButton text={JOB_MUSIC_PAGE} glyph="music" tone="accent" onPress={music} />
  ) : (
    marks
  );

  return (
    <KkLaneDesk.Panel label={JOB_NO_STEP}>
      <KkLaneInspector>
        <KkLaneInspector.Head eyebrow={JOB_PAGE_LABEL} title={JOB_NO_STEP} />
        <KkLaneInspector.Note text={note} />
        <KkLaneInspector.Actions label={JOB_NO_STEP}>{action}</KkLaneInspector.Actions>
      </KkLaneInspector>
    </KkLaneDesk.Panel>
  );
};
