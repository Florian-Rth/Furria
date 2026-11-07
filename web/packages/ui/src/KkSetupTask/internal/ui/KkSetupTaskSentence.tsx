import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkSetupTaskSentenceProps {
  text: string;
}

export const KkSetupTaskSentence: FC<KkSetupTaskSentenceProps> = ({ text }) => (
  <Typography
    component="p"
    variant="body2"
    data-kk-setup-task-sentence
    sx={{ flexShrink: 0, fontWeight: 700, minWidth: 0 }}
  >
    {text}
  </Typography>
);
