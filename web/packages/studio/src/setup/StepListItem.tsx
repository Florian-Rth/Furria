import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobFieldsSection } from '@furria/studio/JobFieldsSection';
import { JobToolsSection } from '@furria/studio/JobToolsSection';
import { SetupFormationThumb } from '@furria/studio/SetupFormationThumb';
import {
  SL_DELETE_NOTE,
  SL_DETAIL,
  SL_GROUP_PART,
  SL_GROUP_STEP,
  SL_NO_FORMATION,
  SS_PART_MIDDLE,
  slPairLabelOf,
  slRowLabelOf,
} from '@furria/studio/step-setup-copy';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { StepListDetail, StepListRow } from '@furria/studio/use-step-list';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkSsStepList } from '@furria/ui/KkSsStepList';
import type { FC } from 'react';

interface StepListItemProps {
  row: StepListRow;
  detail: StepListDetail | null;
  stage: StudioStage;
}

export const StepListItem: FC<StepListItemProps> = ({ row, detail, stage }) => {
  const picture =
    row.formation === null ? (
      <KkSsStepList.None text={SL_NO_FORMATION} />
    ) : (
      <KkSsStepList.Pair label={slPairLabelOf(row.number)}>
        <KkSsStepList.Picture>
          <SetupFormationThumb stage={stage} points={row.formation.before} />
        </KkSsStepList.Picture>
        <KkSsStepList.Arrow />
        <KkSsStepList.Picture>
          <SetupFormationThumb stage={stage} points={row.formation.after} />
        </KkSsStepList.Picture>
      </KkSsStepList.Pair>
    );
  const lock = detail?.partLocked === true ? <KkEjPanel.Note text={SS_PART_MIDDLE} /> : null;
  const shown =
    detail === null ? null : (
      <KkSsStepList.Detail label={SL_DETAIL}>
        <JobFieldsSection title={SL_DETAIL} fields={detail.fields} />
        <JobToolsSection label={SL_GROUP_STEP} title={null} aside={null} actions={detail.tools} />
        <JobToolsSection
          label={SL_GROUP_PART}
          title={SL_GROUP_PART}
          aside={null}
          actions={detail.partTools}
        />
        {lock}
        <KkEjPanel.Danger>
          <JobActionButton action={detail.danger} />
          <KkEjPanel.Note text={SL_DELETE_NOTE} />
        </KkEjPanel.Danger>
      </KkSsStepList.Detail>
    );
  const label = slRowLabelOf(row.number, row.name);
  const lead = String(row.number);

  return (
    <KkSsStepList.Item selected={row.selected}>
      <KkSsStepList.Row label={label} selected={row.selected} onPress={row.press}>
        <KkSsStepList.Lead number={lead} />
        <KkSsStepList.Thumb poster={row.poster} />
        <KkSsStepList.Text title={row.name} meta={row.meta} />
        {picture}
      </KkSsStepList.Row>
      {shown}
    </KkSsStepList.Item>
  );
};
