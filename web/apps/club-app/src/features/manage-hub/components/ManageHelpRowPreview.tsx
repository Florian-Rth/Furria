import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';

const SAMPLE_BOARD = {
  label: 'Vorstand',
  meta: '6 Funktionen · 5 Sitze besetzt',
  hint: '1 unbesetzt',
} as const;

const SAMPLE_KEYS = { label: 'Schlüssel', hint: 'Noch leer' } as const;

export const ManageHelpRowPreview: FC = () => (
  <KkPanel>
    <KkHubRow
      label={SAMPLE_BOARD.label}
      icon="board"
      meta={SAMPLE_BOARD.meta}
      hint={SAMPLE_BOARD.hint}
      hintTone="gold"
      dimWhenInert={false}
    />
    <KkHubRow label={SAMPLE_KEYS.label} icon="key" hint={SAMPLE_KEYS.hint} dimWhenInert={false} />
  </KkPanel>
);
