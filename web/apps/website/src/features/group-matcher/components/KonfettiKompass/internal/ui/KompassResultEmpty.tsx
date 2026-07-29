import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { APPLY_PATH } from '@/features/group-matcher/apply-handoff';
import { kompassMailHref, kompassResultLabels } from '@/features/group-matcher/kompass-content';
import { KompassResultActions } from '../layout/KompassResultActions';
import type { KompassExclusionView } from '../logic/kompass-result';
import { KompassExcludedList } from './KompassExcludedList';

interface KompassResultEmptyProps {
  excluded: KompassExclusionView[];
}

export const KompassResultEmpty: FC<KompassResultEmptyProps> = ({ excluded }) => (
  <>
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="h3" component="p">
        {kompassResultLabels.emptyTitle}
      </Typography>
      <Typography variant="body1">{kompassResultLabels.emptyText}</Typography>
    </Stack>
    <KompassExcludedList excluded={excluded} />
    <KompassResultActions>
      <Button href={kompassMailHref} variant="contained" color="primary" size="large">
        {kompassResultLabels.emptyMailCta}
      </Button>
      <Button href={APPLY_PATH} variant="outlined" size="large">
        {kompassResultLabels.emptyApplyCta}
      </Button>
    </KompassResultActions>
  </>
);
