import { KkLead, kkTokens } from '@furria/ui';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { EventsFaqEntry } from '@/features/events/faq-content';
import { buildEventsFaqPanelId, buildEventsFaqQuestionId } from '@/features/events/faq-content';

interface EventsFaqItemProps {
  entry: EventsFaqEntry;
}

export const EventsFaqItem: FC<EventsFaqItemProps> = ({ entry }) => {
  const questionId = buildEventsFaqQuestionId(entry.id);
  const panelId = buildEventsFaqPanelId(entry.id);

  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      data-kk-events-faq-item
      sx={{
        bgcolor: 'transparent',
        borderTop: `${kkTokens.line.hair}px solid`,
        borderColor: 'divider',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary
        id={questionId}
        aria-controls={panelId}
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        sx={{ py: 1 }}
      >
        <Typography variant="h3" component="span">
          {entry.question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails id={panelId} role="region" aria-labelledby={questionId}>
        <KkLead>{entry.answer}</KkLead>
      </AccordionDetails>
    </Accordion>
  );
};
