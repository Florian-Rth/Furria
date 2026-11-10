import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toClaimMeta, WINDOW_CLAIMS_TITLE, WINDOW_NO_CLAIMS } from '../claim-window-copy';
import { formatWindowMoment } from '../claim-window-format';
import type { WindowClaimSummary } from '../schemas';

interface ClaimWindowClaimListProps {
  claims: readonly WindowClaimSummary[];
}

export const ClaimWindowClaimList: FC<ClaimWindowClaimListProps> = ({ claims }) => {
  const rows = claims.map((claim) => (
    <KkPersonRow
      key={claim.personId}
      initials={toInitials(claim.firstName, claim.lastName)}
      name={`${claim.firstName} ${claim.lastName}`}
      meta={toClaimMeta(formatWindowMoment(claim.claimedAt), claim.hasAccount)}
      dimmed={!claim.hasAccount}
    />
  ));
  const body = claims.length === 0 ? <KkNote tone="muted">{WINDOW_NO_CLAIMS}</KkNote> : rows;

  return (
    <KkPanelSection title={WINDOW_CLAIMS_TITLE}>
      <KkPanel>{body}</KkPanel>
    </KkPanelSection>
  );
};
