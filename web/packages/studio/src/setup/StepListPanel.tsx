import { JobActionButton } from '@furria/studio/JobActionButton';
import { StepListGroup } from '@furria/studio/StepListGroup';
import {
  SL_EMPTY,
  SL_EVENING,
  SL_LIST,
  SL_SETUP_OWNER,
  SS_TITLE,
  stepGroupKeyOf,
} from '@furria/studio/step-setup-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useJobConfirm } from '@furria/studio/use-job-confirm';
import { useStepList } from '@furria/studio/use-step-list';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkSsStepList } from '@furria/ui/KkSsStepList';
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
  const empty = groups.length === 0 ? <KkEjPanel.Note text={SL_EMPTY} /> : null;
  const evening = list.editable ? null : <KkEjPanel.Note text={SL_EVENING} />;
  const add = list.editable ? (
    <KkEjPanel.Tools>
      <JobActionButton action={list.add} />
    </KkEjPanel.Tools>
  ) : null;
  const setup = list.editable ? (
    <KkEjPanel.Block label={SS_TITLE}>
      <KkEjPanel.Context owner={SL_SETUP_OWNER} title={SS_TITLE} meta={list.setup.text} />
      <KkEjPanel.Tools>
        <JobActionButton action={list.setup.action} />
      </KkEjPanel.Tools>
    </KkEjPanel.Block>
  ) : null;

  return (
    <KkEjPanel label={SL_LIST}>
      {setup}
      {evening}
      <KkSsStepList label={SL_LIST}>{groups}</KkSsStepList>
      {empty}
      {add}
    </KkEjPanel>
  );
};
