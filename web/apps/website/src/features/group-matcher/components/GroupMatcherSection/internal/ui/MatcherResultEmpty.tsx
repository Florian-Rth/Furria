import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { APPLY_PATH } from '@/features/group-matcher/apply-handoff';
import { matcherMailHref, matcherResultLabels } from '@/features/group-matcher/matcher-content';
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
      <Button href={matcherMailHref} variant="contained" color="primary" size="large">
        {matcherResultLabels.emptyMailCta}
      </Button>
      <Button component={RouterLink} to={APPLY_PATH} variant="outlined" size="large">
        {matcherResultLabels.emptyApplyCta}
      </Button>
    </MatcherResultActions>
  </>
);
