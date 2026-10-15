import { KkRetryAlert, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useInvitationRoundPreviewQuery } from '../api';
import { INVITATION_ROUND_KINDS, toInvitationRoundEmphasis } from '../invitation-round-labels';
import type { PersonAccessFilter } from '../person-access-filter';
import { InvitationRoundAction } from './InvitationRoundAction';

const PREVIEW_FAILED_NOTE = 'Die Zahlen für Alle einladen und Erinnern sind gerade nicht abrufbar.';
const PREVIEW_RETRY_LABEL = 'Erneut laden';

interface PersonsInvitationRoundsProps {
  filter: PersonAccessFilter | null;
}

export const PersonsInvitationRounds: FC<PersonsInvitationRoundsProps> = ({ filter }) => {
  const preview = useInvitationRoundPreviewQuery();

  const reloadPreview = (): void => {
    void preview.refetch();
  };

  if (preview.data !== undefined) {
    const previewData = preview.data;
    const rounds = INVITATION_ROUND_KINDS.map((kind) => (
      <InvitationRoundAction
        key={kind}
        kind={kind}
        preview={previewData}
        emphasis={toInvitationRoundEmphasis(kind, filter)}
      />
    ));

    return <Stack sx={{ minWidth: 0, gap: 1.25 }}>{rounds}</Stack>;
  }
  if (preview.error !== null) {
    return (
      <KkRetryAlert
        severity="warning"
        message={PREVIEW_FAILED_NOTE}
        retrying={preview.isFetching}
        onRetry={reloadPreview}
        retryLabel={PREVIEW_RETRY_LABEL}
      />
    );
  }

  return <KkSkeletonRow count={INVITATION_ROUND_KINDS.length} shape="select" />;
};
