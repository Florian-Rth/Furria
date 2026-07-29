import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MatchReason } from '@/features/group-matcher/match-reasons';
import { KompassWhyRow } from './KompassWhyRow';

interface KompassWhyListProps {
  reasons: MatchReason[];
  groupName: string;
}

export const KompassWhyList: FC<KompassWhyListProps> = ({ reasons, groupName }) => (
  <Stack sx={{ gap: 1.5 }}>
    {reasons.map((reason) => (
      <KompassWhyRow key={reason.questionId} reason={reason} groupName={groupName} />
    ))}
  </Stack>
);
