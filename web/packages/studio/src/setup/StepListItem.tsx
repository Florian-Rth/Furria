import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobFieldsSection } from '@furria/studio/JobFieldsSection';
import { JobToolsSection } from '@furria/studio/JobToolsSection';
import { SetupFormationThumb } from '@furria/studio/SetupFormationThumb';
import {
  SETUP_PART_MIDDLE,
  STEP_LIST_DELETE_NOTE,
  STEP_LIST_DETAIL,
  STEP_LIST_GROUP_PART,
  STEP_LIST_GROUP_STEP,
  STEP_LIST_NO_FORMATION,
  stepListPairLabelOf,
  stepListRowLabelOf,
} from '@furria/studio/step-setup-copy';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { StepListDetail } from '@furria/studio/use-step-list-detail';
import type { StepListRow } from '@furria/studio/use-step-list-rows';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkStudioStepList } from '@furria/ui/KkStudioStepList';
import type { FC } from 'react';

interface StepListItemProps {
  row: StepListRow;
  detail: StepListDetail | null;
  stage: StudioStage;
}

export const StepListItem: FC<StepListItemProps> = ({ row, detail, stage }) => {
  const picture =
    row.formation === null ? (
      <KkStudioStepList.None text={STEP_LIST_NO_FORMATION} />
    ) : (
      <KkStudioStepList.Pair label={stepListPairLabelOf(row.number)}>
        <KkStudioStepList.Picture>
          <SetupFormationThumb stage={stage} points={row.formation.before} />
        </KkStudioStepList.Picture>
        <KkStudioStepList.Arrow />
        <KkStudioStepList.Picture>
          <SetupFormationThumb stage={stage} points={row.formation.after} />
        </KkStudioStepList.Picture>
      </KkStudioStepList.Pair>
    );
  const lock = detail?.partLocked === true ? <KkJobPanel.Note text={SETUP_PART_MIDDLE} /> : null;
  const shown =
    detail === null ? null : (
      <KkStudioStepList.Detail label={STEP_LIST_DETAIL}>
        <JobFieldsSection title={STEP_LIST_DETAIL} fields={detail.fields} />
        <JobToolsSection
          label={STEP_LIST_GROUP_STEP}
          title={null}
          aside={null}
          actions={detail.tools}
        />
        <JobToolsSection
          label={STEP_LIST_GROUP_PART}
          title={STEP_LIST_GROUP_PART}
          aside={null}
          actions={detail.partTools}
        />
        {lock}
        <KkJobPanel.Danger>
          <JobActionButton action={detail.danger} />
          <KkJobPanel.Note text={STEP_LIST_DELETE_NOTE} />
        </KkJobPanel.Danger>
      </KkStudioStepList.Detail>
    );
  const label = stepListRowLabelOf(row.number, row.name);
  const lead = String(row.number);

  return (
    <KkStudioStepList.Item selected={row.selected}>
      <KkStudioStepList.Row label={label} selected={row.selected} onPress={row.press}>
        <KkStudioStepList.Lead number={lead} />
        <KkStudioStepList.Thumb poster={row.poster} />
        <KkStudioStepList.Text title={row.name} meta={row.meta} />
        {picture}
      </KkStudioStepList.Row>
      {shown}
    </KkStudioStepList.Item>
  );
};
