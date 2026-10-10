import { KkPhotoPlaceholder } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';

interface NewsPlaceholderPhotoProps {
  label: string;
}

export const NewsPlaceholderPhoto: FC<NewsPlaceholderPhotoProps> = ({ label }) => {
  const theme = useTheme();

  return (
    <KkPhotoPlaceholder label={label} tint={(theme.vars ?? theme).palette.text.primary} fill />
  );
};
