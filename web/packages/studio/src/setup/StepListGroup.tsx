import { JobFieldsSection } from '@furria/studio/JobFieldsSection';
import { JobToolsSection } from '@furria/studio/JobToolsSection';
import { StepListItem } from '@furria/studio/StepListItem';
import type { StepGroup } from '@furria/studio/step-list';
import {
  STEP_LIST_LOOSE,
  STEP_LIST_PART_DETAIL,
  STEP_LIST_PART_EYEBROW,
  stepListPartLabelOf,
} from '@furria/studio/step-setup-copy';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { StepList } from '@furria/studio/use-step-list';
import type { StepListRow } from '@furria/studio/use-step-list-rows';
import { KkStudioStepList } from '@furria/ui/KkStudioStepList';
import type { FC } from 'react';

interface StepListGroupProps {
  group: StepGroup<StepListRow>;
  list: StepList;
  stage: StudioStage;
}

export const StepListGroup: FC<StepListGroupProps> = ({ group, list, stage }) => {
  const items = group.rows.map((row) => {
    const detail = list.detail?.stepId === row.stepId ? list.detail : null;
    return <StepListItem key={row.stepId} row={row} detail={detail} stage={stage} />;
  });

  if (group.kind === 'loose') {
    return (
      <KkStudioStepList.Group label={STEP_LIST_LOOSE} framed={false}>
        {items}
      </KkStudioStepList.Group>
    );
  }

  const part = list.parts.get(group.part.partId);
  const detail = list.partDetail?.partId === group.part.partId ? list.partDetail : null;
  const fields = detail === null ? [] : [detail.field];
  const partEdit =
    detail === null ? null : (
      <KkStudioStepList.Detail label={STEP_LIST_PART_DETAIL}>
        <JobFieldsSection title={STEP_LIST_PART_DETAIL} fields={fields} />
        <JobToolsSection
          label={STEP_LIST_PART_DETAIL}
          title={null}
          aside={null}
          actions={detail.tools}
        />
      </KkStudioStepList.Detail>
    );
  const head =
    part === undefined ? null : (
      <KkStudioStepList.Head
        eyebrow={STEP_LIST_PART_EYEBROW}
        title={group.part.name}
        meta={part.meta}
        selected={part.selected}
        label={stepListPartLabelOf(group.part.name)}
        onPress={part.press}
      />
    );

  return (
    <KkStudioStepList.Group label={group.part.name} framed>
      {head}
      {partEdit}
      {items}
    </KkStudioStepList.Group>
  );
};
