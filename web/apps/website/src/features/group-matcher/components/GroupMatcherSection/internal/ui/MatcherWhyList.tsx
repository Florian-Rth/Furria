import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MatchReason } from '@/features/group-matcher/match-reasons';
import { MatcherWhyRow } from './MatcherWhyRow';

interface MatcherWhyListProps {
  reasons: MatchReason[];
  groupName: string;
}

export const MatcherWhyList: FC<MatcherWhyListProps> = ({ reasons, groupName }) => (
  <Stack sx={{ gap: 1.5 }}>
    {reasons.map((reason) => (
      <MatcherWhyRow key={reason.questionId} reason={reason} groupName={groupName} />
    ))}
  </Stack>
);
