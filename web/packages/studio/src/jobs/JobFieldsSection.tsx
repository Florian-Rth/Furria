import type { JobField } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
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

  return <KkJobPanel.Group label={title}>{inputs}</KkJobPanel.Group>;
};
