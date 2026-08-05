import { kkTokens } from '@furria/ui';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildWhyLabel } from '@/features/group-matcher/matcher-content';
import type { MatcherMatchView } from '../logic/matcher-result';
import { MatcherWhyList } from './MatcherWhyList';

interface MatcherWhyPanelProps {
  match: MatcherMatchView;
}

export const MatcherWhyPanel: FC<MatcherWhyPanelProps> = ({ match }) => {
  const whyLabel = buildWhyLabel(match.group.name);

  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        borderTop: `${kkTokens.line.hair}px solid`,
        borderColor: 'divider',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">{whyLabel}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {match.group.tagline}
          </Typography>
          <Typography variant="body2">{match.badge.note}</Typography>
          <MatcherWhyList reasons={match.reasons} groupName={match.group.name} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
