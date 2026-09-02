import { KkNote, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { ExchangeIdeaItem } from '@/features/events/exchange-content';

interface ExchangeOpenQuestionRowProps {
  question: ExchangeIdeaItem;
}

export const ExchangeOpenQuestionRow: FC<ExchangeOpenQuestionRowProps> = ({ question }) => (
  <Stack
    data-kk-exchange-open-question-row
    sx={{
      gap: 0.75,
      py: 2,
      borderTop: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
    }}
  >
    <Typography variant="h5" component="h3">
      {question.title}
    </Typography>
    <KkNote>{question.description}</KkNote>
  </Stack>
);
