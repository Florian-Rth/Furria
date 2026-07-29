import Chip from '@mui/material/Chip';
import type { FC } from 'react';
import type { KompassRecruitingBadge } from '@/features/group-matcher/kompass-content';

interface KompassRecruitingChipProps {
  badge: KompassRecruitingBadge;
}

export const KompassRecruitingChip: FC<KompassRecruitingChipProps> = ({ badge }) => (
  <Chip size="small" variant="outlined" color={badge.color} label={badge.label} />
);
