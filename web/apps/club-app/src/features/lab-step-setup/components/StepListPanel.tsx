import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkSsStepList } from '@furria/ui/KkSsStepList';
import type { FC } from 'react';
import { EjActionButton } from '@/features/lab-edit-jobs/components/EjActionButton';
import { useEjConfirm } from '@/features/lab-edit-jobs/hooks/use-ej-confirm';
import { useStepList } from '../hooks/use-step-list';
import {
  SL_EMPTY,
  SL_EVENING,
  SL_LIST,
  SL_SETUP_OWNER,
  SS_TITLE,
  stepGroupKeyOf,
} from '../setup-copy';
import { StepListGroup } from './StepListGroup';

interface StepListPanelProps {
  screen: StudioScreen;
  actId: number;
}

export const StepListPanel: FC<StepListPanelProps> = ({ screen, actId }) => {
  const confirm = useEjConfirm();
  const list = useStepList(screen, actId, confirm);
  const { stage } = screen.playback;
  const groups = list.groups.map((group) => {
    const key = group.kind === 'part' ? stepGroupKeyOf(group.part.partId) : group.key;
    return <StepListGroup key={key} group={group} list={list} stage={stage} />;
  });
  const empty = groups.length === 0 ? <KkEjPanel.Note text={SL_EMPTY} /> : null;
  const evening = list.editable ? null : <KkEjPanel.Note text={SL_EVENING} />;
  const add = list.editable ? (
    <KkEjPanel.Tools>
      <EjActionButton action={list.add} />
    </KkEjPanel.Tools>
  ) : null;
  const setup = list.editable ? (
    <KkEjPanel.Block label={SS_TITLE}>
      <KkEjPanel.Context owner={SL_SETUP_OWNER} title={SS_TITLE} meta={list.setup.text} />
      <KkEjPanel.Tools>
        <EjActionButton action={list.setup.action} />
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
