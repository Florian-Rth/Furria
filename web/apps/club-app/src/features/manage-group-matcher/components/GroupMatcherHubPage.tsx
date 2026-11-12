import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { HUB_TITLE } from '../group-matcher-hub-copy';
import { GroupMatcherHubBody } from './GroupMatcherHubBody';

const header = <KkTitleHeader title={HUB_TITLE} />;

export const GroupMatcherHubPage: FC = () => (
  <KkScreen
    kind="list"
    title={HUB_TITLE}
    origin={MANAGE_ORIGIN}
    header={header}
    handover={AREA_HANDOVERS.manage}
  >
    <RequirePermission permissionKey={PERMISSION_KEYS.groupMatcherManage}>
      <GroupMatcherHubBody />
    </RequirePermission>
  </KkScreen>
);
