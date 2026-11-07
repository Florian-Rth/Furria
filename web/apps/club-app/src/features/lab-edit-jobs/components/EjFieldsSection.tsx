import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { EjField } from '../edit-jobs-view';

interface EjFieldsSectionProps {
  title: string;
  fields: readonly EjField[];
}

const TEXT_LIMIT = 80;

export const EjFieldsSection: FC<EjFieldsSectionProps> = ({ title, fields }) => {
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
