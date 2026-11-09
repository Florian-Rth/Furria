import { JobActionButton } from '@furria/studio/JobActionButton';
import { StepListGroup } from '@furria/studio/StepListGroup';
import {
  STEP_LIST_EMPTY,
  STEP_LIST_LIST,
  STEP_LIST_SETUP_OWNER,
  STEP_SETUP_TITLE,
  stepGroupKeyOf,
} from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useJobConfirm } from '@furria/studio/use-job-confirm';
import { useStepList } from '@furria/studio/use-step-list';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkStudioStepList } from '@furria/ui/KkStudioStepList';
import type { FC } from 'react';

interface StepListPanelProps {
  screen: StudioScreen;
}

export const StepListPanel: FC<StepListPanelProps> = ({ screen }) => {
  const confirm = useJobConfirm();
  const list = useStepList(screen, confirm);
  const { stage } = screen.playback;
  const groups = list.groups.map((group) => {
    const key = group.kind === 'part' ? stepGroupKeyOf(group.part.partId) : group.key;
    return <StepListGroup key={key} group={group} list={list} stage={stage} />;
  });
  const empty = groups.length === 0 ? <KkJobPanel.Note text={STEP_LIST_EMPTY} /> : null;
  const add = list.editable ? (
    <KkJobPanel.Tools>
      <JobActionButton action={list.add} />
    </KkJobPanel.Tools>
  ) : null;
  const setup = list.editable ? (
    <KkJobPanel.Block label={STEP_SETUP_TITLE}>
      <KkJobPanel.Context
        owner={STEP_LIST_SETUP_OWNER}
        title={STEP_SETUP_TITLE}
        meta={list.setup.text}
      />
      <KkJobPanel.Tools>
        <JobActionButton action={list.setup.action} />
      </KkJobPanel.Tools>
    </KkJobPanel.Block>
  ) : null;

  return (
    <KkJobPanel label={STEP_LIST_LIST}>
      {setup}
      <KkStudioStepList label={STEP_LIST_LIST}>{groups}</KkStudioStepList>
      {empty}
      {add}
    </KkJobPanel>
  );
};
