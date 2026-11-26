import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { useBeerHubEntry } from '@/features/manage-beer-list/hooks/use-beer-hub-entry';
import { MORE_ORIGIN } from '@/features/session/app-sections';
import { BEER_LIST_TITLE } from '../beer-list-copy';
import { useBeerListHelpViewer } from '../hooks/use-beer-list-help-viewer';
import { useBeerListPage } from '../hooks/use-beer-list-page';
import { BeerListBody } from './BeerListBody';
import { BeerListHelp } from './BeerListHelp';
import { BeerListPending } from './BeerListPending';

export const BeerListPage: FC = () => {
  const page = useBeerListPage();
  const actions = useBeerHubEntry();
  const helpViewer = useBeerListHelpViewer(page);
  const help = toScreenHelp(<BeerListHelp viewer={helpViewer} />);
  const body =
    page.load.state === 'ready' ? (
      <BeerListBody page={page} />
    ) : (
      <BeerListPending load={page.load} />
    );

  return (
    <KkScreen
      kind="detail"
      title={BEER_LIST_TITLE}
      origin={MORE_ORIGIN}
      actions={actions}
      help={help}
    >
      {body}
    </KkScreen>
  );
};
