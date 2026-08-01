import Chip from '@mui/material/Chip';
import type { FC } from 'react';
import type { MatcherRecruitingBadge } from '@/features/group-matcher/matcher-content';

interface MatcherRecruitingChipProps {
  badge: MatcherRecruitingBadge;
}

export const MatcherRecruitingChip: FC<MatcherRecruitingChipProps> = ({ badge }) => (
  <Chip size="small" variant="outlined" color={badge.color} label={badge.label} />
);
