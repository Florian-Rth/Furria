import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { LabDraftLink } from '../lab-drafts';

interface LabDraftRowProps {
  link: LabDraftLink;
}

const ICONS = { act: 'stage', group: 'group' } as const;

export const LabDraftRow: FC<LabDraftRowProps> = ({ link }) => (
  <KkHubRow
    label={link.label}
    icon={ICONS[link.kind]}
    meta={link.meta}
    component={Link}
    to={link.to}
  />
);
