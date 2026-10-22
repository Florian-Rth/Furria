import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_ORIGIN } from '@/features/session/app-sections';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { toAlbumErrorMessage } from '../album-form-messages';
import { BIN_LEAD, BIN_TITLE } from '../gallery-copy';
import { useGalleryBin } from '../hooks/use-gallery-bin';
import { GalleryBinBody } from './GalleryBinBody';

const FAILURE_TITLE = 'PAPIERKORB NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';
const LOADING_LABEL = 'Papierkorb wird geladen';

export const GalleryBinPage: FC = () => {
  const control = useGalleryBin();
  const errorMessage = toAlbumErrorMessage(control.error);
  const retry = (
    <KkButton loading={control.reloading} onClick={control.reload}>
      {RETRY_LABEL}
    </KkButton>
  );
  const failure =
    errorMessage === null ? null : (
      <KkErrorState title={FAILURE_TITLE} description={errorMessage} action={retry} />
    );
  const content =
    control.bin === undefined ? (
      (failure ?? <AppListSkeleton label={LOADING_LABEL} listShape="cards" />)
    ) : (
      <GalleryBinBody bin={control.bin} control={control} />
    );

  return (
    <KkScreen
      kind="working"
      title={BIN_TITLE}
      origin={GALLERY_ORIGIN}
      action={control.action}
      header={<KkTitleHeader title={BIN_TITLE} lead={BIN_LEAD} />}
      handover={AREA_HANDOVERS.gallery}
    >
      {content}
    </KkScreen>
  );
};
