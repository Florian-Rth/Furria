import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { SETTINGS_TITLE } from '../act-page-copy';
import { CLOSE_LABEL } from '../acts-copy';
import type { ActPageState } from '../hooks/use-act-page';
import { ActPane } from './ActPane';

const PANE_SPAN = 5;

interface ActSettingsSideProps {
  page: ActPageState;
  act: CatalogueAct;
}

const keepPage = (): void => undefined;

export const ActSettingsSide: FC<ActSettingsSideProps> = ({ page, act }) => {
  if (!page.isSettingsOpen) {
    return null;
  }

  const pane = (
    <ActPane
      key={act.actId}
      act={act}
      acts={page.acts}
      fixedGroupId={page.fixedGroupId}
      framed={page.isWide}
      onCreated={keepPage}
      onClose={page.closeSettings}
    />
  );

  if (!page.isWide) {
    return (
      <KkBottomDrawer
        open
        label={SETTINGS_TITLE}
        closeLabel={CLOSE_LABEL}
        onClose={page.closeSettings}
      >
        {pane}
      </KkBottomDrawer>
    );
  }

  return <KkMasterDetail.Detail span={PANE_SPAN}>{pane}</KkMasterDetail.Detail>;
};
