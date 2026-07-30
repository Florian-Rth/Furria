import { kkTokens } from '@furria/ui';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { JoinFaqEntry } from '@/features/membership/faq-content';
import { buildFaqPanelId, buildFaqQuestionId } from '@/features/membership/faq-content';

interface JoinFaqItemProps {
  entry: JoinFaqEntry;
}

export const JoinFaqItem: FC<JoinFaqItemProps> = ({ entry }) => {
  const questionId = buildFaqQuestionId(entry.id);
  const panelId = buildFaqPanelId(entry.id);

  return (
    <Accordion
      square
      disableGutters
      elevation={0}
      data-kk-join-faq-item
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
        <Typography variant="h5" component="span">
          {entry.question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '40rem', textWrap: 'pretty' }}
        >
          {entry.answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};
