import { KkEyebrow, KkLead, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { MANAGE_EYEBROW, MANAGE_LEAD, MANAGE_TITLE } from '../manage-hub-labels';

export const ManageHeader: FC = () => (
  <KkScreenHeader>
    <KkScreenHeader.Text>
      <KkEyebrow tone="accent">{MANAGE_EYEBROW}</KkEyebrow>
      <KkScreenHeader.Title>{MANAGE_TITLE}</KkScreenHeader.Title>
      <KkLead>{MANAGE_LEAD}</KkLead>
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
