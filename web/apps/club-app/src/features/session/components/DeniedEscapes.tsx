import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { START_PRACTICE_SHEET } from '@/features/start/start-sheets';
import { START_PATH } from '../app-sections';
import { useDeniedEscapes } from '../hooks/use-denied-escapes';
import { DENIED_MY_ACTS_LABEL, DENIED_START_LABEL } from '../session-messages';

const MY_ACTS_SEARCH = { sheet: START_PRACTICE_SHEET } as const;

export const DeniedEscapes: FC = () => {
  const { showsMyActs } = useDeniedEscapes();
  const myActsLink = showsMyActs ? (
    <KkButton variant="text" component={Link} to={START_PATH} search={MY_ACTS_SEARCH}>
      {DENIED_MY_ACTS_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KkButton variant="outlined" component={Link} to={START_PATH}>
        {DENIED_START_LABEL}
      </KkButton>
      {myActsLink}
    </Stack>
  );
};
