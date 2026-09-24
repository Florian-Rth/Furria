import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { displayTitle } from './internal/display-title';
import { KkBroomMark } from './KkBroomMark';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkEmptyStateSize = 'panel' | 'page';

const MARK_SIZE = 56;

interface KkEmptyStateProps {
  title: string;
  description: string;
  size?: KkEmptyStateSize;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkEmptyState: FC<KkEmptyStateProps> = ({
  title,
  description,
  size = 'page',
  action,
  sx,
}) => {
  const isPanel = size === 'panel';
  const mark = isPanel ? null : <KkBroomMark size={MARK_SIZE} sx={{ color: 'text.disabled' }} />;
  const headline = isPanel ? null : (
    <Typography component="h2" sx={{ ...displayTitle, textWrap: 'balance' }}>
      {title}
    </Typography>
  );

  return (
    <Stack
      data-kk-empty-state
      data-kk-empty-state-size={size}
      sx={[
        {
          alignItems: 'center',
          textAlign: 'center',
          gap: isPanel ? 0.75 : 1.25,
          minWidth: 0,
          px: 2.75,
          py: isPanel ? 2 : 3,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {mark}
      {headline}
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: kkTokens.measure.empty, textWrap: 'pretty' }}
      >
        {description}
      </Typography>
      {action}
    </Stack>
  );
};
