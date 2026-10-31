import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { plateRunOf } from '../welcome-paint';

interface KkWelcomeStageDatelineProps extends PropsWithChildren {
  at: number;
}

export const KkWelcomeStageDateline: FC<KkWelcomeStageDatelineProps> = ({ at, children }) => {
  const { leaving } = useWelcomeRun();

  return (
    <Typography
      variant="caption"
      sx={{
        minWidth: 0,
        color: 'text.secondary',
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        textTransform: 'uppercase',
        ...plateRunOf('ink', at, leaving),
      }}
    >
      {children}
    </Typography>
  );
};
