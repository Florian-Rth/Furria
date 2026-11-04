import type { FC } from 'react';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { HALL_BUILDER_TITLE } from '../hall-builder-copy';
import type { HallBuilderSearch } from '../hall-builder-search';
import { HALL_PERMISSION_KEYS } from '../hall-permission';
import { useHallBuilderPage } from '../hooks/use-hall-builder-page';
import { HallBuilderLoad } from './HallBuilderLoad';

interface HallBuilderPageProps {
  hallId: string;
  search: HallBuilderSearch;
}

export const HallBuilderPage: FC<HallBuilderPageProps> = ({ hallId, search }) => {
  const page = useHallBuilderPage(hallId, search);

  if (page.hallId === null) {
    return <ScreenNotFound />;
  }

  return (
    <RequireAnyScreenPermission
      permissionKeys={HALL_PERMISSION_KEYS}
      title={HALL_BUILDER_TITLE}
      origin={page.origin}
    >
      <HallBuilderLoad page={page} />
    </RequireAnyScreenPermission>
  );
};
