import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface GroupKindHeadingProps {
  title: string | null;
}

export const GroupKindHeading: FC<GroupKindHeadingProps> = ({ title }) => {
  if (title === null) {
    return null;
  }

  return (
    <Typography variant="h3" component="h3">
      {title}
    </Typography>
  );
};
