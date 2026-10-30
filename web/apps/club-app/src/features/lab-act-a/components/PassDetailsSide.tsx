import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';
import type { PassActPage } from '../hooks/use-pass-act-page';
import { CLOSE_LABEL, DETAILS_LABEL } from '../pass-copy';
import { PassDetails } from './PassDetails';

interface PassDetailsSideProps {
  page: PassActPage;
}

export const PassDetailsSide: FC<PassDetailsSideProps> = ({ page }) => {
  if (!page.canDetails || page.studio === undefined) {
    return null;
  }

  return (
    <KkBottomDrawer
      open={page.isDetailsOpen}
      label={DETAILS_LABEL}
      closeLabel={CLOSE_LABEL}
      onClose={page.closeDetails}
    >
      <PassDetails
        data={page.studio}
        viewerId={page.viewerId}
        framed={false}
        onClose={page.closeDetails}
      />
    </KkBottomDrawer>
  );
};
