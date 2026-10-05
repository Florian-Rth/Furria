import { KkHubRow, KkNote, KkPanel, KkPanelSection, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import { useInvitationRoundPreviewQuery } from '../api';
import { ACCESS_PANEL_TITLE, toAccessRows } from '../invitation-round-labels';
import type { ManageAccountsPanel } from '../schemas';
import { InvitationRoundAction } from './InvitationRoundAction';

const PERSONS_ROUTE = '/manage/persons';
const PREVIEW_FAILED_NOTE = 'Die Zahlen für Alle einladen und Erinnern sind gerade nicht abrufbar.';
const ROUND_SKELETON_ROWS = 2;
const ACCESS_LANDING = 'access';

interface ManageAccessPanelProps {
  accounts: ManageAccountsPanel;
}

export const ManageAccessPanel: FC<ManageAccessPanelProps> = ({ accounts }) => {
  const preview = useInvitationRoundPreviewQuery();
  const { highlightedKey } = useLanding();
  const isLanded = highlightedKey === ACCESS_LANDING;

  const rows = toAccessRows(accounts).map((row) => (
    <KkHubRow
      key={row.id}
      label={row.label}
      icon={row.icon}
      meta={row.meta}
      hint={row.hint}
      hintTone="gold"
      component={Link}
      to={PERSONS_ROUTE}
      search={{ access: row.id }}
    />
  ));

  const rounds =
    preview.data === undefined ? (
      <KkSkeletonRow count={ROUND_SKELETON_ROWS} shape="select" />
    ) : (
      <Stack sx={{ minWidth: 0, gap: 1.25 }}>
        <InvitationRoundAction kind="invite" preview={preview.data} />
        <InvitationRoundAction kind="remind" preview={preview.data} />
      </Stack>
    );

  const roundsBlock =
    preview.error !== null && preview.data === undefined ? (
      <KkNote tone="hint" icon="info">
        {PREVIEW_FAILED_NOTE}
      </KkNote>
    ) : (
      rounds
    );

  return (
    <KkPanelSection title={ACCESS_PANEL_TITLE}>
      <KkPanel highlight={isLanded} landing={ACCESS_LANDING}>
        {rows}
      </KkPanel>
      {roundsBlock}
    </KkPanelSection>
  );
};
