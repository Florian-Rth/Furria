import type { StudioStage } from '@furria/studio/studio-schemas';
import { KkSsStepList } from '@furria/ui/KkSsStepList';
import type { FC } from 'react';
import { EjFieldsSection } from '@/features/lab-edit-jobs/components/EjFieldsSection';
import { EjToolsSection } from '@/features/lab-edit-jobs/components/EjToolsSection';
import type { StepList, StepListRow } from '../hooks/use-step-list';
import { SL_LOOSE, SL_PART_DETAIL, SL_PART_EYEBROW, slPartLabelOf } from '../setup-copy';
import type { StepGroup } from '../step-list';
import { StepListItem } from './StepListItem';

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
        <EjFieldsSection title={SL_PART_DETAIL} fields={fields} />
        <EjToolsSection label={SL_PART_DETAIL} title={null} aside={null} actions={detail.tools} />
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
