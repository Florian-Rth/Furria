import { KkLead, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_LEAD, MANAGE_TITLE } from '../manage-hub-labels';

export const ManageHeader: FC = () => (
  <KkScreenHeader>
    <KkScreenHeader.Text>
      <KkScreenHeader.Title>{MANAGE_TITLE}</KkScreenHeader.Title>
      <KkLead>{MANAGE_LEAD}</KkLead>
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
