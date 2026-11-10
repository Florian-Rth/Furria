import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import { MANAGE_TITLE } from '../manage-hub-labels';

export const ManageHeader: FC = () => (
  <KkScreenHeader>
    <KkScreenHeader.Text>
      <KkScreenHeader.Title>{MANAGE_TITLE}</KkScreenHeader.Title>
    </KkScreenHeader.Text>
  </KkScreenHeader>
);
