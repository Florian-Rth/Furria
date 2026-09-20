import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { MORE_SECTION } from '@/features/session';
import { MANAGE_TITLE } from '../manage-hub-labels';
import { ManageBody } from './ManageBody';
import { ManageHeader } from './ManageHeader';

export const ManagePage: FC = () => (
  <KkScreen
    kind="overview"
    section={MORE_SECTION}
    title={MANAGE_TITLE}
    header={<ManageHeader />}
    headerKind="title"
  >
    <ManageBody />
  </KkScreen>
);
