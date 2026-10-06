import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubMailButton } from '@/components/ClubMailButton';
import { matcherApplyHref, matcherResultLabels } from '@/features/group-matcher/matcher-content';
import { MatcherResultActions } from '../layout/MatcherResultActions';
import type { MatcherExclusionView } from '../logic/matcher-result';
import { MatcherExcludedList } from './MatcherExcludedList';

interface MatcherResultEmptyProps {
  excluded: MatcherExclusionView[];
}

export const MatcherResultEmpty: FC<MatcherResultEmptyProps> = ({ excluded }) => (
  <>
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="h2" component="p">
        {matcherResultLabels.emptyTitle}
      </Typography>
      <Typography variant="body1">{matcherResultLabels.emptyText}</Typography>
    </Stack>
    <MatcherExcludedList excluded={excluded} />
    <MatcherResultActions>
      <ClubMailButton variant="contained" color="primary" size="large">
        {matcherResultLabels.emptyMailCta}
      </ClubMailButton>
      <Button component={RouterLink} to={matcherApplyHref} variant="outlined" size="large">
        {matcherResultLabels.emptyApplyCta}
      </Button>
    </MatcherResultActions>
  </>
);
