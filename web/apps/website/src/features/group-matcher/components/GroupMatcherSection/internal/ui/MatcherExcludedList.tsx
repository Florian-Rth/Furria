import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherResultLabels } from '@/features/group-matcher/matcher-content';
import type { MatcherExclusionView } from '../logic/matcher-result';

interface MatcherExcludedListProps {
  excluded: MatcherExclusionView[];
}

export const MatcherExcludedList: FC<MatcherExcludedListProps> = ({ excluded }) => {
  if (excluded.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="subtitle2">{matcherResultLabels.excludedTitle}</Typography>
      {excluded.map((exclusion) => (
        <Stack key={exclusion.group.id} sx={{ gap: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {exclusion.group.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {exclusion.reason}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};
