import { toImageSource } from '@furria/ui/image-source';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkDensePanelSkeleton } from '@furria/ui/KkDensePanelSkeleton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPassHead } from '@furria/ui/KkPassHead';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toGroupTone } from '@/features/groups/group-identity';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { toInitials } from '@/lib/initials';
import { usePassGroupPage } from '../hooks/use-pass-group-page';
import {
  GROUP_DENIED_MESSAGE,
  GROUP_HUB_LINK,
  GROUP_HUB_LINK_META,
  GROUP_LOAD_FAILED,
} from '../pass-copy';
import { GROUP_HUB_PATH, PASS_GROUP_ORIGIN } from '../pass-paths';
import { PassGroupActs } from './PassGroupActs';

const GROUP_LOADING_LABEL = 'Gruppe wird geladen';
const AVATAR_SIZES = '3.5rem';

interface PassGroupPageProps {
  groupId: string;
}

export const PassGroupPage: FC<PassGroupPageProps> = ({ groupId }) => {
  const page = usePassGroupPage(groupId);

  if (page.status === 'notFound') {
    return <ScreenNotFound />;
  }
  if (page.status === 'forbidden') {
    return (
      <AccessDeniedScreen
        title={page.title}
        origin={PASS_GROUP_ORIGIN}
        message={GROUP_DENIED_MESSAGE}
      />
    );
  }

  const hub = page.hub;
  const failure =
    page.status === 'failed' ? (
      <KkRetryAlert message={GROUP_LOAD_FAILED} retrying={page.retrying} onRetry={page.retry} />
    ) : null;

  if (hub === undefined) {
    return (
      <KkScreen kind="detail" title={page.title} origin={PASS_GROUP_ORIGIN}>
        {failure}
        <AppSkeletonRegion label={GROUP_LOADING_LABEL}>
          <KkDensePanelSkeleton />
        </AppSkeletonRegion>
      </KkScreen>
    );
  }

  const media = (
    <KkAvatar
      initials={toInitials(hub.name, '')}
      image={toImageSource(hub.picture, 'groupPicture', AVATAR_SIZES)}
      tone={toGroupTone(hub.groupId, hub.tone)}
      size="large"
    />
  );
  const hubPath = GROUP_HUB_PATH.replace('$groupId', String(hub.groupId));

  return (
    <KkScreen kind="detail" title={page.title} origin={PASS_GROUP_ORIGIN}>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <KkPassHead title={hub.name} meta={page.meta} media={media} />
        <PassGroupActs page={page} />
        <KkPanel variant="list">
          <KkHubRow
            label={GROUP_HUB_LINK}
            icon="group"
            meta={GROUP_HUB_LINK_META}
            component={Link}
            to={hubPath}
          />
        </KkPanel>
      </Stack>
    </KkScreen>
  );
};
