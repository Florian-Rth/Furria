import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkAnswerRollMetaProps {
  text: string;
}

export const KkAnswerRollMeta: FC<KkAnswerRollMetaProps> = ({ text }) => (
  <Typography
    component="li"
    variant="caption"
    data-kk-answer-roll-meta
    sx={{ color: 'text.secondary', fontWeight: 700 }}
  >
    {text}
  </Typography>
);
