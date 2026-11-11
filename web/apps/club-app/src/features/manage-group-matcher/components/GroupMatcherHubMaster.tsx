import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CoverageSection } from './CoverageSection';
import { ProposalQueueSection } from './ProposalQueueSection';
import { StatementPoolSection } from './StatementPoolSection';

export const GroupMatcherHubMaster: FC = () => (
  <Stack sx={{ gap: 3, minWidth: 0 }}>
    <ProposalQueueSection />
    <StatementPoolSection />
    <CoverageSection />
  </Stack>
);
