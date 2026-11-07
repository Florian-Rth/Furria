import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkEditorHeadTitleProps {
  text: string;
}

export const KkEditorHeadTitle: FC<KkEditorHeadTitleProps> = ({ text }) => (
  <Typography
    component="p"
    variant="body2"
    noWrap
    title={text}
    sx={{ fontWeight: 800, lineHeight: 1.15, minWidth: 0 }}
  >
    {text}
  </Typography>
);
