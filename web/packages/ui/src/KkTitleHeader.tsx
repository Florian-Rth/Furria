import type { FC, ReactNode } from 'react';
import { KkLead } from './KkLead';
import { KkScreenHeader } from './KkScreenHeader/KkScreenHeader';

interface KkTitleHeaderProps {
  title: string;
  lead?: ReactNode;
}

export const KkTitleHeader: FC<KkTitleHeaderProps> = ({ title, lead }) => {
  const leadLine = lead === undefined ? null : <KkLead>{lead}</KkLead>;

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkScreenHeader.Title>{title}</KkScreenHeader.Title>
        {leadLine}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
