import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';

interface KkNewsTieCtaProps {
  label: string;
}

export const KkNewsTieCta: FC<KkNewsTieCtaProps> = ({ label }) => (
  <Typography
    component="span"
    variant="body2"
    data-kk-news-tie-cta
    sx={(theme) => ({ ...redInk(theme), fontWeight: 800 })}
  >
    {label}
  </Typography>
);
