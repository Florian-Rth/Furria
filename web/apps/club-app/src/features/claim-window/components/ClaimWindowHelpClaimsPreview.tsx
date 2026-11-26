import { KkPanel } from '@furria/ui/KkPanel';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toClaimMeta } from '../claim-window-copy';

const SAMPLE_DONE = {
  initials: 'GH',
  name: 'Gisela Hahn',
  meta: toClaimMeta('Sa., 14.11., 19:42 Uhr', true),
};

const SAMPLE_OPEN = {
  initials: 'WK',
  name: 'Werner Kunz',
  meta: toClaimMeta('Sa., 14.11., 20:05 Uhr', false),
};

export const ClaimWindowHelpClaimsPreview: FC = () => (
  <KkPanel>
    <KkPersonRow initials={SAMPLE_DONE.initials} name={SAMPLE_DONE.name} meta={SAMPLE_DONE.meta} />
    <KkPersonRow
      initials={SAMPLE_OPEN.initials}
      name={SAMPLE_OPEN.name}
      meta={SAMPLE_OPEN.meta}
      dimmed
    />
  </KkPanel>
);
