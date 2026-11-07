import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { ActHubOutline } from '@/features/act-hub/components/ActHubOutline';
import { ActHubScreen } from '@/features/act-hub/components/ActHubScreen';
import { useStudioVisit } from '@/features/act-studio/hooks/use-studio-visit';
import { useActPage } from '../hooks/use-act-page';
import type { ActPageSearch } from '../schemas';
import { ActLoadGate } from './ActLoadGate';
import { ActPageBody } from './ActPageBody';

interface ActPageProps {
  actId: string;
  search: ActPageSearch;
}

export const ActPage: FC<ActPageProps> = ({ actId, search }) => {
  const page = useActPage(actId, search);
  useStudioVisit(page.actId);
  const data = page.query.data;
  const studio = data?.studio ?? null;
  const details = (
    <KkScreen kind="detail" title={page.title} origin={page.origin} actions={page.actions}>
      <ActPageBody page={page} />
    </KkScreen>
  );
  const outline =
    data === undefined ? null : (
      <KkScreen kind="detail" title={page.title} origin={page.origin} actions={page.actions}>
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
  const screen = page.mode === 'details' ? details : hub;

  return (
    <ActLoadGate load={page.load} title={page.title} origin={page.origin}>
      {screen}
    </ActLoadGate>
  );
};
