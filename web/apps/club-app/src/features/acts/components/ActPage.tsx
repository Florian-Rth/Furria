import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { ActHubOutline } from '@/features/act-hub/components/ActHubOutline';
import { ActHubScreen } from '@/features/act-hub/components/ActHubScreen';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { useActHubPage } from '../hooks/use-act-hub-page';
import type { ActPageSearch } from '../schemas';
import { ActLoadGate } from './ActLoadGate';

interface ActPageProps {
  actId: string;
  search: ActPageSearch;
}

export const ActPage: FC<ActPageProps> = ({ actId, search }) => {
  const page = useActHubPage(actId, search);
  useStudioVisit(page.actId);
  const data = page.load.query.data;
  const studio = data?.studio ?? null;
  const outline =
    data === undefined ? null : (
      <KkScreen kind="detail" title={page.title} origin={page.origin} actions={page.outlineActions}>
        <ActHubOutline data={data} />
      </KkScreen>
    );
  const hub =
    data === undefined || studio === null ? (
      outline
    ) : (
      <ActHubScreen
        data={data}
        studio={studio}
        search={page.search}
        viewerId={page.viewerId}
        title={page.title}
        origin={page.origin}
      />
    );

  return (
    <ActLoadGate load={page.load} title={page.title} origin={page.origin}>
      {hub}
    </ActLoadGate>
  );
};
