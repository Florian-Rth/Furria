import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkSsTaskSentenceProps {
  text: string;
}

export const KkSsTaskSentence: FC<KkSsTaskSentenceProps> = ({ text }) => (
  <Typography
    component="p"
    variant="body2"
    data-kk-ss-task-sentence
    sx={{ flexShrink: 0, fontWeight: 700, minWidth: 0 }}
  >
    {text}
  </Typography>
);
