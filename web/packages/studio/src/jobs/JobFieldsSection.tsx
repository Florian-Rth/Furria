import type { JobField } from '@furria/studio/edit-jobs-view';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface JobFieldsSectionProps {
  title: string;
  fields: readonly JobField[];
}

const TEXT_LIMIT = 80;

export const JobFieldsSection: FC<JobFieldsSectionProps> = ({ title, fields }) => {
  const inputs = fields.map((field) => (
    <KkLaneInspector.Field
      key={field.key}
      label={field.label}
      value={field.value}
      placeholder={field.placeholder}
      maxLength={TEXT_LIMIT}
      onChange={field.change}
      onCommit={field.commit}
    />
  ));

  return <KkEjPanel.Group label={title}>{inputs}</KkEjPanel.Group>;
};
