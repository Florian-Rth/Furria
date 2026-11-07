import { JobFieldsSection } from '@furria/studio/JobFieldsSection';
import { JobToolsSection } from '@furria/studio/JobToolsSection';
import { StepListItem } from '@furria/studio/StepListItem';
import type { StepGroup } from '@furria/studio/step-list';
import {
  SL_LOOSE,
  SL_PART_DETAIL,
  SL_PART_EYEBROW,
  slPartLabelOf,
} from '@furria/studio/step-setup-copy';
import type { StudioStage } from '@furria/studio/studio-schemas';
import type { StepList, StepListRow } from '@furria/studio/use-step-list';
import { KkSsStepList } from '@furria/ui/KkSsStepList';
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
      <KkSsStepList.Group label={SL_LOOSE} framed={false}>
        {items}
      </KkSsStepList.Group>
    );
  }

  const part = list.parts.get(group.part.partId);
  const detail = list.partDetail?.partId === group.part.partId ? list.partDetail : null;
  const fields = detail === null ? [] : [detail.field];
  const partEdit =
    detail === null ? null : (
      <KkSsStepList.Detail label={SL_PART_DETAIL}>
        <JobFieldsSection title={SL_PART_DETAIL} fields={fields} />
        <JobToolsSection label={SL_PART_DETAIL} title={null} aside={null} actions={detail.tools} />
      </KkSsStepList.Detail>
    );
  const head =
    part === undefined ? null : (
      <KkSsStepList.Head
        eyebrow={SL_PART_EYEBROW}
        title={group.part.name}
        meta={part.meta}
        selected={part.selected}
        label={slPartLabelOf(group.part.name)}
        onPress={part.press}
      />
    );

  return (
    <KkSsStepList.Group label={group.part.name} framed>
      {head}
      {partEdit}
      {items}
    </KkSsStepList.Group>
  );
};
